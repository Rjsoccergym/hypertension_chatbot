package org.example.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.model.entity.Observacion;
import org.example.model.entity.Paciente;
import org.example.model.entity.SignoVital;
import org.example.repository.PacienteRepository;
import org.example.repository.SignoVitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final PacienteRepository pacienteRepository;
    private final SignoVitalRepository signoVitalRepository;


    // Lista la información de sus Pacientes
    @Transactional(readOnly = true)
    public List<Paciente> listarPacientesAsignados(Long medicoId) {
        return pacienteRepository.findByMedicoId(medicoId);
    }

    // Agrega un mensaje con observaciones a cada uno de los registros
    @Transactional
    public void agregarObservacion(Long signoVitalId, String mensaje) {
        SignoVital registro = signoVitalRepository.findById(signoVitalId)
                .orElseThrow(() -> new EntityNotFoundException("Registro no encontrado"));

        Observacion nuevaObservacion = new Observacion();
        nuevaObservacion.setMensaje(mensaje);
        nuevaObservacion.setFechaRegistro(LocalDateTime.now());

        registro.addObservacion(nuevaObservacion);

        signoVitalRepository.save(registro);
    }
}
