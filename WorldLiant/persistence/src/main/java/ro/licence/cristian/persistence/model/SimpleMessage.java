package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.MessageStatusType;

import javax.persistence.*;
import java.time.LocalDateTime;

@NamedQuery(name = "SimpleMessage.getConversation",
        query = "select new SimpleMessage(m.id, m.source.username, m.destination.username, m.message, m.date) from SimpleMessage m " +
                "where (m.source.username = :source and m.destination.username = :destination) or " +
                "(m.source.username = :destination and m.destination.username = :source)")

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
public class SimpleMessage extends BaseEntity<Long> {

    @ManyToOne(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser source;

    @ManyToOne(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser destination;

    private String message;
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private MessageStatusType statusType;

    public SimpleMessage(Long id, String source, String destination, String message, LocalDateTime date) {
        super(id);
        this.source = AppUser.builder().username(source).build();
        this.destination = AppUser.builder().username(destination).build();
        this.message = message;
        this.date = date;
    }
}
