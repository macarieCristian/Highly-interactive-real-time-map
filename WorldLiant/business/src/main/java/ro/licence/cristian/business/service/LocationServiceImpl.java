package ro.licence.cristian.business.service;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.mapper.LocationMapper;
import ro.licence.cristian.persistence.model.AppUser;
import ro.licence.cristian.persistence.model.Location;
import ro.licence.cristian.persistence.repository.LocationRepository;

import java.util.List;
import java.util.Optional;

@Service
@Log4j2
public class LocationServiceImpl implements LocationService {
    private LocationRepository locationRepository;
    private LocationMapper locationMapper;

    @Autowired
    public LocationServiceImpl(LocationRepository locationRepository, LocationMapper locationMapper) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
    }

    @Override
    public Long saveDesiredLocation(Long userId, LocationDto locationDto) {
        log.info("saveDesiredLocation: userId={}, locationDto={}", userId, locationDto);
        Location location = locationMapper.dtoToEntity(locationDto);
        AppUser appUser = new AppUser();
        appUser.setId(userId);
        location.setAppUser(appUser);
        Location newLocation = locationRepository.save(location);
        return newLocation.getId();
    }

    @Override
    @Transactional
    public Boolean updateDesiredLocations(List<LocationDto> locationDtos) {
        log.info("updateDesiredLocations: locationDtos={}", locationDtos);
        for (LocationDto locationDto : locationDtos) {
            if (locationDto.getId() != null) {
                Optional<Location> locationOptional = locationRepository.findById(locationDto.getId());
                locationOptional.ifPresent(location -> {
                    location.setLatitude(locationDto.getLatitude());
                    location.setLongitude(locationDto.getLongitude());
                });
            }
        }
        return true;
    }

    @Override
    @Transactional
    public Boolean deleteDesiredLocations(List<Long> locationIds) {
        log.info("deleteDesiredLocations: locationIds={}", locationIds);
        locationIds.forEach(id -> locationRepository.deleteById(id));
        return true;
    }
}
