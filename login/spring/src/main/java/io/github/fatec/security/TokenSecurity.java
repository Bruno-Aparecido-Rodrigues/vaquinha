package io.github.fatec.security;

import io.github.fatec.entity.Login;
import io.github.fatec.security.dto.AuthUserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class TokenSecurity {
    private final JwtSecurity jwtSecurity;
    private final AuthenticationManager authenticationManager;

    public TokenSecurity(JwtSecurity jwtSecurity, AuthenticationManager authenticationManager) {
        this.jwtSecurity = jwtSecurity;
        this.authenticationManager = authenticationManager;
    }

    /** Confere e-mail e senha. Lança BadCredentialsException se estiverem errados. */
    public AuthUserDetails autenticar(Login login) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(login.email(), login.password()));
        return (AuthUserDetails) auth.getPrincipal();
    }

    public String gerarToken(AuthUserDetails userDetails) {
        return jwtSecurity.generateToken(userDetails);
    }
}
