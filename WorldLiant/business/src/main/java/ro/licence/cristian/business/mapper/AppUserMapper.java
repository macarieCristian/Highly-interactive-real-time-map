package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.persistence.model.AppUser;

@Mapper(
        uses = {LocationMapper.class, RoleMapper.class, AttachmentMapper.class},
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface AppUserMapper extends BaseMapper<AppUser, AppUserDto> {

    @Override
    @Mapping(target = "profilePicture", ignore = true)
    AppUserDto entityToDto(AppUser entity);
}
