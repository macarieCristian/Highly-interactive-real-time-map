package ro.licence.cristian.business.dto.websocket_dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SimpleMessageDto implements Serializable {
    private String destination;
    private String content;
}
