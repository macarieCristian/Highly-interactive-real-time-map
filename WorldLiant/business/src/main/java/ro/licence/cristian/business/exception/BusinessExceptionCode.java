package ro.licence.cristian.business.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum BusinessExceptionCode {
    USER_WITH_USERNAME_DOES_NOT_EXIST(100, "No user with this username found"),
    THIS_USERNAME_ALREADY_EXISTS(101, "There is already an user with this username"),
    CAN_NOT_SAVE_PHOTO(500, "Photo can't be saved"),
    CAN_NOT_READ_PHOTO(501, "Photo can't be red"),
    ATTACHMENT_FOR_USERNAME_DOES_NOT_EXIST(505, "No attachment available for given username"),
    LOCATION_DOES_NOT_EXIST(550, "Location you're looking for does not exist"),

    EVENT_DOES_NOT_EXIST(600, "The event you're looking for does not exist"),



    CAN_NOT_FIND_REQUIRED_HEADER(1000, "You missed some headers.")
    ;
    private Integer code;
    private String message;
}
