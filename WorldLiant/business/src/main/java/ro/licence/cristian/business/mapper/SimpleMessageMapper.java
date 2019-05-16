package ro.licence.cristian.business.mapper;

import org.mapstruct.*;
import ro.licence.cristian.business.dto.websocket_dto.SimpleMessageDto;
import ro.licence.cristian.business.mapper.annotation.Custom;
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
    @Mapping(target = "destinationEvent", ignore = true)
    SimpleMessage dtoToEntity(SimpleMessageDto dto);

    @Custom
    @Mapping(target = "eventType", expression = "java(ro.licence.cristian.business.dto.websocket_dto.enums.EventType.CHAT_ROOM_MESSAGE)")
    @Mapping(target = "source", expression = "java(entity.getSource().getUsername())")
    @Mapping(target = "destination", expression = "java(entity.getDestinationEvent().getId().toString())")
    SimpleMessageDto entityWithEventToDto(SimpleMessage entity);

    @Custom
    @Mapping(target = "source", expression = "java(new ro.licence.cristian.persistence.model.AppUser(dto.getSource()))")
    @Mapping(target = "destinationEvent", expression = "java(new ro.licence.cristian.persistence.model.Event(Long.parseLong(dto.getDestination())))")
    @Mapping(target = "destination", ignore = true)
    SimpleMessage dtoWithEventToEntity(SimpleMessageDto dto);

    @IterableMapping(qualifiedBy = Custom.class)
    List<SimpleMessageDto> entitiesWithEventToDtos(List<SimpleMessage> entities);

    @IterableMapping(qualifiedBy = Custom.class)
    List<SimpleMessage> dtosWithEventToEntities(List<SimpleMessageDto> entities);
}
