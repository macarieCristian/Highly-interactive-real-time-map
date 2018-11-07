package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.licence.cristian.persistence.model.BaseEntity;

import java.io.Serializable;

public interface TemplateRepository<T extends BaseEntity<ID>, ID extends Serializable> extends JpaRepository<T, ID> {
}
