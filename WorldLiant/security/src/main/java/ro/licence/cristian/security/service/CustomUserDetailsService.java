package ro.licence.cristian.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.repository.UserRepository;

import java.util.Arrays;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        final Optional<AppUser> optionalAppUser = userRepository.findAppUserByUsername(username);
        final AppUser appUser = optionalAppUser.orElseThrow(() -> new UsernameNotFoundException("Invalid username or password."));
        if(appUser.getRoleType() == null)
            throw new RuntimeException("No role found.");
        return new User(appUser.getUsername(), appUser.getPassword(), Arrays.asList(new SimpleGrantedAuthority(appUser.getRoleType().name())));
    }
}
