package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.SignoVital;
import org.example.service.SignoVitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/signos-vitales")
@RequiredArgsConstructor
public class SignoVitalController {

    private final SignoVitalService signoVitalService;

    // Registro de los signos dictados por el Usuario
    @PostMapping("/registrar")
    public ResponseEntity<SignoVital> registrarSignosVitales(@RequestBody SignoVital signoVital){
        return ResponseEntity.ok(signoVitalService.registrarSignosVitales(signoVital));
    }

    // Muestra el historial de los Signos Vitales por Usuario
    @GetMapping("/historial/{pacienteId}")
    public ResponseEntity<List<SignoVital>> consultarHistorialPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(signoVitalService.obtenerHistorialPaciente(pacienteId));
    }

    // Muestra el historial de los Signos Vitales por Usuario con las Observaciones
    @GetMapping("/historialConObservaciones/{pacienteId}")
    public ResponseEntity<List<SignoVital>> consultarHistorialPorPacienteConObservaciones(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(signoVitalService.obtenerAllHistorialWithObservaciones(pacienteId));
    }

    // Muestra todos los Signos Vitales Registrados
    @GetMapping("/historial")
    public ResponseEntity<List<SignoVital>> consultarAllHistorial() {
        return ResponseEntity.ok(signoVitalService.obtenerAllHistorial());
    }

    // Elimina un registro si el usuario dice "me equivoqué"
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        signoVitalService.eliminarRegistroIncongruente(id);
        return ResponseEntity.noContent().build();
    }

}
