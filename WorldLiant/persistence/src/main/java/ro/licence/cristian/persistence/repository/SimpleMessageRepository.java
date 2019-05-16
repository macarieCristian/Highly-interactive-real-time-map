package ro.licence.cristian.persistence.repository;

import org.springframework.data.repository.query.Param;
import ro.licence.cristian.persistence.model.SimpleMessage;

import java.util.List;

public interface SimpleMessageRepository extends BaseRepository<SimpleMessage, Long> {

    List<SimpleMessage> getConversation(@Param("source") String sourceUsername,
                                        @Param("destination") String destinationUsername);

    List<SimpleMessage> getConversationEvent(@Param("idEvent") Long idEvent);
}
