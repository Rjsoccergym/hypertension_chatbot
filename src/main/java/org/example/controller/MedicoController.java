package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.Paciente;
import org.example.service.MedicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/medicos")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoService medicoService;

    // Lista la informacion de sus Pacientes
    @GetMapping("/{medicoId}/pacientes")
    public ResponseEntity<List<Paciente>> listarPacientes(@PathVariable Long medicoId) {
        List<Paciente> pacientes = medicoService.listarPacientesAsignados(medicoId);
        return ResponseEntity.ok(pacientes);
    }

    // Agrega un mensaje con Observaciones a cada uno de los Registros
    @PostMapping("/observaciones/{signoVitalId}")
    public ResponseEntity<String> agregarObservacion(
            @PathVariable Long signoVitalId,
            @RequestBody String mensaje) {

        medicoService.agregarObservacion(signoVitalId, mensaje);
        return ResponseEntity.ok("Observación médica registrada con éxito");
    }

}
