package ro.licence.cristian.persistence.repository;

import ro.licence.cristian.persistence.model.AppUser;

import java.util.Optional;

public interface UserRepository extends BasicRepository<AppUser, Long> {

    Optional<AppUser> findAppUserByUsername(final String username);
}
