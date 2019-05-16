package ro.licence.cristian.persistence.model;

import lombok.*;
import org.springframework.http.MediaType;

import javax.persistence.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"owner", "content", "ownerEvent"})
@ToString(callSuper = true, exclude = {"owner", "content", "ownerEvent"})
@Builder
public class Attachment extends BaseEntity<Long> {
    private String type;
    private String name;

    @Lob
    private byte[] content;

    @OneToOne(fetch = FetchType.LAZY)
    private AppUser owner;

    @OneToOne(fetch = FetchType.LAZY, mappedBy = "profilePicture")
    private Event ownerEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    private Event event;

    public Attachment(Long id) {
        super(id);
    }
}
