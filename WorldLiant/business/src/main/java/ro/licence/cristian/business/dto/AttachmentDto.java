package ro.licence.cristian.business.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class AttachmentDto extends BaseDto {
    private String type;
    private String name;
    private MultipartFile content;
}
