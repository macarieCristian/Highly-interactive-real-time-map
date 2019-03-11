package ro.licence.cristian.controller.http_resource_endpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.licence.cristian.business.dto.ScanAreaDto;
import ro.licence.cristian.business.service.ScanAreaService;

@RequestMapping("/scan-areas")
@RestController
public class ScanAreaController {
    private ScanAreaService scanAreaService;

    @Autowired
    public ScanAreaController(ScanAreaService scanAreaService) {
        this.scanAreaService = scanAreaService;
    }


    // GET

    // POST

    @PostMapping(value = "/{userId}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Long> saveDesiredLocation(@PathVariable Long userId, @RequestBody ScanAreaDto scanAreaDto, Authentication authentication) {
        return ResponseEntity.ok(scanAreaService.saveScanArea(userId, scanAreaDto));
    }

    // PUT

    // DELETE

    @DeleteMapping(value = "/{userId}/{scanAreaId}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccountWithId(#userId, authentication)")
    public ResponseEntity<Boolean> deleteDesiredLocations(@PathVariable Long userId, @PathVariable Long scanAreaId, Authentication authentication) {
        return ResponseEntity.ok(scanAreaService.deleteScanArea(scanAreaId));
    }
}
