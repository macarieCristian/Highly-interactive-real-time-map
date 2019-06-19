package ro.licence.cristian.business.service;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.licence.cristian.business.dto.LocationDetailsDto;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.exception.BusinessException;
import ro.licence.cristian.business.exception.BusinessExceptionCode;
import ro.licence.cristian.business.mapper.LocationDetailsMapper;
import ro.licence.cristian.business.mapper.LocationMapper;
import ro.licence.cristian.persistence.model.*;
import ro.licence.cristian.persistence.repository.LocationDetailsRepository;
import ro.licence.cristian.persistence.repository.LocationRepository;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Log4j2
@AllArgsConstructor
public class LocationServiceImpl implements LocationService {
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;
    private final LocationDetailsRepository locationDetailsRepository;
    private final LocationDetailsMapper locationDetailsMapper;

    @Override
    public Long saveDesiredLocation(Long userId, LocationDto locationDto) {
        log.info("saveDesiredLocation: userId={}, locationDto={}", userId, locationDto);
        Location location = locationMapper.dtoToEntity(locationDto);
        AppUser appUser = new AppUser();
        appUser.setId(userId);
        location.setAppUser(appUser);
        LocationDetails locationDetails = LocationDetails.builder().location(location).build();
        location.setLocationDetails(locationDetails);
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

    @Override
    public LocationDetailsDto getLocationDetails(Long locationId) {
        LocationDetails locationDetails = locationDetailsRepository.findLocationDetailsById(locationId);
        locationDetails.setAttachments(locationDetailsRepository
                .getAttachmentIdsForLocationDetails(locationDetails.getId()));
        return locationDetailsMapper.entityToDto(locationDetails);
    }

    @Override
    @Transactional
    public Boolean addOrUpdateLocationDetailsDescription(LocationDetailsDto locationDetailsDto) {
        LocationDetails locationDetails = locationDetailsMapper.dtoToEntity(locationDetailsDto);
        Optional<LocationDetails> optionalLocationDetails = locationDetailsRepository.findById(locationDetails.getId());
        optionalLocationDetails.ifPresent(details -> details.setDescription(locationDetails.getDescription()));
        return true;
    }

    @Override
    @Transactional
    public Set<Long> addLocationDetailsAttachments(Long locationDetailsId, List<MultipartFile> newAttachments) throws BusinessException {
        Set<Long> newAttachmentIds = new HashSet<>();
        if (newAttachments != null && !newAttachments.isEmpty()) {
            LocationDetails locationDetails = locationDetailsRepository.getOne(locationDetailsId);
            locationDetails.getAttachments().addAll(mapFilesToAttachments(newAttachments));
            locationDetailsRepository.flush();
            newAttachmentIds = locationDetails.getAttachments().stream()
                    .map(BaseEntity::getId)
                    .collect(Collectors.toSet());
        }
        return newAttachmentIds;
    }

    private Set<Attachment> mapFilesToAttachments(List<MultipartFile> newAttachments) throws BusinessException {
        Set<Attachment> attachments = new HashSet<>();
        for (MultipartFile file : newAttachments) {
            Attachment attachment = buildAttachment(file);
            attachments.add(attachment);
        }
        return attachments;
    }

    private Attachment buildAttachment(MultipartFile file) throws BusinessException {
        Attachment attachment;
        try {
            attachment = Attachment.builder()
                    .name(file.getOriginalFilename())
                    .type(file.getContentType())
                    .content(file.getBytes())
                    .build();
        } catch (IOException e) {
            throw new BusinessException(BusinessExceptionCode.CAN_NOT_SAVE_PHOTO);
        }
        return attachment;
    }
}
