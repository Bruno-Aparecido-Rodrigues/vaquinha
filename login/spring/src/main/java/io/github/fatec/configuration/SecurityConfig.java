package io.github.fatec.configuration;

import io.github.fatec.security.CookieSecurity;
import io.github.fatec.security.JwtAuthFilterSecurity;
import io.github.fatec.security.JwtSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

//Spring Security sem sessão rotas públicas, BCrypt e o filtro do JWT
@Configuration
public class SecurityConfig {

    @Bean //criptografia da senha
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean //estrutura para validar o usuário na hora do login
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean// vai interceptar as requisições, ler o cookie, extrair/validar o token JWT e autenticar
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtSecurity jwtSecurity,
            CookieSecurity cookieSecurity,
            UserDetailsService userDetailsService) throws Exception {
        
        JwtAuthFilterSecurity jwtFilter = new JwtAuthFilterSecurity(jwtSecurity, cookieSecurity, userDetailsService);

        http
                // CORS fica no gateway o front só conversa com o gateway
                .cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Rotas públicas, login, cadastro e logout
                        .requestMatchers(
                                "/login/auth",
                                "/login/v1/create",
                                "/login/v1/logout")
                        .permitAll()
                        .anyRequest().authenticated()) // todo o resto privada se n tiver o jwt
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
