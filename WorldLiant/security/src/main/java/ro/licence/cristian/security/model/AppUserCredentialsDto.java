package ro.licence.cristian.security.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AppUserCredentialsDto {
    private String username;
    private String password;
}
