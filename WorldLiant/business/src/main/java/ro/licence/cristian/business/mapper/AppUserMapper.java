package ro.licence.cristian.business.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.mapper.annotation.Custom;
import ro.licence.cristian.persistence.model.AppUser;

@Mapper(
        uses = {LocationMapper.class, RoleMapper.class, AttachmentMapper.class},
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface AppUserMapper extends BaseMapper<AppUser, AppUserDto> {

    @Custom
    @Mapping(source = "password", target = "password", ignore = true)
    @Mapping(source = "roles", target = "roles", ignore = true)
    AppUserDto entityToDtoProjection(AppUser appUser);

    @Mapping(source = "password", target = "password", ignore = true)
    @Mapping(source = "roles", target = "roles", ignore = true)
    @Mapping(source = "profilePicture", target = "profilePicture", ignore = true)
    AppUserDto entityToDtoProjectionNoLazy(AppUser appUser);


}
