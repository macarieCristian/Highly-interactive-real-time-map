package ro.licence.cristian.persistence.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum RoleType {
    ROLE_ADMIN(1L),
    ROLE_PREMIUM_USER(2L),
    ROLE_REGULAR_USER(3L);

    private Long id;
}
