package io.github.fatec.controller;

import io.github.fatec.controller.adapter.AuthControllerAdapter;
import io.github.fatec.controller.adapter.UserControllerAdapter;
import io.github.fatec.controller.request.LoginRequest;
import io.github.fatec.controller.request.RegisterRequest;
import io.github.fatec.controller.response.AuthResponse;
import io.github.fatec.controller.response.ErrorResponse;
import io.github.fatec.entity.Login;
import io.github.fatec.entity.User;
import io.github.fatec.repository.UserRepository;
import io.github.fatec.security.CookieSecurity;
import io.github.fatec.security.TokenSecurity;
import io.github.fatec.security.dto.AuthUserDetails;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
public class AuthController {

    private final UserRepository repository;
    private final TokenSecurity tokenSecurity;
    private final CookieSecurity cookieSecurity;

    public AuthController(
            UserRepository repository,
            TokenSecurity tokenSecurity,
            CookieSecurity cookieSecurity) {
        this.repository = repository;
        this.tokenSecurity = tokenSecurity;
        this.cookieSecurity = cookieSecurity;
    }

    /** Cadastro (tela "Criar conta"): cria um CLIENTE e já devolve o cookie, então o usuário entra logado. */
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/v1/create")
    public AuthResponse create(@RequestBody RegisterRequest request, HttpServletResponse response) {
        User saved = repository.save(UserControllerAdapter.cast(request));

        AuthUserDetails userDetails = tokenSecurity.autenticar(new Login(saved.email(), request.senha()));
        String token = tokenSecurity.gerarToken(userDetails);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieSecurity.criar(token, true).toString());
        return AuthControllerAdapter.toResponse(userDetails.user());
    }

    @ResponseStatus(HttpStatus.OK)
    @PostMapping("/auth")
    public AuthResponse login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthUserDetails userDetails = tokenSecurity.autenticar(AuthControllerAdapter.cast(request));
        String token = tokenSecurity.gerarToken(userDetails);
        boolean lembrar = request.lembrar() == null || request.lembrar();
        response.addHeader(HttpHeaders.SET_COOKIE, cookieSecurity.criar(token, lembrar).toString());
        return AuthControllerAdapter.toResponse(userDetails.user());
    }

    /** O cookie é HttpOnly: só o servidor consegue apagá-lo. */
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PostMapping("/v1/logout")
    public void logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookieSecurity.apagar().toString());
    }

    /** Usado pelo front ao abrir o site para saber se o cookie ainda é válido e quem está logado. */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/v1/me")
    public AuthResponse me(@AuthenticationPrincipal AuthUserDetails userDetails) {
        return AuthControllerAdapter.toResponse(userDetails.user());
    }

    // ---------- Tratamento de erros (devolve { "mensagem": "..." } para o front) ----------

    @ExceptionHandler(DuplicateKeyException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse emailDuplicado(DuplicateKeyException ex) {
        return new ErrorResponse("E-mail já cadastrado");
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse naoAutenticado(AuthenticationException ex) {
        return new ErrorResponse("E-mail ou senha inválidos");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse dadoInvalido(IllegalArgumentException ex) {
        return new ErrorResponse(ex.getMessage());
    }
}
