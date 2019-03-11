package ro.licence.cristian.business.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Getter
@Setter
@Builder
public class EventDto extends BaseDto {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private AppUserDto contactPerson;
    private LocationDto location;
    private AttachmentDto profilePicture;
    private Set<AttachmentDto> attachments;
}
