package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.service.UserService;
import ro.licence.cristian.persistence.model.Attachment;

import java.util.List;

@RequestMapping("/users")
@RestController
@Log4j2
public class UserController {

    private UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(value = "/all")
    @PreAuthorize("hasRole('REGULAR_USER')")
    public List<AppUserDto> getAllUsers() {
        log.info("getAllUsers --entered");
        List<AppUserDto> appUsers = userService.getUsers();
        log.info("getAllUsers: result={}", appUsers);
        return appUsers;
    }

    @PostMapping(value = "/register", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Boolean> register(@RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
                                            @RequestPart(value = "appUser") AppUserDto appUserDto) throws BusinessException {
        log.info("register: appUserDto={}", appUserDto);
        return ResponseEntity.ok(userService.saveNewAppUser(appUserDto, profilePicture));
    }

    @GetMapping(value = "/profile-pic/{username}")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable String username) throws BusinessException {
        log.info("getProfilePicture: username={}", username);
        Attachment attachment = userService.getProfilePicture(username);
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=" + attachment.getName())
                .contentType(attachment.getType())
                .body(attachment.getContent());
    }


}
