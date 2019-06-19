package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.model.LocationDetails;

import java.util.Set;

public interface LocationDetailsRepository extends BaseRepository<LocationDetails, Long> {


    @Query("select new ro.licence.cristian.persistence.model.LocationDetails(ld.id, ld.description) " +
            "from LocationDetails ld " +
            "where ld.location.id = :locationId")
    LocationDetails findLocationDetailsById(@Param("locationId") Long locationId);

    @Query("select new ro.licence.cristian.persistence.model.Attachment(lda.id) " +
            "from LocationDetails ld join ld.attachments lda " +
            "where ld.id = :locationDetailsId")
    Set<Attachment> getAttachmentIdsForLocationDetails(@Param("locationDetailsId") Long locationDetailsId);
}
