package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.AttachmentDto;
import ro.licence.cristian.persistence.model.Attachment;

@Mapper(
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface AttachmentMapper extends BaseMapper<Attachment, AttachmentDto> {
}
