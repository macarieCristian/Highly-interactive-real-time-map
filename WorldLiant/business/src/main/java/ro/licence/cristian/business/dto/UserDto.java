package ro.licence.cristian.business.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
}
