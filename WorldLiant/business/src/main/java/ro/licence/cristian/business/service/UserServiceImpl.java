package ro.licence.cristian.business.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.dto.ScanAreaDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.mapper.AppUserMapper;
import ro.licence.cristian.business.mapper.ScanAreaMapper;
import ro.licence.cristian.business.validator.AppUserValidator;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.model.Role;
import ro.licence.cristian.persistence.model.ScanArea;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.model.enums.RoleType;
import ro.licence.cristian.persistence.model.enums.ScanAreaNotificationStatusType;
import ro.licence.cristian.persistence.model.enums.StatusType;
import ro.licence.cristian.persistence.repository.AttachmentRepository;
import ro.licence.cristian.persistence.repository.UserRepository;
import ro.licence.cristian.persistence.repository.projection.AppUserWithScanAreasProjection;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;

@Service
@Log4j2
public class UserServiceImpl implements UserService {

    private AttachmentRepository attachmentRepository;
    private UserRepository userRepository;
    private AppUserMapper appUserMapper;
    private ScanAreaMapper scanAreaMapper;
    private AppUserValidator appUserValidator;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public UserServiceImpl(AttachmentRepository attachmentRepository, UserRepository userRepository, AppUserMapper appUserMapper, AppUserValidator appUserValidator, BCryptPasswordEncoder bCryptPasswordEncoder, ScanAreaMapper scanAreaMapper) {
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.appUserMapper = appUserMapper;
        this.scanAreaMapper = scanAreaMapper;
        this.appUserValidator = appUserValidator;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Override
    public List<AppUserDto> getUsersForScan(Double latitude, Double longitude, Double radius, Authentication authentication) {
        log.info("getUsersForScan: latitude={}, longitude={}, radius={}", latitude, longitude, radius);
        List<AppUser> appUsers = userRepository
                .getUsersWithLocationsSatisfyingScanCriteria(latitude, longitude, radius, authentication.getName());
        List<AppUserDto> appUserDtos = appUserMapper.entitiesToDtosCustom(appUsers);
        log.info("getUsersForScan: result={}", appUserDtos);
        return appUserDtos;
    }

    @Override
    public AppUserDto findUserByUsernameLocationsLoaded(final String username) throws BusinessException {
        log.info("findUserByUsernameLocationsLoaded: username={}", username);
        AppUserDto appUserDto = fetchUser(username,
                userRepository::findAppUserByUsernameLocationsLoaded,
                appUserMapper::entityToDtoProjectionDesiredLocationsLoaded);
        log.info("findUserByUsernameLocationsLoaded: result={}", appUserDto);
        return appUserDto;
    }

    @Override
    public AppUserDto findUserByUsernameProfilePicLoaded(final String username) throws BusinessException {
        log.info("findUserByUsernameProfilePicLoaded: username={}", username);
        AppUserDto appUserDto = fetchUser(username,
                userRepository::findAppUserByUsernameProfilePicLoaded,
                appUserMapper::entityToDtoProjectionProfilePicLoaded);
        log.info("findUserByUsernameProfilePicLoaded: result={}", appUserDto);
        return appUserDto;
    }

    @Override
    public Boolean saveNewAppUser(@NotNull AppUserDto appUserDto, MultipartFile profilePicture) throws BusinessException {
        log.info("saveNewAppUser: username={}", appUserDto.getUsername());
        AppUser appUser = appUserMapper.dtoToEntity(appUserDto);
        checkAppUserForRegister(appUser);
        prepareNewAppUser(appUser, profilePicture);
        AppUser result = userRepository.save(appUser);
        log.info("saveNewAppUser: result={}", result);
        return true;
    }

    @Override
    public Attachment getProfilePicture(String username) throws BusinessException {
        Optional<Attachment> attachmentOptional = attachmentRepository.findByOwnerUsernameEquals(username);
        return attachmentOptional
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.ATTACHMENT_DOES_NOT_EXIST));
    }

    @Override
    public List<ScanAreaDto> userScanAreas(String username) {
        List<ScanArea> scanAreas = userRepository.getUserScanAreas(username);
        log.info("userScanAreas: scanAreas={}", scanAreas);
        return scanAreaMapper.entitiesToDtos(scanAreas);
    }

    @Override
    public Long getUserId(String username) {
        return userRepository.findAppUserIdByUsername(username);
    }

    private AppUserDto fetchUser(String username, Function<String, Optional<AppUser>> getFromDb, Function<AppUser, AppUserDto> convertToDto) throws BusinessException {
        Optional<AppUser> optionalAppUser = getFromDb.apply(username);
        AppUser appUser = optionalAppUser
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_WITH_USERNAME_DOES_NOT_EXIST));
        return convertToDto.apply(appUser);
    }

    private void checkAppUserForRegister(AppUser appUser) throws BusinessException {
        appUserValidator.validate(appUser);
        if (userRepository.existsAppUserByUsernameEquals(appUser.getUsername())) {
            throw new BusinessException(BusinessExceptionCode.THIS_USERNAME_ALREADY_EXISTS);
        }
    }

    private void prepareNewAppUser(@NotNull AppUser appUser, MultipartFile profilePicture) throws BusinessException {
        appUser.setPassword(bCryptPasswordEncoder.encode(appUser.getPassword()));
        appUser.setAccountStatusType(AccountStatusType.ACTIVE);
        appUser.setStatusType(StatusType.OFFLINE);
        Set<Role> roles = new HashSet<>();
        Role basicRole = Role.builder().roleType(RoleType.ROLE_REGULAR_USER).build();
        basicRole.setId(RoleType.ROLE_REGULAR_USER.getId());
        roles.add(basicRole);
        appUser.setRoles(roles);
        if (profilePicture != null) {
            Attachment profilePic = buildProfilePicAttachment(profilePicture);
            if (profilePic != null) {
                appUser.setProfilePicture(profilePic);
                profilePic.setOwner(appUser);
            }
        }
    }

    private Attachment buildProfilePicAttachment(MultipartFile profilePicture) throws BusinessException {
        Attachment profilePic;
        try {
            profilePic = Attachment.builder()
                    .name("ProfilePicture")
                    .type(profilePicture.getContentType())
                    .content(profilePicture.getBytes())
                    .build();
        } catch (IOException e) {
            throw new BusinessException(BusinessExceptionCode.CAN_NOT_SAVE_PHOTO);
        }
        return profilePic;
    }

    @Override
    public Boolean logout(final String username) {
        userRepository.changeUserStatus(username, StatusType.OFFLINE);
        log.info("logout successful: username={}", username);
        return true;
    }

    @Override
    public List<AppUserWithScanAreasProjection> getAppUserWithScanAreasIncludingPoint(Double latitude,
                                                                                      Double longitude,
                                                                                      String currentUsername) {
        return userRepository.getUsersWithScanAreasContainingPoint(latitude, longitude,
                ScanAreaNotificationStatusType.ENABLED, currentUsername);
    }
}
