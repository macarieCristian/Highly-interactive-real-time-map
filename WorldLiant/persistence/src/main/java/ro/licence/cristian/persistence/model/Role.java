package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.RoleType;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.ManyToMany;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class Role extends BaseEntity<Long> {

    @Enumerated(EnumType.STRING)
    private RoleType roleType;

}
