package org.example.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.model.entity.Medico;
import org.example.model.entity.Paciente;
import org.example.model.entity.TipoIdentificacion;
import org.example.repository.MedicoRepository;
import org.example.repository.TipoIdentificacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.example.repository.PacienteRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        nuevo.setTipoIdentificacion(tipo);

        if (nuevo.getTipoIdentificacion().getId() == 1 && nuevo.getEdad() < 18) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe ser mayor de edad para usar Cédula.");
        }
        nuevo.setNumeroIdentificacion(identificacion);
        nuevo.setMedico(medico);

        return pacienteRepository.save(nuevo);
    }
}