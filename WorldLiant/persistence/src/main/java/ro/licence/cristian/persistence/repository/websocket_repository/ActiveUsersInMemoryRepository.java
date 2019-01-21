package ro.licence.cristian.persistence.repository.websocket_repository;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@NoArgsConstructor
@Getter
public class ActiveUsersInMemoryRepository {
    private Map<String, String> onlineUsers = new ConcurrentHashMap<>();
}
