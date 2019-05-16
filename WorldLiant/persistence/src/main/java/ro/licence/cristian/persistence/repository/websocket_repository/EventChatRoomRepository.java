package ro.licence.cristian.persistence.repository.websocket_repository;

import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class EventChatRoomRepository {
    private Map<String, Set<String>> chatRooms = new ConcurrentHashMap<>();

    public void addParticipant(String idEvent, String username) {
        Set<String> room = chatRooms.get(idEvent);
        if (room != null) {
            room.add(username);
        } else {
            Set<String> newRoom = ConcurrentHashMap.newKeySet();
            newRoom.add(username);
            chatRooms.put(idEvent, newRoom);
        }
    }

    public void removeParticipant(String idEvent, String username) {
        Set<String> room = chatRooms.get(idEvent);
        if (room != null) {
            room.remove(username);
            if (room.isEmpty()) {
                chatRooms.remove(idEvent);
            }
        }
    }

    public Set<String> getParticipants(String idEvent) {
        return chatRooms.get(idEvent);
    }

    public Boolean containsParticipant(String idEvent, String username) {
        Boolean result = false;
        Set<String> room = chatRooms.get(idEvent);
        if (room != null) {
            result = room.contains(username);
        }
        return result;
    }
}
