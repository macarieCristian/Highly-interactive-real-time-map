package ro.licence.cristian.persistence.model;

import lombok.*;
import org.springframework.http.MediaType;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.OneToOne;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"owner", "content"})
@ToString(callSuper = true, exclude = {"owner", "content"})
@Builder
public class Attachment extends BaseEntity<Long> {
    private String type;
    private String name;

    @Lob
    private byte[] content;

    @OneToOne
    private AppUser owner;
}
