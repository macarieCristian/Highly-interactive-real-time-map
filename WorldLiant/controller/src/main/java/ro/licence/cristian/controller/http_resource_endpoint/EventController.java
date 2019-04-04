package ro.licence.cristian.controller.http_resource_endpoint;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
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

    @PostMapping
    public ResponseEntity<Boolean> saveEvent(@RequestPart EventDto event,
                                             @RequestPart MultipartFile profilePicture,
                                             @RequestPart List<MultipartFile> photos) throws BusinessException {
        return ResponseEntity.ok(eventService.saveEvent(event, profilePicture, photos));
    }
}
