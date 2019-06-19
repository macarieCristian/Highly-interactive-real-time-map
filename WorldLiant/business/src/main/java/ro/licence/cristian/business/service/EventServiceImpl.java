package ro.licence.cristian.business.service;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.AttachmentDto;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.mapper.EventMapper;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.model.Event;
import ro.licence.cristian.persistence.repository.EventRepository;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Log4j2
@AllArgsConstructor
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public List<EventDto> getUsersEvents(String username) {
        List<Event> userEvents = eventRepository.getEventsByContactPersonUsername(username);
        for (Event event : userEvents) {
            event.setAttachments(eventRepository.getAttachmentIdsForEventById(event.getId()));
        }
        return eventMapper.entitiesToDtos(userEvents);
    }

    @Override
    @Transactional
    public EventDto getEventByIdWithProfilePicLoaded(Long idEvent) throws BusinessException {
        Optional<Event> eventOptional = eventRepository.getEventByIdWithProfilePicture(idEvent);
        Event event = eventOptional.orElseThrow(() -> new BusinessException(BusinessExceptionCode.EVENT_DOES_NOT_EXIST));
        event.setAttachments(eventRepository.getAttachmentIdsForEventById(idEvent));
        return eventMapper.entityToDto(event);
    }

    @Override
    @Transactional
    public List<EventDto> getEventsForScan(Double latitude, Double longitude, Double radius, Authentication authentication) {
        log.info("getEventsForScan: latitude={}, longitude={}, radius={}", latitude, longitude, radius);
        List<Event> events = eventRepository
                .getEventsSatisfyingScanCriteria(latitude, longitude, radius, authentication.getName());
        for (Event event : events) {
            event.setAttachments(eventRepository.getAttachmentIdsForEventById(event.getId()));
        }
        List<EventDto> eventsDtos = eventMapper.entitiesToDtos(events);
        log.info("getEventsForScan: result={}", eventsDtos);
        return eventsDtos;
    }

    @Override
    public EventDto saveEvent(EventDto eventDto, MultipartFile profilePicture, List<MultipartFile> photos) throws BusinessException {
        Event event = eventMapper.dtoToEntity(eventDto);
        prepareEvent(event, profilePicture, photos);
        Event savedEvent = eventRepository.save(event);
        return prepareAddEventResponse(savedEvent);
    }

    @Override
    public Boolean deleteEvents(List<Long> eventIds) {
        eventIds.forEach(id -> eventRepository.deleteById(id));
        return true;
    }

    private void prepareEvent(Event event, MultipartFile profilePicture, List<MultipartFile> photos) throws BusinessException {
        if (profilePicture != null) {
            Attachment profilePictureAttachment = buildAttachment(profilePicture);
            event.setProfilePicture(profilePictureAttachment);
            profilePictureAttachment.setOwnerEvent(event);
        }
        if (photos != null && !photos.isEmpty()) {
            Set<Attachment> attachments = new HashSet<>();
            for (MultipartFile photo : photos) {
                Attachment photoAttachment = buildAttachment(photo);
                photoAttachment.setEvent(event);
                attachments.add(photoAttachment);
            }
            event.setAttachments(attachments);
        }
    }

    private EventDto prepareAddEventResponse(Event event) {
        EventDto.EventDtoBuilder builder = EventDto.builder();
        builder.location(new LocationDto());
        if (event.getAttachments() != null) {
            Set<AttachmentDto> attachmentDtos = event.getAttachments().stream()
                    .map(at -> new AttachmentDto(at.getId()))
                    .collect(Collectors.toSet());
            builder.attachments(attachmentDtos);
        }
        EventDto eventResponse = builder.build();
        eventResponse.setId(event.getId());
        eventResponse.getLocation().setId(event.getLocation().getId());
        return eventResponse;
    }

    private Attachment buildAttachment(MultipartFile file) throws BusinessException {
        Attachment profilePic;
        try {
            profilePic = Attachment.builder()
                    .name(file.getOriginalFilename())
                    .type(file.getContentType())
                    .content(file.getBytes())
                    .build();
        } catch (IOException e) {
            throw new BusinessException(BusinessExceptionCode.CAN_NOT_SAVE_PHOTO);
        }
        return profilePic;
    }

}
