package ro.licence.cristian.controller.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import ro.licence.cristian.business.service.UserService;

@Component
public class UserSecurityConstraints {
    private UserService userService;

    @Autowired
    public UserSecurityConstraints(UserService userService) {
        this.userService = userService;
    }

    public boolean ownerOfAccount(String username, Authentication authentication) {
        return authentication.getName().equals(username);
    }

    public boolean ownerOfAccountWithId(Long id, Authentication authentication) {
        Long userId = userService.getUserId(authentication.getName());
        return id != null && userId != null && userId.equals(id);
    }
}
