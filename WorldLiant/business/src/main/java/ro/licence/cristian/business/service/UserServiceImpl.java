package ro.licence.cristian.business.service;

import lombok.extern.log4j.Log4j2;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.mapper.AppUserMapper;
import ro.licence.cristian.business.validator.AppUserValidator;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.model.Role;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.model.enums.RoleType;
import ro.licence.cristian.persistence.model.enums.StatusType;
import ro.licence.cristian.persistence.repository.AttachmentRepository;
import ro.licence.cristian.persistence.repository.UserRepository;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Log4j2
public class UserServiceImpl implements UserService {

    private AttachmentRepository attachmentRepository;
    private UserRepository userRepository;
    private AppUserMapper appUserMapper;
    private AppUserValidator appUserValidator;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public UserServiceImpl(AttachmentRepository attachmentRepository, UserRepository userRepository, AppUserMapper appUserMapper, AppUserValidator appUserValidator, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.appUserMapper = appUserMapper;
        this.appUserValidator = appUserValidator;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Override
    public List<AppUserDto> getUsers() {
        log.info("getUsers -- entered");
        List<AppUser> appUsers = userRepository.findAll();
        List<AppUserDto> appUserDtos = appUserMapper.entitiesToDtos(appUsers);
        log.info("getUsers: result={}", appUserDtos);
        return appUserDtos;
    }

    @Override
    public AppUserDto findUserByUsername(final String username) throws BusinessException {
        log.info("findUserByUsername: username={}", username);
        Optional<AppUser> optionalAppUser = userRepository.findAppUserByUsernameLocationsLoaded(username);
        AppUser appUser = optionalAppUser
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_WITH_USERNAME_DOES_NOT_EXIST));
        appUser.setRoles(new HashSet<>());
        AppUserDto appUserDto = appUserMapper.entityToDto(appUser);
        log.info("findUserByUsername: result={}", appUserDto);
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

    public Attachment getProfilePicture(String username) throws BusinessException {
        Optional<Attachment> attachmentOptional = attachmentRepository.findByOwnerUsernameEquals(username);
        return attachmentOptional
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.ATTACHMENT_FOR_USERNAME_DOES_NOT_EXIST));
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
        appUser.setStatusType(StatusType.AVAILABLE);
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
        Attachment profilePic = null;
        try {
            profilePic = Attachment.builder()
                    .name("ProfilePicture")
                    .type(MediaType.valueOf(profilePicture.getContentType()))
                    .content(profilePicture.getBytes())
                    .build();
        } catch (IOException e) {
            throw new BusinessException(BusinessExceptionCode.CAN_NOT_SAVE_PHOTO);
        }
        return profilePic;
    }
}
