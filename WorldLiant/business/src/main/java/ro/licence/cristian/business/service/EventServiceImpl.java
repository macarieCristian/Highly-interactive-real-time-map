package ro.licence.cristian.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.mapper.EventMapper;
import ro.licence.cristian.persistence.model.Attachment;
import ro.licence.cristian.persistence.model.Event;
import ro.licence.cristian.persistence.repository.EventRepository;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class EventServiceImpl implements EventService {
    private EventRepository eventRepository;
    private EventMapper eventMapper;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    public Boolean saveEvent(EventDto eventDto, MultipartFile profilePicture, List<MultipartFile> photos) throws BusinessException {
        Event event = eventMapper.dtoToEntity(eventDto);
        prepareEvent(event, profilePicture, photos);
        eventRepository.save(event);
        return true;
    }

    private void prepareEvent(Event event, MultipartFile profilePicture, List<MultipartFile> photos) throws BusinessException {
        if (profilePicture != null) {
            Attachment profilePictureAttachment = buildAttachment(profilePicture);
            event.setProfilePicture(profilePictureAttachment);
            profilePictureAttachment.setEvent(event);
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
