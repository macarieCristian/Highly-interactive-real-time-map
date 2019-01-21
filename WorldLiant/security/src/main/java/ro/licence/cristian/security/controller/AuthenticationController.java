package ro.licence.cristian.security.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.licence.cristian.security.dto.TokenDto;
import ro.licence.cristian.security.model.AppUserCredentialsDto;
import ro.licence.cristian.security.util.TokenProvider;

@RestController
@RequestMapping("/authentication")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenProvider tokenProvider;

    @PostMapping(value = "/login")
    public ResponseEntity<TokenDto> login(@RequestBody AppUserCredentialsDto appUserCredentialsDto) {
        final Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        appUserCredentialsDto.getUsername(),
                        appUserCredentialsDto.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        final String token = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new TokenDto(token));
    }
}
