package ro.licence.cristian.business.dto;

import lombok.*;
import org.springframework.http.MediaType;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class AttachmentDto extends BaseDto {
    private MediaType type;
    private String name;
    private byte[] content;
}
