package ro.licence.cristian.business.mapper;

import org.mapstruct.*;
import ro.licence.cristian.business.dto.AppUserDto;
import ro.licence.cristian.business.mapper.annotation.Custom;
import ro.licence.cristian.business.mapper.annotation.Simple;
import ro.licence.cristian.persistence.model.AppUser;

import java.util.List;

@Mapper(
        uses = {LocationMapper.class, RoleMapper.class, AttachmentMapper.class, ScanAreaMapper.class},
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = "spring"
)
public interface AppUserMapper extends BaseMapper<AppUser, AppUserDto> {

    @Custom
    @Mapping(source = "password", target = "password", ignore = true)
    @Mapping(source = "roles", target = "roles", ignore = true)
    @Mapping(source = "scanAreas", target = "scanAreas", ignore = true)
    AppUserDto entityToDtoProjection(AppUser appUser);

    @Mapping(source = "password", target = "password", ignore = true)
    @Mapping(source = "roles", target = "roles", ignore = true)
    @Mapping(source = "profilePicture", target = "profilePicture", ignore = true)
    @Mapping(source = "scanAreas", target = "scanAreas", ignore = true)
    AppUserDto entityToDtoProjectionDesiredLocationsLoaded(AppUser appUser);

    @Mapping(source = "password", target = "password", ignore = true)
    @Mapping(source = "roles", target = "roles", ignore = true)
    @Mapping(source = "desiredLocations", target = "desiredLocations", ignore = true)
    @Mapping(source = "scanAreas", target = "scanAreas", ignore = true)
    AppUserDto entityToDtoProjectionProfilePicLoaded(AppUser appUser);

    @Simple
    @Override
    AppUserDto entityToDto(AppUser entity);

    @Override
    @IterableMapping(qualifiedBy = Simple.class)
    List<AppUserDto> entitiesToDtos(List<AppUser> entities);

    @IterableMapping(qualifiedBy = Custom.class)
    List<AppUserDto> entitiesToDtosCustom(List<AppUser> entities);
}
