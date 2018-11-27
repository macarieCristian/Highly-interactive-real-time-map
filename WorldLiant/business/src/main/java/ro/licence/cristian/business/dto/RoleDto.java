package ro.licence.cristian.business.dto;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.RoleType;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class RoleDto extends BaseDto{
    private RoleType roleType;
}
