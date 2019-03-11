package ro.licence.cristian.business.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class ScanAreaDto extends LocationDto {
    private String name;
    private Double radius;
}
