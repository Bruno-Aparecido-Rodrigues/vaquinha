package io.github.fatec.controller;

import io.github.fatec.controller.adapter.CampanhaControllerAdapter;
import io.github.fatec.controller.request.CampanhaRequest;
import io.github.fatec.controller.request.CampanhaUpdateRequest;
import io.github.fatec.controller.response.CampanhaResponse;
import io.github.fatec.controller.response.ErrorResponse;
import io.github.fatec.service.CampanhaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/campanha")
public class CampanhaController {

    // Cabeçalhos que o gateway acrescenta depois de validar o cookie do usuário
    private static final String USER_ID = "X-User-Id";
    private static final String USER_NOME = "X-User-Nome";

    private final CampanhaService service;

    public CampanhaController(CampanhaService service) {
        this.service = service;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/save")
    public CampanhaResponse save(
            @RequestBody CampanhaRequest request,
            @RequestHeader(USER_ID) String usuarioId,
            @RequestHeader(USER_NOME) String usuarioNome) {
        String nome = URLDecoder.decode(usuarioNome, StandardCharsets.UTF_8);
        return CampanhaControllerAdapter.toResponse(
                service.criar(CampanhaControllerAdapter.cast(request, usuarioId, nome)));
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/update")
    public CampanhaResponse update(
            @RequestBody CampanhaUpdateRequest request,
            @RequestHeader(USER_ID) String usuarioId) {
        return CampanhaControllerAdapter.toResponse(
                service.atualizar(CampanhaControllerAdapter.cast(request), usuarioId));
    }

    @ResponseStatus(HttpStatus.OK)
    @PutMapping("/encerrar/{id}")
    public CampanhaResponse encerrar(@PathVariable String id, @RequestHeader(USER_ID) String usuarioId) {
        return CampanhaControllerAdapter.toResponse(service.encerrar(id, usuarioId));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable String id, @RequestHeader(USER_ID) String usuarioId) {
        service.excluir(id, usuarioId);
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/all")
    public List<CampanhaResponse> findAll() {
        return service.listar().stream()
                .map(CampanhaControllerAdapter::toResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/minhas")
    public List<CampanhaResponse> minhas(@RequestHeader(USER_ID) String usuarioId) {
        return service.minhas(usuarioId).stream()
                .map(CampanhaControllerAdapter::toResponse)
                .toList();
    }

    @ResponseStatus(HttpStatus.OK)
    @GetMapping("/{id}")
    public CampanhaResponse findById(@PathVariable String id) {
        return CampanhaControllerAdapter.toResponse(service.buscar(id));
    }

    // ---------- Tratamento de erros (devolve { "mensagem": "..." } para o site) ----------

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse dadoInvalido(IllegalArgumentException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse jsonInvalido(HttpMessageNotReadableException ex) {
        return new ErrorResponse("Dados em formato inválido. Confira a meta (número) e a data (aaaa-mm-dd).");
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse semUsuario(MissingRequestHeaderException ex) {
        return new ErrorResponse("Usuário não identificado. Acesse pelo gateway (porta 8080) estando logado.");
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse naoEhDono(SecurityException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse naoEncontrada(NoSuchElementException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse regraDeNegocio(IllegalStateException ex) {
        return new ErrorResponse(ex.getMessage());
    }
}