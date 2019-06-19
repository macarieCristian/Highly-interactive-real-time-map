package ro.licence.cristian.business.dto;

import lombok.*;
import org.springframework.http.MediaType;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = "content")
@ToString(callSuper = true, exclude = "content")
@Builder
public class AttachmentDto extends BaseDto {
    private String type;
    private String name;
    private byte[] content;

    public AttachmentDto(Long id) {
        super(id);
    }
}
