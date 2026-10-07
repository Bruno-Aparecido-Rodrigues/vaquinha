package io.github.fatec.controller;

import io.github.fatec.controller.adapter.DoacaoControllerAdapter;
import io.github.fatec.controller.request.DoacaoRequest;
import io.github.fatec.controller.response.DoacaoItemResponse;
import io.github.fatec.controller.response.DoacaoResponse;
import io.github.fatec.controller.response.ErrorResponse;
import io.github.fatec.entity.enumerable.MotivoRecusa;
import io.github.fatec.service.DoacaoService;
import io.github.fatec.service.dto.ResultadoDoacao;
import io.github.fatec.service.exception.DoacaoRecusadaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.NoSuchElementException;

// Endpoints /doacao (doar e listar doações) e tradução das exceções em HTTP.
@RestController
@RequestMapping("/doacao")
public class DoacaoController {

    private static final Logger log = LoggerFactory.getLogger(DoacaoController.class);

    private final DoacaoService service;

    public DoacaoController(DoacaoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DoacaoResponse> doar(@RequestHeader("X-User-Id") String usuarioId,
                                               @RequestHeader("X-User-Nome") String usuarioNome,
                                               @RequestBody DoacaoRequest request) {
        ResultadoDoacao resultado = service.doar(
                request.campanhaId(),
                request.valor(),
                usuarioId,
                URLDecoder.decode(usuarioNome, StandardCharsets.UTF_8)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(DoacaoControllerAdapter.cast(resultado));
    }

    @GetMapping("/campanha/{campanhaId}")
    public ResponseEntity<List<DoacaoItemResponse>> listarPorCampanha(@PathVariable String campanhaId) {
        List<DoacaoItemResponse> doacoes = service.listarPorCampanha(campanhaId)
                .stream()
                .map(DoacaoControllerAdapter::cast)
                .toList();
        return ResponseEntity.ok(doacoes);
    }

    // ---------- Tratamento de erros ----------

    @ExceptionHandler(DoacaoRecusadaException.class)
    public ResponseEntity<ErrorResponse> recusada(DoacaoRecusadaException e) {
        HttpStatus status = (e.getMotivo() == MotivoRecusa.META_ATINGIDA
                || e.getMotivo() == MotivoRecusa.VALOR_EXCEDE_META)
                ? HttpStatus.CONFLICT
                : HttpStatus.UNPROCESSABLE_ENTITY;

        return ResponseEntity.status(status)
                .body(new ErrorResponse(e.getMessage(), e.getMotivo().name(), e.getValorRestante()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> requisicaoInvalida(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> naoEncontrado(NoSuchElementException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> conflito(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> semUsuario(MissingRequestHeaderException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Usuário não identificado"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> corpoInvalido(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse("Corpo da requisição inválido"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> erroInesperado(Exception e) {
        log.error("Erro inesperado", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Não foi possível concluir a doação. Tente novamente."));
    }
}