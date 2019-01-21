package ro.licence.cristian.persistence.repository;

import org.springframework.transaction.annotation.Transactional;
import ro.licence.cristian.persistence.model.Attachment;

import java.util.Optional;

public interface AttachmentRepository extends BaseRepository<Attachment, Long> {

    @Transactional
    Optional<Attachment> findByOwnerUsernameEquals(String username);
}
