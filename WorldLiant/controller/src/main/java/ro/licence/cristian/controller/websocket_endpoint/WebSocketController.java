package ro.licence.cristian.controller.websocket_endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import ro.licence.cristian.business.dto.websocket_dto.MarkerEventDto;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;
import ro.licence.cristian.business.dto.websocket_dto.StandardMessageDto;
import ro.licence.cristian.business.service.ChatService;

import java.util.Set;

@Controller
public class WebSocketController {
    private SimpMessagingTemplate template;
    private ChatService chatService;

    @Autowired
    public WebSocketController(SimpMessagingTemplate template, ChatService chatService) {
        this.template = template;
        this.chatService = chatService;
    }

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
        template.convertAndSendToUser(message.getDestination(), "/queue/private/", message);
        chatService.persistMessage(message);
    }

}
