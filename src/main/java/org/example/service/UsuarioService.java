package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.Medico;
import org.example.model.entity.Paciente;
import org.example.repository.MedicoRepository;
import org.example.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;

    public Medico saveMedico(Medico medico) {
        return medicoRepository.save(medico);
    }

    public Paciente savePaciente(Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    public void validarRegistro(Paciente paciente) {
        if (paciente.getFechaNacimiento() != null) {
            int edad = Period.between(paciente.getFechaNacimiento(), LocalDate.now()).getYears();

            // Si el tipo de documento es Cédula (ejemplo ID 1)
            if (paciente.getTipoIdentificacion().getId() == 1 && edad < 18) {
                throw new RuntimeException("El paciente debe ser mayor de edad para usar Cédula de Ciudadanía.");
            }
        }
    }
}
