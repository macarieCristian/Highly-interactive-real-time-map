package ro.licence.cristian.business.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum BusinessExceptionCode {
    USER_WITH_USERNAME_DOES_NOT_EXIST(100, "No user with this username found")
    ;
    private Integer code;
    private String message;
}
