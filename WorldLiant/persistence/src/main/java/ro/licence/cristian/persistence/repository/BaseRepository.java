package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.licence.cristian.persistence.model.BaseEntity;

import java.io.Serializable;

public interface BaseRepository<T extends BaseEntity<I>, I extends Serializable> extends JpaRepository<T, I> {
}
