package ro.licence.cristian.business.dto.websocket_dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ro.licence.cristian.business.dto.LocationDto;
import ro.licence.cristian.business.dto.websocket_dto.enums.EventType;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MarkerEventDto implements Serializable{
    private String source;
    private String destination;
    private EventType eventType;
    private Long idEvent;
    private LocationDto location;
}
