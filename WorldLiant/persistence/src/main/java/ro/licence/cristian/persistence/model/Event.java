package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;
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
    private LocalDate startDate;
    private LocalDate endDate;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser contactPerson;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE})
    private Location location;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private Attachment profilePicture;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.REMOVE, CascadeType.MERGE}, mappedBy = "event")
    private Set<Attachment> attachments;
}
