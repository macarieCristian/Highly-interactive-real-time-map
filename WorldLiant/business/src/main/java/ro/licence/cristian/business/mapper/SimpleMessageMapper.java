package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;
import ro.licence.cristian.persistence.model.SimpleMessage;

import java.util.List;

@Mapper(
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface SimpleMessageMapper extends BaseMapper<SimpleMessage, SimpleMessageDto> {

    @Override
    @Mapping(target = "eventType", expression = "java(ro.licence.cristian.business.dto.websocket_dto.enums.EventType.CHAT_MESSAGE)")
    @Mapping(target = "source", expression = "java(entity.getSource().getUsername())")
    @Mapping(target = "destination", expression = "java(entity.getDestination().getUsername())")
    SimpleMessageDto entityToDto(SimpleMessage entity);

    @Override
    @Mapping(target = "source", expression = "java(new ro.licence.cristian.persistence.model.AppUser(dto.getSource()))")
    @Mapping(target = "destination", expression = "java(new ro.licence.cristian.persistence.model.AppUser(dto.getDestination()))")
    SimpleMessage dtoToEntity(SimpleMessageDto dto);
}
