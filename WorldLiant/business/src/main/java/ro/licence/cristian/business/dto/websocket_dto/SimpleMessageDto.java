package ro.licence.cristian.business.dto.websocket_dto;

import lombok.*;
import ro.licence.cristian.business.dto.BaseDto;
import ro.licence.cristian.business.dto.websocket_dto.enums.EventType;
import ro.licence.cristian.persistence.model.enums.MessageStatusType;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class SimpleMessageDto extends BaseDto {
    private String source;
    private String destination;
    private String message;
    private EventType eventType;
    private MessageStatusType statusType;
    private LocalDateTime date;
}
