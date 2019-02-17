package ro.licence.cristian.business.service;

import ro.licence.cristian.business.dto.LocationDto;

import java.util.List;

public interface LocationService {
    Long saveDesiredLocation(Long userId, LocationDto locationDto);

    Boolean updateDesiredLocations(List<LocationDto> locationDtos);

    Boolean deleteDesiredLocations(List<Long> locationIds);
}
