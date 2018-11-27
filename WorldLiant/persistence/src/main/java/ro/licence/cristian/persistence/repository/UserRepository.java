package ro.licence.cristian.persistence.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;

import java.util.Optional;

public interface UserRepository extends BaseRepository<AppUser, Long> {

    @Query("select u from AppUser u where u.username = ?1")
    @EntityGraph(value = "appUserWithRoles", type = EntityGraph.EntityGraphType.LOAD)
    Optional<AppUser> findAppUserByUsernameRolesLoaded(final String username);

    @Query("select u from AppUser u where u.username = ?1")
    @EntityGraph(value = "appUserWithDesiredLocations", type = EntityGraph.EntityGraphType.LOAD)
    Optional<AppUser> findAppUserByUsernameLocationsLoaded(final String username);

    Boolean existsAppUserByUsernameEqualsAndAccountStatusTypeEquals(String username, AccountStatusType accountStatusType);
}
