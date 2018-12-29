package ro.licence.cristian.business.mapper;

import org.mapstruct.*;
import ro.licence.cristian.business.dto.AttachmentDto;
import ro.licence.cristian.persistence.model.Attachment;

import java.io.IOException;

@Mapper(
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface AttachmentMapper {

    @Mappings({
            @Mapping(target = "name", expression = "java(dto.getContent().getName())"),
            @Mapping(target="type", expression = "java(dto.getContent().getContentType())"),
            @Mapping(target="content", expression="java(dto.getContent().getBytes())")
    })
    Attachment dtoToEntity(AttachmentDto dto) throws IOException;
}
