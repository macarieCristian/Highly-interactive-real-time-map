package ro.licence.cristian.business.dto.websocket_dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ro.licence.cristian.business.dto.websocket_dto.enums.StandardMessageType;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StandardMessageDto implements Serializable{
    private String source;
    private String message;
    private StandardMessageType standardMessageType;
}
