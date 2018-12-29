package ro.licence.cristian.business.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.model.enums.GenderType;
import ro.licence.cristian.persistence.model.enums.StatusType;

import java.time.LocalDate;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true, exclude = "password")
@Getter
@Setter
@Builder
public class AppUserDto extends BaseDto {
    private String username;
    private String firstName;
    private String lastName;
    private String password;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;
    private GenderType gender;
    private StatusType statusType;
    private AccountStatusType accountStatusType;
    private Set<RoleDto> roles;
    private LocationDto homeLocation;
    private AttachmentDto profilePicture;
    private Set<LocationDto> desiredLocations;
}
