package ro.licence.cristian.security.exception;

public class JwtSecurityException extends RuntimeException {

    public JwtSecurityException(String message) {
        super(message);
    }

    public JwtSecurityException(String message, Throwable cause) {
        super(message, cause);
    }

    public JwtSecurityException(Throwable cause) {
        super(cause);
    }
}
