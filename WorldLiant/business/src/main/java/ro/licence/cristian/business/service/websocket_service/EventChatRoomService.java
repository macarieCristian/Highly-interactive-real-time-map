package ro.licence.cristian.business.service.websocket_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.licence.cristian.persistence.repository.websocket_repository.EventChatRoomRepository;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EventChatRoomService {

    private EventChatRoomRepository eventChatRoomRepository;

    @Autowired
    public EventChatRoomService(EventChatRoomRepository eventChatRoomRepository) {
        this.eventChatRoomRepository = eventChatRoomRepository;
    }

    public void handleNewParticipant(String idEvent, String username) {
        eventChatRoomRepository.addParticipant(idEvent, username);
    }

    public void handleParticipantLeft(String idEvent, String username) {
        eventChatRoomRepository.removeParticipant(idEvent, username);
    }

    public Set<String> getActiveParticipants(String idEvent, String currentUsername) {
        return eventChatRoomRepository.getParticipants(idEvent).stream()
                .filter(username -> !username.equals(currentUsername))
                .collect(Collectors.toSet());
    }
}
