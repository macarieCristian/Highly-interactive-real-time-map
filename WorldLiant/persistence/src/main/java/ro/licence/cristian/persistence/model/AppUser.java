package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.RoleType;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"homeLocation", "desiredLocations"})
@ToString(callSuper = true, exclude = {"homeLocation", "desiredLocations"})
@Builder
public class AppUser extends BaseEntity<Long> {
    private String username;
    private String password;
    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private RoleType roleType;

    @OneToOne
    private Location homeLocation;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE})
    @JoinColumn(name = "app_user_id")
    private Set<Location> desiredLocations = new HashSet<>();

    public void addDesiredLocation(@NotNull Location desiredLocation){
        desiredLocations.add(desiredLocation);
    }

    public void removeDesiredLocation(@NotNull Location desiredLocation){
        desiredLocations.remove(desiredLocation);
    }
}
