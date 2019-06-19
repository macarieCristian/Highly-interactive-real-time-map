package ro.licence.cristian.business.service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.LocationDetailsDto;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.exception.BusinessException;

import java.util.List;
import java.util.Set;

public interface LocationService {
    Long saveDesiredLocation(Long userId, LocationDto locationDto);

    Boolean updateDesiredLocations(List<LocationDto> locationDtos);

    Boolean deleteDesiredLocations(List<Long> locationIds);

    LocationDetailsDto getLocationDetails(Long locationId);


    Boolean addOrUpdateLocationDetailsDescription(LocationDetailsDto locationDetailsDto);

    @Transactional
    Set<Long> addLocationDetailsAttachments(Long locationDetailsId, List<MultipartFile> newAttachments) throws BusinessException;
}
