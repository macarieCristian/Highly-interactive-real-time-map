package ro.licence.cristian.business.dto;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.ScanAreaNotificationStatusType;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class ScanAreaDto extends LocationDto {
    private String name;
    private Double radius;
    private String scanOptions;
    private ScanAreaNotificationStatusType notificationStatus;
}
