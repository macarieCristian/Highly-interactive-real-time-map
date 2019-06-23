package ro.licence.cristian.controller.websocket_endpoint;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.dto.websocket_dto.MarkerEventDto;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;
import ro.licence.cristian.business.dto.websocket_dto.StandardMessageDto;
import ro.licence.cristian.business.dto.websocket_dto.enums.EventType;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.service.*;
import ro.licence.cristian.business.service.websocket_service.EventChatRoomService;
import ro.licence.cristian.persistence.repository.projection.AppUserWithScanAreasProjection;

import java.util.List;
import java.util.Set;

@Log4j2
@Controller
@RequiredArgsConstructor
public class WebSocketController {
    private final SimpMessagingTemplate template;
    private final ChatService chatService;
    private final EventChatRoomService eventChatRoomService;
    private final UserService userService;
    private final EventService eventService;
    private final EmailUtilService emailUtilService;
    private final NotificationService notificationService;

    @MessageMapping("/broadcast/send")
    @SendTo("/topic/broadcast")
    public StandardMessageDto greeting(StandardMessageDto message) {
        return message;
    }

    @MessageMapping("/broadcast/marker-events/send")
    @SendTo("/topic/broadcast/marker-events")
    public Set<MarkerEventDto> handleMarkerEvent(Set<MarkerEventDto> markerEventDtos) {
        return markerEventDtos;
    }

    @MessageMapping("/private/send")
    public void specific(SimpleMessageDto message) {
        chatService.persistMessage(message);
        template.convertAndSendToUser(message.getDestination(), "/queue/private/", message);
    }

    @MessageMapping("/private/chat-room/send")
    public void specificChatRoom(SimpleMessageDto message) {
        if (message.getEventType().equals(EventType.CHAT_ROOM_NEW_PARTICIPANT)) {
            eventChatRoomService.handleNewParticipant(message.getDestination(), message.getSource());
        } else if (message.getEventType().equals(EventType.CHAT_ROOM_PARTICIPANT_LEFT)) {
            eventChatRoomService.handleParticipantLeft(message.getDestination(), message.getSource());
        } else {
            Set<String> participants =
                    eventChatRoomService.getActiveParticipants(message.getDestination(), message.getSource());
            participants.forEach(participant ->
                    template.convertAndSendToUser(participant, "/queue/private/", message));
            chatService.persistEventMessage(message);
        }
    }

    @MessageMapping("/private/notification/send")
    public void specificNotification(SimpleMessageDto message) {
        if (message.getEventType().equals(EventType.NOTIFICATION_NEW_EVENT)) {
            try {
                EventDto eventDto = eventService.getEventByIdWithProfilePicLoaded(Long.parseLong(message.getMessage()));
                LocationDto locationDto = eventDto.getLocation();
                List<AppUserWithScanAreasProjection> receivers =
                        userService.getAppUserWithScanAreasIncludingPoint(
                                locationDto.getLatitude(),
                                locationDto.getLongitude(),
                                message.getSource());
                receivers.forEach(receiver -> {
                    message.setMessage(notificationService
                            .getTextNotificationEventAdded(eventDto.getName(), receiver.getScanAreas()));
                    template.convertAndSendToUser(receiver.getUsername(), "/queue/private/", message);
                });
                emailUtilService.sendEmailEventAdded(receivers, eventDto);
            } catch (BusinessException e) {
                log.error("Could not load event");
            }

            // send notification
            eventChatRoomService.handleNewParticipant(message.getDestination(), message.getSource());
        }
    }


}
