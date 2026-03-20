package org.example.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.model.entity.Medico;
import org.example.model.entity.Paciente;
import org.example.model.entity.TipoIdentificacion;
import org.example.repository.MedicoRepository;
import org.example.repository.TipoIdentificacionRepository;
import org.springframework.stereotype.Service;
import org.example.repository.PacienteRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final TipoIdentificacionRepository tipoIdentificacionRepository;

    @Transactional
    public Paciente crearPaciente(String nombre, String apellido, String identificacion,
                                  String tipoId, Long medicoTratanteId) {

        Medico medico = medicoRepository.findById(medicoTratanteId)
                .orElseThrow(() -> new EntityNotFoundException("Médico no encontrado"));

        TipoIdentificacion tipo = tipoIdentificacionRepository.findByCodigo(tipoId)
                .orElseThrow(() -> new EntityNotFoundException("Tipo ID no válido"));

        Paciente nuevo = new Paciente();
        nuevo.setNombre(nombre);
        nuevo.setApellido(apellido);
        nuevo.setNumeroIdentificacion(identificacion);
        nuevo.setTipoIdentificacion(tipo);
        nuevo.setMedico(medico);

        return pacienteRepository.save(nuevo);
    }
}