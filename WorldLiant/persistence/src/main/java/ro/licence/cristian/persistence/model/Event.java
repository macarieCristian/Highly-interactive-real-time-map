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
public class Event extends BaseEntity<Long> {
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToOne(cascade = {CascadeType.REMOVE, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser contactPerson;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE})
    private Location location;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private Attachment profilePicture;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, mappedBy = "event")
    private Set<Attachment> attachments;
}
