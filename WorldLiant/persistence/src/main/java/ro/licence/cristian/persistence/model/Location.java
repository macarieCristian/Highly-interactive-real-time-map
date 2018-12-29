package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.Embeddable;
import javax.persistence.Entity;

@Entity
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class Location extends BaseEntity<Long> {
    private String longitude;
    private String latitude;
    private String country;
    private String county;
    private String city;
}
