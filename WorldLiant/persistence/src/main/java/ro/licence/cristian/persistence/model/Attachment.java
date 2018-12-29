package ro.licence.cristian.persistence.model;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Lob;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Attachment extends BaseEntity<Long> {
    private String type;
    private String name;

    @Lob
    private byte[] content;
}
