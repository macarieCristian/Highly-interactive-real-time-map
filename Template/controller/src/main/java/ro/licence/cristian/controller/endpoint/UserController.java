package ro.licence.cristian.controller.endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.licence.cristian.business.service.UserService;
import ro.licence.cristian.persistence.model.AppUser;

import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping(value = "/users")
    public List<AppUser> getAllUsers() {
        return userService.getUsers();
    }
}
