package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.CascadeType;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;

@Entity
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = "appUser")
@ToString(callSuper = true, exclude = "appUser")
@Builder
public class Location extends BaseEntity<Long> {
    private Double longitude;
    private Double latitude;
    private String country;
    private String county;
    private String city;

    @ManyToOne(cascade = CascadeType.MERGE)
    private AppUser appUser;
}
