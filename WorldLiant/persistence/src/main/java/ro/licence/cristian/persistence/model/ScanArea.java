package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.Entity;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder(builderMethodName = "childBuilder")
public class ScanArea extends Location {
    private String name;
    private Double radius;

    public ScanArea(Long id, Double longitude, Double latitude, String country, String county, String city, String name, Double radius) {
        super(id, longitude, latitude, country, county, city);
        this.name = name;
        this.radius = radius;
    }
}
