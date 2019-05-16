package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.service.EventService;

import java.util.List;

@RequestMapping("/events")
@RestController
@Log4j2
public class EventController {

    private EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // GET

    @GetMapping("/{username}")
    @PreAuthorize("@userSecurityConstraints.ownerOfAccount(#username, authentication)")
    public ResponseEntity<List<EventDto>> getUsersEvents(@PathVariable String username) {
        return ResponseEntity.ok(eventService.getUsersEvents(username));
    }

    @GetMapping("/event/{idEvent}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long idEvent) throws BusinessException {
        return ResponseEntity.ok(eventService.getEventByIdWithProfilePicLoaded(idEvent));
    }

    @GetMapping(value = "/scan")
    public ResponseEntity<List<EventDto>> getEventsInside(
            @RequestParam("lat") Double latitude,
            @RequestParam("lng") Double longitude,
            @RequestParam("rad") Double radius,
            Authentication authentication) {
        return ResponseEntity.ok(eventService.getEventsForScan(latitude, longitude, radius, authentication));
    }

    // POST

    @PostMapping
    public ResponseEntity<EventDto> saveEvent(@RequestPart EventDto event,
                                             @RequestPart MultipartFile profilePicture,
                                             @RequestPart List<MultipartFile> photos) throws BusinessException {
        return ResponseEntity.ok(eventService.saveEvent(event, profilePicture, photos));
    }

    // DELETE

    @DeleteMapping(value = "/{eventIds}")
    public ResponseEntity<Boolean> deleteDesiredLocations(@PathVariable List<Long> eventIds) {
        return ResponseEntity.ok(eventService.deleteEvents(eventIds));
    }
}
