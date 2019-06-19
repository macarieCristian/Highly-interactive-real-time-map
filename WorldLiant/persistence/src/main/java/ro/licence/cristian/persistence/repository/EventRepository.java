package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.model.Event;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface EventRepository extends BaseRepository<Event, Long> {

//    @Query("select distinct new ro.licence.cristian.persistence.model.Event(" +
//            "e.id, e.name, e.description, e.startDate, e.endDate, " +
//            "cp.firstName, cp.lastName, cp.phone, cp.email, e.location, e.profilePicture" +
//            ") " +
//            "from Event e " +
//            "join e.profilePicture pp " +
//            "join e.contactPerson cp on cp.username = :username " +
//            "where e.startDate < :endDate and :startDate < e.endDate")
//    List<Event> getEventsByContactPersonUsernameWithTimeOverlay(@Param("username") String username,
//                                                               @Param("startDate") LocalDateTime startDate,
//                                                               @Param("endDate") LocalDateTime endDate);

    @Query("select distinct new ro.licence.cristian.persistence.model.Event(" +
            "e.id, e.name, e.description, e.startDate, e.endDate, " +
            "cp.firstName, cp.lastName, cp.phone, cp.email, e.location, e.profilePicture" +
            ") " +
            "from Event e " +
            "join e.contactPerson cp " +
            "where cp.username = :username ")
    List<Event> getEventsByContactPersonUsername(@Param("username") String username);

    @Query("select distinct new ro.licence.cristian.persistence.model.Event(" +
            "e.id, e.name, e.description, e.startDate, e.endDate, " +
            "cp.firstName, cp.lastName, cp.phone, cp.email, e.location, e.profilePicture" +
            ") " +
            "from Event e " +
            "join e.contactPerson cp " +
            "where e.id = :id")
    Optional<Event> getEventByIdWithProfilePicture(@Param("id") Long idEvent);

    @Query("select distinct new ro.licence.cristian.persistence.model.Attachment(att.id) " +
            "from Event e " +
            "join e.attachments att " +
            "where e.id = :id")
    Set<Attachment> getAttachmentIdsForEventById(@Param("id") Long idEvent);

    @Query("select distinct new ro.licence.cristian.persistence.model.Event(" +
            "e.id, e.name, e.description, e.startDate, e.endDate, " +
            "cp.firstName, cp.lastName, cp.phone, cp.email, e.location, e.profilePicture" +
            ") " +
            "from Event e " +
            "join e.contactPerson cp " +
            "join e.location l " +
            "where function('haversinedistance', :lat, :lng, l.latitude, l.longitude) <= :rad and cp.username <> :username")
    List<Event> getEventsSatisfyingScanCriteria(@Param("lat") Double lat,
                                                @Param("lng") Double lng,
                                                @Param("rad") Double rad,
                                                @Param("username") String username);

}
