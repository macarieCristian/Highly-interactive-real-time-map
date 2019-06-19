package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.LocationDetailsDto;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.service.LocationService;

import java.util.List;
import java.util.Set;

@RequestMapping("/locations")
@RestController
@Log4j2
@AllArgsConstructor
public class LocationController {
    private final LocationService locationService;

    // GET

    @GetMapping("/details/{locationId}")
    public ResponseEntity<LocationDetailsDto> getLocationDetails(@PathVariable Long locationId) {
        return ResponseEntity.ok(locationService.getLocationDetails(locationId));
    }


    // POST

    @PostMapping("/desired-location/{userId}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Long> saveDesiredLocation(@PathVariable Long userId, @RequestBody LocationDto locationDto, Authentication authentication) {
        return ResponseEntity.ok(locationService.saveDesiredLocation(userId, locationDto));
    }

    @PostMapping("/details/attachments")
    public ResponseEntity<Set<Long>> addLocationDetailsAttachments(@RequestPart LocationDetailsDto locationDetails,
                                                                   @RequestPart List<MultipartFile> attachments) throws BusinessException {
        return ResponseEntity.ok(locationService.addLocationDetailsAttachments(locationDetails.getId(), attachments));
    }

    // PUT

    @PutMapping("/desired-locations/{userId}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Boolean> saveDesiredLocation(@PathVariable Long userId, @RequestBody List<LocationDto> locationDtos, Authentication authentication) {
        return ResponseEntity.ok(locationService.updateDesiredLocations(locationDtos));
    }

    @PutMapping("/details/description")
    public ResponseEntity<Boolean> addOrUpdateLocationDetailsDescription(@RequestBody LocationDetailsDto locationDetailsDto) {
        return ResponseEntity.ok(locationService.addOrUpdateLocationDetailsDescription(locationDetailsDto));
    }

    // DELETE

    @DeleteMapping("/desired-locations/{userId}/{locationIds}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Boolean> deleteDesiredLocations(@PathVariable Long userId, @PathVariable List<Long> locationIds, Authentication authentication) {
        return ResponseEntity.ok(locationService.deleteDesiredLocations(locationIds));
    }

}
