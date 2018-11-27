package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.persistence.model.Location;

@Mapper(
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface LocationMapper extends BaseMapper<Location, LocationDto> {
}
