package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.model.enums.GenderType;
import ro.licence.cristian.persistence.model.enums.StatusType;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@NamedEntityGraphs({
        @NamedEntityGraph(name = "appUserWithRoles",
    attributeNodes = @NamedAttributeNode(value = "roles")),
        @NamedEntityGraph(name = "appUserWithDesiredLocations",
        attributeNodes = @NamedAttributeNode(value = "desiredLocations"))
})
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"homeLocation", "desiredLocations", "roles"})
@ToString(callSuper = true, exclude = {"homeLocation", "desiredLocations", "roles", "password"})
@Builder
public class AppUser extends BaseEntity<Long> {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private GenderType gender;

    @Enumerated(EnumType.STRING)
    private StatusType statusType;

    @Enumerated(EnumType.STRING)
    private AccountStatusType accountStatusType;

    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.DETACH})
    private Set<Role> roles = new HashSet<>();

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE})
    private Location homeLocation;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE}, fetch = FetchType.LAZY)
    private Attachment profilePicture;

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
