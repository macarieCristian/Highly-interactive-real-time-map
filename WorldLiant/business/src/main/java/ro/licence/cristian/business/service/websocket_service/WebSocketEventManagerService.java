package ro.licence.cristian.business.service.websocket_service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ro.licence.cristian.persistence.model.enums.StatusType;
import ro.licence.cristian.persistence.repository.UserRepository;
import ro.licence.cristian.persistence.repository.websocket_repository.ActiveUsersInMemoryRepository;

import java.util.List;

@Service
@Log4j2
public class WebSocketEventManagerService {
    private static final String USER_HEADER = "user";

    private ActiveUsersInMemoryRepository activeUsersRepository;
    private UserRepository userRepository;

    @Autowired
    public WebSocketEventManagerService(ActiveUsersInMemoryRepository activeUsersRepository, UserRepository userRepository) {
        this.activeUsersRepository = activeUsersRepository;
        this.userRepository = userRepository;
    }

    @EventListener
    private void handleSessionConnected(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        String username = headers.getNativeHeader(USER_HEADER).get(0);
        activeUsersRepository.associateUserWithSession(username, sessionId);
        userRepository.changeUserStatus(username, StatusType.ONLINE);
        log.info("User with username={} is connected!", username);
    }

    @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) {
        String disconnectedUser = activeUsersRepository.getUsername(event.getSessionId());
        if (disconnectedUser != null) {
            log.info("User with username={} has disconnected!", disconnectedUser);
        }
        activeUsersRepository.removeUser(event.getSessionId());
    }
}
