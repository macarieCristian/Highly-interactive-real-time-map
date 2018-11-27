package ro.licence.cristian.business.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class LocationDto extends BaseDto {
    private String longitude;
    private String latitude;
    private String country;
    private String city;

}
