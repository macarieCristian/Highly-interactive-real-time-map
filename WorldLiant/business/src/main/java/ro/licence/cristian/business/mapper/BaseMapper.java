package ro.licence.cristian.business.mapper;

import org.mapstruct.IterableMapping;
import ro.licence.cristian.business.dto.BaseDto;
import ro.licence.cristian.business.mapper.annotation.Custom;
import ro.licence.cristian.business.mapper.annotation.Simple;
import ro.licence.cristian.persistence.model.BaseEntity;

import java.util.List;

public interface BaseMapper<E extends BaseEntity, DTO extends BaseDto> {

    DTO entityToDto(E entity);

    E dtoToEntity(DTO dto);

    List<DTO> entitiesToDtos(List<E> entities);

    List<E> dtosToEntities(List<DTO> dtos);
}
