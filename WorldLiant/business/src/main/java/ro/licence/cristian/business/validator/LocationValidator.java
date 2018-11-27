package ro.licence.cristian.business.validator;

import org.springframework.stereotype.Component;
import ro.licence.cristian.business.exception.CustomValidationException;
import ro.licence.cristian.business.validator.util.ValidationUtil;
import ro.licence.cristian.persistence.model.Location;

@Component
public class LocationValidator {
    private static final String COORDINATE_REGEX = "^[0-9]+\\.[0-9]+$";

    public void validate(Location location) {
        ValidationUtil.checkNotEmptyAndRegexAndLength(location.getLongitude(), COORDINATE_REGEX,3);
        ValidationUtil.checkNotEmptyAndRegexAndLength(location.getLatitude(), COORDINATE_REGEX,3);
    }
}
