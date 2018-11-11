package ro.licence.cristian.security.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class TokenProvider {

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

    public UsernamePasswordAuthenticationToken getAuthentication(final String token) {
        final Claims claims = Jwts.parser()
                .setSigningKey(Constants.SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        final Collection<SimpleGrantedAuthority> authorities =
                Arrays.stream(claims.get(Constants.AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
        final User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(Constants.SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

}
