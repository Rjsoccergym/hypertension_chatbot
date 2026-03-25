package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.SignoVital;
import org.example.model.enums.EstadoSignoVital;
import org.example.repository.PacienteRepository;
import org.example.repository.SignoVitalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SignoVitalService {

    private final SignoVitalRepository signoVitalRepository;
    private final PacienteRepository pacienteRepository;

    // Registra la información de signos vitales con la información del Usuario
    public SignoVital registrarSignosVitales(SignoVital signoVital){

        signoVital.setEstado(evaluarEstadoHipertension(signoVital.getPresionSistolica(), signoVital.getPresionDiastolica()));

        if (signoVital.getFechaRegistro() == null) {
            signoVital.setFechaRegistro(LocalDateTime.now());
        }

        return signoVitalRepository.save(signoVital);
    }

    // Consulta la lista de signos vitales asociados al Usuario
    @Transactional(readOnly = true)
    public List<SignoVital> obtenerHistorialPaciente(Long pacienteId) {
        return signoVitalRepository.findByPaciente_IdOrderByCreatedAtDesc(pacienteId);
    }

    // Muestra TODOS los Signos Vitales registrados en el Sistema
    @Transactional(readOnly = true)
    public List<SignoVital> obtenerAllHistorial() {
        return signoVitalRepository.findAll();
    }

    // Muestra TODOS los Signos Vitales registrados en el Sistema con las Observaciones
    @Transactional(readOnly = true)
    public List<SignoVital> obtenerAllHistorialWithObservaciones(Long pacienteId) {
        return signoVitalRepository.findByPacienteIdWithObservaciones(pacienteId);
    }

    // Borra el último registro, en caso de error en el registro
    @Transactional
    public void eliminarRegistroIncongruente(Long id) {
        signoVitalRepository.deleteById(id);
    }

    // Evalua inicialmente el estado del Signo Vital
    private EstadoSignoVital evaluarEstadoHipertension(int sis, int dia) {
        if (sis >= 140 || dia >= 90) return EstadoSignoVital.CRITICO;
        if (sis >= 130 || dia > 80) return EstadoSignoVital.ELEVADO;
        return EstadoSignoVital.NORMAL;
    }

}
