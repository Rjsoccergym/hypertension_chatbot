package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.TipoIdentificacion;
import org.example.repository.TipoIdentificacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/tipo-identificacion")
@RequiredArgsConstructor
public class TipoIdentificacionController {

    private final TipoIdentificacionRepository repository;

    // Crear un nuevo tipo de indentifacion (Ej: Cédula, Pasaporte)
    @PostMapping
    public ResponseEntity<TipoIdentificacion> crear(@RequestBody TipoIdentificacion tipo) {
        return ResponseEntity.ok(repository.save(tipo));
    }

    // Lista todos los tipos de identificacion para que el Chatbot
    @GetMapping
    public ResponseEntity<List<TipoIdentificacion>> listarTodo() {
        return ResponseEntity.ok(repository.findAll());
    }

}
