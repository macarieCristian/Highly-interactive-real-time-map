package ro.licence.cristian.security.util;

import java.util.Base64;

public class Constants {
    public static final String AUTHORITIES_KEY = "auth";
    public static final String SECRET_KEY = Base64.getEncoder().encodeToString("secret".getBytes());
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final Long VALIDITY_TIME = 3_600_000L; //1h
    public static final String EXCEPTION_MESSAGE_HEADER = "ex-msg";

    private Constants() { }
}
