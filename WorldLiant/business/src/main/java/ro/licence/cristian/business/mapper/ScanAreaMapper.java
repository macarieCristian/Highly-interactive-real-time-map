package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.ScanAreaDto;
import ro.licence.cristian.persistence.model.ScanArea;

@Mapper(
        uses = {LocationMapper.class, AttachmentMapper.class},
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface ScanAreaMapper extends BaseMapper<ScanArea, ScanAreaDto> {
}
