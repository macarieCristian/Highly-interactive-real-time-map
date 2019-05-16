package ro.licence.cristian.persistence.model;

import lombok.*;
import ro.licence.cristian.persistence.model.enums.MessageStatusType;

import javax.persistence.*;
import java.time.LocalDateTime;

@NamedQuery(name = "SimpleMessage.getConversation",
        query = "select new SimpleMessage(m.id, m.source.username, m.destination.username, m.message, m.date) from SimpleMessage m " +
                "where (m.source.username = :source and m.destination.username = :destination) or " +
                "(m.source.username = :destination and m.destination.username = :source)")
@NamedQuery(name = "SimpleMessage.getConversationEvent",
        query = "select new SimpleMessage(m.id, m.source.username, m.destinationEvent.id, m.message, m.date) from SimpleMessage m " +
                "where m.destinationEvent.id = :idEvent")

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(callSuper = true, exclude = {"source", "destination", "destinationEvent"})
@ToString(callSuper = true, exclude = {"source", "destination", "destinationEvent"})
@Builder
public class SimpleMessage extends BaseEntity<Long> {

    @ManyToOne(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser source;

    @ManyToOne(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    private AppUser destination;

    @ManyToOne(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    private Event destinationEvent;

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

    public SimpleMessage(Long id, String source, Long destinationEvent, String message, LocalDateTime date) {
        super(id);
        this.source = AppUser.builder().username(source).build();
        this.destinationEvent = new Event(destinationEvent);
        this.message = message;
        this.date = date;
    }
}
