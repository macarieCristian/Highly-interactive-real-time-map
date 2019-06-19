package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.*;
@Entity
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"appUser", "locationDetails"})
@ToString(callSuper = true, exclude = {"appUser", "locationDetails"})
@Builder
public class Location extends BaseEntity<Long> {
    private Double longitude;
    private Double latitude;
    private String country;
    private String county;
    private String city;

    @ManyToOne(cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
    private AppUser appUser;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LocationDetails locationDetails;

    public Location(Long id, Double longitude, Double latitude, String country, String county, String city) {
        super(id);
        this.longitude = longitude;
        this.latitude = latitude;
        this.country = country;
        this.county = county;
        this.city = city;
    }
}
