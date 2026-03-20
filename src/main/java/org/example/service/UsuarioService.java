package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.Medico;
import org.example.model.entity.Paciente;
import org.example.repository.MedicoRepository;
import org.example.repository.PacienteRepository;
import org.springframework.stereotype.Service;

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
}
