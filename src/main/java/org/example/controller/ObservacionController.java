package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.Observacion;
import org.example.repository.ObservacionRepository;
import org.example.service.ObservacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/observaciones")
@RequiredArgsConstructor
public class ObservacionController {

    private final ObservacionService observacionService;
    private final ObservacionRepository observacionRepository;

    @PostMapping("/responder/{signoId}")
    public ResponseEntity<Observacion> crearObservacion(@PathVariable Long signoId, @RequestBody String mensaje) {
        return ResponseEntity.ok(observacionService.agregarObservacionMedica(signoId, mensaje));
    }

    // Comprueba si hay mensaje nuevos
    @GetMapping("/pendientes/paciente/{pacienteId}")
    public ResponseEntity<List<Observacion>> obtenerPendientes(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(observacionRepository.findBySignoVital_Paciente_IdAndLeidoFalse(pacienteId));
    }

    // Marca como leído
    @PatchMapping("/{id}/leer")
    public ResponseEntity<Void> marcarComoLeido(@PathVariable Long id) {
        Observacion obs = observacionRepository.findById(id).orElseThrow();
        obs.setLeido(true);
        observacionRepository.save(obs);

        return ResponseEntity.noContent().build();
    }

}
