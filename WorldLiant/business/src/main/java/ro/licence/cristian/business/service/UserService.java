package ro.licence.cristian.business.service;

import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.CustomValidationException;
import ro.licence.cristian.persistence.model.AppUser;

import javax.validation.constraints.NotNull;
import java.util.List;

public interface UserService {

    /**
     * @return All users without lazy loading fields.
     */
    List<AppUserDto> getUsers();

    /**
     *
     * @param username
     * @return The user having all roles loaded.
     * @throws BusinessException
     */
    AppUserDto findUserByUsername(@NotNull String username) throws BusinessException;

    Boolean saveNewAppUser(@NotNull AppUserDto appUserDto);
}
