package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.LocationDetailsDto;
import ro.licence.cristian.persistence.model.LocationDetails;

@Mapper(
        uses = {AttachmentMapper.class},
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface LocationDetailsMapper extends BaseMapper<LocationDetails, LocationDetailsDto> {
}
