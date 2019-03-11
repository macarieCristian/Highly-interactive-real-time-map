package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.service.LocationService;

import java.util.List;

@RequestMapping("/locations")
@RestController
@Log4j2
public class LocationController {
    private LocationService locationService;

    @Autowired
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    // GET


    // POST

    @PostMapping(value = "/desired-location/{userId}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Long> saveDesiredLocation(@PathVariable Long userId, @RequestBody LocationDto locationDto, Authentication authentication) {
        return ResponseEntity.ok(locationService.saveDesiredLocation(userId, locationDto));
    }

    // PUT

    @PutMapping(value = "/desired-locations/{userId}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Boolean> saveDesiredLocation(@PathVariable Long userId, @RequestBody List<LocationDto> locationDtos, Authentication authentication) {
        return ResponseEntity.ok(locationService.updateDesiredLocations(locationDtos));
    }

    // DELETE

    @DeleteMapping(value = "/desired-locations/{userId}/{locationIds}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Boolean> deleteDesiredLocations(@PathVariable Long userId, @PathVariable List<Long> locationIds, Authentication authentication) {
        return ResponseEntity.ok(locationService.deleteDesiredLocations(locationIds));
    }

}
