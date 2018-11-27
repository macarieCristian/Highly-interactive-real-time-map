package ro.licence.cristian.business.validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import ro.licence.cristian.business.exception.CustomValidationException;
import ro.licence.cristian.business.validator.util.ValidationUtil;
import ro.licence.cristian.business.validator.config.AppUserValidationConfig;
import ro.licence.cristian.persistence.model.AppUser;

import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class AppUserValidator {
    private static final String USERNAME_REGEX = "^[a-zA-Z0-9]+$";
    private static final String PASSWORD_REGEX = "^[a-zA-Z0-9.@*&$]+$";
    private static final String NAME_REGEX = "^[a-zA-Z]+$";
    private static final String PHONE_REGEX = "^[0-9]+$";
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+\\.[a-zA-Z]+$";
    private static final Map<AppUserValidationConfig, Runnable> validations = new HashMap<>();
    private static AppUser appUserInstance;

    private static LocationValidator locationValidator = new LocationValidator();

    static {
        validations.put(AppUserValidationConfig.USERNAME,
                () -> ValidationUtil.checkNotEmptyAndRegexAndLength(appUserInstance.getUsername(), USERNAME_REGEX, 5));
        validations.put(AppUserValidationConfig.PASSWORD,
                () -> ValidationUtil.checkNotEmptyAndRegexAndLength(appUserInstance.getPassword(), PASSWORD_REGEX, 4));
        validations.put(AppUserValidationConfig.FIRST_NAME,
                () -> ValidationUtil.checkNotEmptyAndRegexAndLength(appUserInstance.getFirstName(), NAME_REGEX, 3));
        validations.put(AppUserValidationConfig.LAST_NAME,
                () -> ValidationUtil.checkNotEmptyAndRegexAndLength(appUserInstance.getLastName(), NAME_REGEX, 3));
        validations.put(AppUserValidationConfig.PHONE,
                () -> ValidationUtil.checkNotEmptyAndRegexAndLength(appUserInstance.getPhone(), PHONE_REGEX, 10));
        validations.put(AppUserValidationConfig.EMAIL,
                () -> ValidationUtil.checkNotEmptyAndRegexAndLength(appUserInstance.getEmail(), EMAIL_REGEX, 14));
        validations.put(AppUserValidationConfig.HOME_LOCATION,
                () -> locationValidator.validate(appUserInstance.getHomeLocation()));
    }

    public void validate(AppUser appUser, @NotNull AppUserValidationConfig... excluded) {
        if(appUser == null)
            throw new CustomValidationException(ValidationUtil.NULL_ENTITY);
        appUserInstance = appUser;
        List<AppUserValidationConfig> excludedValidations = Stream.of(excluded).collect(Collectors.toList());
        validations.keySet().stream()
                .filter(config -> !excludedValidations.contains(config))
                .forEach(config -> validations.get(config).run());

    }


}
