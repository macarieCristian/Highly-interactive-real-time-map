package ro.licence.cristian.security.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import ro.licence.cristian.persistence.model.Role;
import ro.licence.cristian.persistence.model.enums.RoleType;
import ro.licence.cristian.security.service.CustomUserDetailsService;

import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class TokenProvider {
    private static final Logger log = LoggerFactory.getLogger(TokenProvider.class);

    @Autowired
    private CustomUserDetailsService userDetailsService;

    public String generateToken(Authentication authentication) {
        final String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        return Jwts.builder()
                .setSubject(authentication.getName())
                .claim(Constants.AUTHORITIES_KEY, authorities)
                .signWith(SignatureAlgorithm.HS256, Constants.SECRET_KEY)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + Constants.VALIDITY_TIME))
                .compact();
    }

    public UsernamePasswordAuthenticationToken getAuthentication(@NotNull final Claims claims) {
        final Set<SimpleGrantedAuthority> authorities =
                Arrays.stream(claims.get(Constants.AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet());
        final User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    public Boolean isUserDisabled(String username) {
        return userDetailsService.isUserDisabled(username);
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(Constants.SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

}
