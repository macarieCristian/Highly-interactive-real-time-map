package ro.licence.cristian.business.service;

import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.dto.ScanAreaDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.repository.projection.AppUserWithScanAreasProjection;

import javax.validation.constraints.NotNull;
import java.util.List;

public interface UserService {

    List<AppUserDto> getUsersForScan(Double latitude, Double longitude, Double radius, Authentication authentication);

    /**
     * @param username
     * @return The user having locations loaded.
     * @throws BusinessException
     */
    AppUserDto findUserByUsernameLocationsLoaded(@NotNull String username) throws BusinessException;

    AppUserDto findUserByUsernameProfilePicLoaded(String username) throws BusinessException;

    Boolean saveNewAppUser(@NotNull AppUserDto appUserDto, MultipartFile profilePicture) throws BusinessException;

    Attachment getProfilePicture(String username) throws BusinessException;

    Long getUserId(String username);

    List<ScanAreaDto> userScanAreas(String username);

    Boolean logout(String username);

    List<AppUserWithScanAreasProjection> getAppUserWithScanAreasIncludingPoint(Double latitude,
                                                                               Double longitude,
                                                                               String currentUsername);
}
