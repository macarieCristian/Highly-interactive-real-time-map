package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.persistence.model.Location;

@Mapper(
        uses = LocationDetailsMapper.class,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface LocationMapper extends BaseMapper<Location, LocationDto> {

    @Override
    @Mapping(source = "locationDetails", target = "locationDetails", ignore = true)
    LocationDto entityToDto(Location entity);

    @Override
    @Mapping(source = "locationDetails", target = "locationDetails", ignore = true)
    Location dtoToEntity(LocationDto dto);
}
