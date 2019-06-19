package ro.licence.cristian.business.dto;

import lombok.*;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class LocationDetailsDto extends BaseDto{
    private String description;
    private Set<AttachmentDto> attachments;
}
