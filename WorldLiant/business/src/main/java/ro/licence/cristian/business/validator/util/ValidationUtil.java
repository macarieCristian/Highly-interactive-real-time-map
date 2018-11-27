package ro.licence.cristian.business.validator.util;

import ro.licence.cristian.business.exception.CustomValidationException;

import java.text.MessageFormat;

public class ValidationUtil {
    private static final String FIELD_NOT_EMPTY = "{0} field mustn't be empty!";
    private static final String DOES_NOT_MATCH_REGEX = "Field {0} has wrong pattern!";
    private static final String LENGTH_DOES_NOT_MATCH = "Field {0} has wrong length!";

    public static final String NULL_ENTITY = "Null entity!";

    public static void checkNotEmptyAndRegexAndLength(String field, String regex, Integer minLength) throws CustomValidationException {
        if(field == null || field.equals(""))
            throw new CustomValidationException(MessageFormat.format(ValidationUtil.FIELD_NOT_EMPTY, field));
        if(!field.matches(regex))
            throw new CustomValidationException(MessageFormat.format(ValidationUtil.DOES_NOT_MATCH_REGEX, field));
        if(field.length() < minLength)
            throw new CustomValidationException(MessageFormat.format(ValidationUtil.LENGTH_DOES_NOT_MATCH, field));
    }

}
