package ro.licence.cristian.business.service;

import ro.licence.cristian.business.dto.UserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.persistence.model.AppUser;

import java.util.List;

public interface UserService {

    List<AppUser> getUsers();

    UserDto findUserByUsername(String username) throws BusinessException;
}
