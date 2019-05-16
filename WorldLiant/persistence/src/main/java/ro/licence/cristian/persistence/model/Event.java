package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"location", "profilePicture", "attachments", "contactPerson"})
@ToString(exclude = {"location", "profilePicture", "attachments", "contactPerson"})
@Builder
public class Event extends BaseEntity<Long> {
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToOne(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser contactPerson;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE})
    private Location location;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private Attachment profilePicture;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, mappedBy = "event")
    private Set<Attachment> attachments;

    public Event(Long id, String name, String description, LocalDateTime startDate, LocalDateTime endDate, String contactFirstName, String contactLastName, String contactPhone, String contactEmail, Location location, Attachment profilePicture) {
        super(id);
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.contactPerson = AppUser.builder()
                .firstName(contactFirstName)
                .lastName(contactLastName)
                .phone(contactPhone)
                .email(contactEmail)
                .build();
        this.location = location;
        this.profilePicture = profilePicture;
    }

    public Event(Long id) {
        super(id);
    }
}
