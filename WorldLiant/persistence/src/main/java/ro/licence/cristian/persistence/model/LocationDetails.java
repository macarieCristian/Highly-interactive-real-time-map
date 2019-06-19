package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.*;
import java.util.Set;

@Entity
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"attachments", "location"})
@ToString(callSuper = true, exclude = {"attachments", "location"})
@Builder
public class LocationDetails extends BaseEntity<Long> {
    private String description;

    @OneToOne(fetch = FetchType.LAZY, mappedBy = "locationDetails")
    private Location location;

    @OneToMany(cascade = CascadeType.ALL)
    private Set<Attachment> attachments;

    public LocationDetails(Long id, String description) {
        super(id);
        this.description = description;
    }
}
