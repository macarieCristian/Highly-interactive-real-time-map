package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.EventDto;
import ro.licence.cristian.persistence.model.Event;

@Mapper(
        uses = {LocationMapper.class, AttachmentMapper.class},
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface EventMapper extends BaseMapper<Event, EventDto> {
}
