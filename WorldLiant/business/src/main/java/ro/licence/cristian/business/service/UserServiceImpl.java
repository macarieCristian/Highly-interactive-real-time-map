package ro.licence.cristian.business.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Service;
import ro.licence.cristian.business.dto.UserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    private final static Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;


    @Override
    public List<AppUser> getUsers() {
        log.info("getUsers -- entered");
        List<AppUser> appUsers = userRepository.findAll();
        log.info("getUsers: result={}", appUsers);
        return appUsers;
    }

    private AppUser loadAppUser(final String username) throws BusinessException {
        Optional<AppUser> optionalAppUser = userRepository.findAppUserByUsername(username);
        return optionalAppUser
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_WITH_USERNAME_DOES_NOT_EXIST));
    }

    @Override
    public UserDto findUserByUsername(final String username) throws BusinessException {
        log.info("findUserByUsername: username={}", username);
        AppUser appUser = loadAppUser(username);

        //TODO userDto converter
        UserDto userDto = UserDto.builder()
                .id(appUser.getId())
                .username(appUser.getUsername())
                .password(appUser.getPassword())
                .firstName(appUser.getFirstName())
                .lastName(appUser.getLastName())
                .role(appUser.getRoleType().name())
                .build();
        log.info("findUserByUsername: result={}", userDto);
        return userDto;
    }
}
