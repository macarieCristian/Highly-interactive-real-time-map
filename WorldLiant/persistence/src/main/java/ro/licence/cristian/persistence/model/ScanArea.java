package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.ScanAreaNotificationStatusType;

import javax.persistence.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = "appUser")
@ToString(callSuper = true, exclude = "appUser")
@Builder
public class ScanArea extends BaseEntity<Long> {
    private Double longitude;
    private Double latitude;
    private String country;
    private String county;
    private String city;
    private String name;
    private Double radius;

    @Enumerated(EnumType.STRING)
    private ScanAreaNotificationStatusType notificationStatus;

    @Column(length = 400)
    private String scanOptions;

    @ManyToOne(cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
    private AppUser appUser;


    public ScanArea(Long id, Double longitude, Double latitude, String country, String county, String city, String name, Double radius, ScanAreaNotificationStatusType notificationStatus, String scanOptions) {
        this.setId(id);
        this.longitude = longitude;
        this.latitude = latitude;
        this.country = country;
        this.county = county;
        this.city = city;
        this.name = name;
        this.radius = radius;
        this.notificationStatus = notificationStatus;
        this.scanOptions = scanOptions;
    }
}
