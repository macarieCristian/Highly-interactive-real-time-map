package ro.licence.cristian.controller.resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.service.UserService;
import ro.licence.cristian.persistence.model.AppUser;

import java.util.List;

@RequestMapping("/users")
@RestController
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;


    @GetMapping(value = "/all")
    @PreAuthorize("hasRole('REGULAR_USER')")
    public List<AppUserDto> getAllUsers() {
        log.info("getAllUsers --entered");
        List<AppUserDto> appUsers = userService.getUsers();
        log.info("getAllUsers: result={}", appUsers);
        return appUsers;
    }

    @GetMapping("/test")
    public ResponseEntity<AppUserDto> test() throws BusinessException {
        AppUserDto appUserDto = userService.findUserByUsername("macarc");
        return ResponseEntity.ok(appUserDto);
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

    @GetMapping("/multiRole")
    @PreAuthorize("hasAnyRole('ADMIN','PREMIUM_USER','REGULAR_USER')")
    public ResponseEntity<String> h() {return ResponseEntity.ok("Has Admin or premium!");}

    //##################################################################################################################

    @PostMapping("/register")
    public ResponseEntity<Boolean> register(@RequestBody AppUserDto appUserDto) {
        return ResponseEntity.ok(userService.saveNewAppUser(appUserDto));
    }

}
