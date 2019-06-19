package ro.licence.cristian.business.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class LocationDto extends BaseDto {
    private Double longitude;
    private Double latitude;
    private String country;
    private String county;
    private String city;
    private LocationDetailsDto locationDetails;

}
