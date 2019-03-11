package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.licence.cristian.persistence.model.ScanArea;

import java.util.List;

public interface ScanAreaRepository extends BaseRepository<ScanArea, Long> {

}
