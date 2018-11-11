package ro.licence.cristian.controller.resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ro.licence.cristian.business.service.UserService;
import ro.licence.cristian.persistence.model.AppUser;

import java.util.List;

@RequestMapping("/users")
@RestController
public class UserController {
    private final static Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;


    @GetMapping(value = "/all")
    @PreAuthorize("hasRole('REGULAR_USER')")
    public List<AppUser> getAllUsers() {
        log.info("getAllUsers --entered");
        //TODO userDto converter
        List<AppUser> appUsers = userService.getUsers();
        log.info("getAllUsers: result={}", appUsers);
        return appUsers;
    }

    @GetMapping("/adminres")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> haha() {
        return ResponseEntity.ok("you're admin!");
    }

    @GetMapping("/access")
    public ResponseEntity<String> hahai() {
        return ResponseEntity.ok("authenticated access!");
    }

}
