package ro.licence.cristian.persistence.repository.websocket_repository;

import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Repository;
import org.springframework.web.socket.WebSocketSession;

import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Log4j2
@Repository
public class ActiveUsersInMemoryRepository {
    private Map<String, String> userSessionAssoc = new ConcurrentHashMap<>();
    private Set<String> activeUsers = new HashSet<>();

    public void associateUserWithSession(String username, String webSessionId) {
        userSessionAssoc.put(webSessionId, username);
        activeUsers.add(username);
    }

    public String getUsername(String webSessionId) {
        return userSessionAssoc.get(webSessionId);
    }

    public void removeUser(String webSessionId) {
        activeUsers.remove(userSessionAssoc.get(webSessionId));
        userSessionAssoc.remove(webSessionId);
    }

    public boolean isUserConnected(String username) {
        log.info("users={}", activeUsers);
        return activeUsers.contains(username);
    }

}
