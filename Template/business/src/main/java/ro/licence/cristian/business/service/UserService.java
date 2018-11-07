package ro.licence.cristian.business.service;

import ro.licence.cristian.persistence.model.AppUser;

import java.util.List;

public interface UserService {

    List<AppUser> getUsers();
}
