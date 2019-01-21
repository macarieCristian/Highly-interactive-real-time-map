package ro.licence.cristian.business.service.websocket_service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ro.licence.cristian.persistence.repository.websocket_repository.ActiveUsersInMemoryRepository;

import java.util.List;

@Service
@Log4j2
public class EventManagerService {
    private static final String USER_HEADER = "user";

    private ActiveUsersInMemoryRepository activeUsersRepository;

    @Autowired
    public EventManagerService(ActiveUsersInMemoryRepository activeUsersRepository) {
        this.activeUsersRepository = activeUsersRepository;
    }

    @EventListener
    private void handleSessionConnected(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        List<String> user = headers.getNativeHeader(USER_HEADER);
        activeUsersRepository.getOnlineUsers().put(sessionId, user.get(0));
        log.info("User with username={} is connected!", user.get(0));
    }

    @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) {
        log.info("User with username={} has disconnected!", activeUsersRepository.getOnlineUsers().get(event.getSessionId()));
        activeUsersRepository.getOnlineUsers().remove(event.getSessionId());
    }
}
