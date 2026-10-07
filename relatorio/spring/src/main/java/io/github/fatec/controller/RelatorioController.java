package io.github.fatec.controller;

import io.github.fatec.controller.adapter.RelatorioControllerAdapter;
import io.github.fatec.controller.response.ErrorResponse;
import io.github.fatec.controller.response.OperacaoResponse;
import io.github.fatec.service.RelatorioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// GET /relatorio/operacoes: lista para o painel, só para ADMIN.
@RestController
@RequestMapping("/relatorio")
public class RelatorioController {

    private final RelatorioService service;

    public RelatorioController(RelatorioService service) {
        this.service = service;
    }

    @GetMapping("/operacoes")
    public ResponseEntity<?> listarOperacoes(@RequestHeader("X-User-Roles") String roles) {
        if (!roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Acesso permitido apenas ao administrador"));
        }

        List<OperacaoResponse> operacoes = service.listarOperacoes()
                .stream()
                .map(RelatorioControllerAdapter::cast)
                .toList();
        return ResponseEntity.ok(operacoes);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> semUsuario(MissingRequestHeaderException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Usuário não identificado"));
    }
}