package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    // GET

    @GetMapping(value = "/profile-pic/{username}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccount(#username, authentication)")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable String username, Authentication authentication) throws BusinessException {
        log.info("getProfilePicture: username={}", username);
        Attachment attachment = userService.getProfilePicture(username);
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=" + attachment.getName())
                .contentType(attachment.getType())
                .body(attachment.getContent());
    }

    @GetMapping(value = "/personal-info/{username}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccount(#username, authentication)")
    public ResponseEntity<AppUserDto> getPersonalInfo(@PathVariable String username, Authentication authentication) throws BusinessException {
        log.info("getPersonalInfo: username={}", username);
        return ResponseEntity.ok(userService.findUserByUsername(username));
    }

    @GetMapping(value = "/scan")
    public ResponseEntity<List<AppUserDto>> getUsersWithLocationsInside(
            @RequestParam("lat") Double latitude,
            @RequestParam("lng") Double longitude,
            @RequestParam("rad") Double radius) {
        return ResponseEntity.ok(userService.getUsersForScan(latitude, longitude, radius));
    }

    // POST

    @PostMapping(value = "/register", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Boolean> register(@RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
                                            @RequestPart(value = "appUser") AppUserDto appUserDto) throws BusinessException {
        log.info("register: appUserDto={}", appUserDto);
        return ResponseEntity.ok(userService.saveNewAppUser(appUserDto, profilePicture));
    }


}
