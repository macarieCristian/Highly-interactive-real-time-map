package ro.licence.cristian.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        final Optional<AppUser> optionalAppUser = userRepository.findAppUserByUsernameRolesLoaded(username);
        final AppUser appUser = optionalAppUser.orElseThrow(() -> new UsernameNotFoundException("Invalid username or password."));
        final List<SimpleGrantedAuthority> authorities = appUser.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getRoleType().name()))
                .collect(Collectors.toList());
        final Boolean enabled = appUser.getAccountStatusType().equals(AccountStatusType.ACTIVE);
        return new User(appUser.getUsername(),
                appUser.getPassword(),
                enabled,
                true,
                true,
                true,
                authorities);
    }

    public Boolean isUserDisabled(String username) {
        return userRepository.existsAppUserByUsernameEqualsAndAccountStatusTypeEquals(username, AccountStatusType.DISABLED);
    }
}
