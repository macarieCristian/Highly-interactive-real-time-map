package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends BaseRepository<AppUser, Long> {

    @Query("select u from AppUser u where u.username = ?1")
    @EntityGraph(value = "appUserWithRoles", type = EntityGraph.EntityGraphType.LOAD)
    Optional<AppUser> findAppUserByUsernameRolesLoaded(final String username);

    @Query("select u from AppUser u where u.username = ?1")
    @EntityGraph(value = "appUserWithDesiredLocations", type = EntityGraph.EntityGraphType.LOAD)
    Optional<AppUser> findAppUserByUsernameLocationsLoaded(final String username);

    @Query("select u.id from AppUser u where u.username = ?1")
    Long findAppUserIdByUsername(final String username);

    @Transactional
    @Query("select distinct u " +
            "from AppUser u " +
            "inner join fetch u.profilePicture " +
            "inner join fetch u.desiredLocations dl " +
            "where function('haversinedistance', :lat, :lng, dl.latitude, dl.longitude) <= :rad")
    List<AppUser> getAppUsersByScanCriteria(@Param("lat") Double lat, @Param("lng") Double lng, @Param("rad") Double rad);


    Boolean existsAppUserByUsernameEqualsAndAccountStatusTypeEquals(String username, AccountStatusType accountStatusType);

    Boolean existsAppUserByUsernameEquals(String username);
}
