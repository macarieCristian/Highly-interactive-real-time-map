package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.AccountStatusType;
import ro.licence.cristian.persistence.model.enums.GenderType;
import ro.licence.cristian.persistence.model.enums.StatusType;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.Set;

@NamedEntityGraphs({
        @NamedEntityGraph(name = "appUserWithRoles",
    attributeNodes = @NamedAttributeNode(value = "roles")),
        @NamedEntityGraph(name = "appUserWithDesiredLocations",
        attributeNodes = @NamedAttributeNode(value = "desiredLocations"))
})
@NamedQuery(name = "AppUser.getUsersWithScanAreasContainingPoint",
query = "select distinct u.firstName as firstName, u.lastName as lastName, " +
        "u.email as email, u.username as username, " +
        "u.phone as phone, function('string_agg', sa.name, ',') as scanAreas " +
        "from AppUser u join u.scanAreas sa " +
        "where u.username <> :username and sa.notificationStatus = :notificationStatus and " +
        "function('haversinedistance', sa.latitude, sa.longitude, :lat, :lng) <= sa.radius " +
        "group by u.id")
@NamedQuery(name = "AppUser.getUserScanAreas",
query = "select new ro.licence.cristian.persistence.model.ScanArea( " +
        "sa.id, sa.longitude, sa.latitude, sa.country, sa.county, sa.city, " +
        "sa.name, sa.radius, sa.notificationStatus, sa.scanOptions ) " +
        "from AppUser u " +
        "join u.scanAreas sa " +
        "where u.username = :username")
@NamedQuery(name = "AppUser.changeUserStatus",
query = "update AppUser u set u.statusType = :status where u.username = :username")
@NamedQuery(name = "AppUser.findAppUserIdByUsername",
query = "select u.id from AppUser u where u.username = :username")
@NamedQuery(name = "AppUser.findAppUserByUsernameProfilePicLoaded",
query = "select distinct u from AppUser u join fetch u.profilePicture where u.username = :username")
@NamedQuery(name = "AppUser.getUsersWithLocationsSatisfyingScanCriteria",
        query = "select distinct u from AppUser u join fetch u.profilePicture join fetch u.desiredLocations dl " +
                "where function('haversinedistance', :lat, :lng, dl.latitude, dl.longitude) <= :rad and u.username <> :username")
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

    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.DETACH}, fetch = FetchType.LAZY)
    private Set<Role> roles;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE})
    private Location homeLocation;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE}, fetch = FetchType.LAZY)
    private Attachment profilePicture;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE}, mappedBy = "appUser")
    private Set<Location> desiredLocations;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE}, mappedBy = "appUser")
    private Set<ScanArea> scanAreas;

    public AppUser(String username) {
        this.username = username;
    }
}
