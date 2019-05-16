package ro.licence.cristian.business.service;

import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.business.exception.BusinessException;

import java.util.List;

public interface EventService {

    @Transactional
    EventDto getEventByIdWithProfilePicLoaded(Long idEvent) throws BusinessException;

    @Transactional
    List<EventDto> getEventsForScan(Double latitude, Double longitude, Double radius, Authentication authentication);

    EventDto saveEvent(EventDto eventDto, MultipartFile profilePicture, List<MultipartFile> photos) throws BusinessException;

    List<EventDto> getUsersEvents(String username);

    Boolean deleteEvents(List<Long> eventIds);
}
