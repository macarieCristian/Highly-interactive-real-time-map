package ro.licence.cristian.business.exception;

public class BusinessException extends Exception {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(BusinessExceptionCode businessExceptionCode) {
        super(businessExceptionCode.getMessage());
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }

    public BusinessException(Throwable cause) {
        super(cause);
    }
}
