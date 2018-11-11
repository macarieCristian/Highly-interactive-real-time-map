package ro.licence.cristian.security.jwtfilter;

import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import ro.licence.cristian.security.util.Constants;
import ro.licence.cristian.security.util.TokenProvider;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthorizationFilter extends OncePerRequestFilter {
    private static Logger logger = LoggerFactory.getLogger(JwtAuthorizationFilter.class);

    @Autowired
    private TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
        String header = req.getHeader(Constants.HEADER_STRING);
        String username = null;
        String authToken = null;
        if (header != null && header.startsWith(Constants.TOKEN_PREFIX)) {
            authToken = header.replace(Constants.TOKEN_PREFIX, "");
            try {
                Claims claims = tokenProvider.getClaimsFromToken(authToken);
                username = claims.getSubject();
            } catch (ExpiredJwtException e1) {
                res.addHeader(Constants.EXCEPTION_MESSAGE_HEADER, "Token is expired.");
                logger.warn("Exception={}", e1.getMessage());
            } catch (SignatureException e2) {
                res.addHeader(Constants.EXCEPTION_MESSAGE_HEADER, "Token has wrong signature.");
                logger.warn("Exception={}", e2.getMessage());
            } catch (MalformedJwtException e3) {
                res.addHeader(Constants.EXCEPTION_MESSAGE_HEADER, "Token is malformed.");
                logger.warn("Exception={}", e3.getMessage());
            } catch (IllegalArgumentException | UnsupportedJwtException e) {
                res.addHeader(Constants.EXCEPTION_MESSAGE_HEADER, "Token is not supported.");
                logger.warn("Exception={}", e.getMessage());
            }
        } else {
            logger.warn("couldn't find bearer string, will ignore the header");
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication = tokenProvider.getAuthentication(authToken);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
            logger.info("authorized user: " + username + ", setting security context");
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        chain.doFilter(req, res);
    }
}
