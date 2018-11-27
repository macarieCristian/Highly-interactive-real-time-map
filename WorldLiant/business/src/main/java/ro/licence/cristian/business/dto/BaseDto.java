package ro.licence.cristian.business.dto;

import lombok.*;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class BaseDto implements Serializable {
    private Long id;
}
