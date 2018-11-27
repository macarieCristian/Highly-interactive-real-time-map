package ro.licence.cristian.business.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.mapper.AppUserMapper;
import ro.licence.cristian.business.validator.AppUserValidator;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.Role;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.model.enums.RoleType;
import ro.licence.cristian.persistence.model.enums.StatusType;
import ro.licence.cristian.persistence.repository.UserRepository;

import javax.validation.constraints.NotNull;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppUserMapper appUserMapper;

    @Autowired
    private AppUserValidator appUserValidator;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;


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
    public Boolean saveNewAppUser(@NotNull AppUserDto appUserDto) {
        log.info("saveNewAppUser: username={}", appUserDto.getUsername());
        AppUser appUser = appUserMapper.dtoToEntity(appUserDto);
        appUserValidator.validate(appUser);
        prepareNewAppUser(appUser);
        AppUser result = userRepository.save(appUser);
        log.info("saveNewAppUser: result={}", result);
        return true;
    }

    private void prepareNewAppUser(@NotNull AppUser appUser) {
        appUser.setPassword(bCryptPasswordEncoder.encode(appUser.getPassword()));
        appUser.setAccountStatusType(AccountStatusType.ACTIVE);
        appUser.setStatusType(StatusType.AVAILABLE);
        Set<Role> roles = new HashSet<>();
        Role basicRole = Role.builder().roleType(RoleType.ROLE_REGULAR_USER).build();
        basicRole.setId(RoleType.ROLE_REGULAR_USER.getId());
        roles.add(basicRole);
        appUser.setRoles(roles);
    }
}
