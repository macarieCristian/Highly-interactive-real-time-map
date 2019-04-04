package ro.licence.cristian.business.service;

import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.business.exception.BusinessException;

import java.util.List;

public interface EventService {

    Boolean saveEvent(EventDto eventDto, MultipartFile profilePicture, List<MultipartFile> photos) throws BusinessException;

}
