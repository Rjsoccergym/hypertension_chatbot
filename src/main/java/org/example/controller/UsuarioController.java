package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.Medico;
import org.example.model.entity.Paciente;
import org.example.repository.MedicoRepository;
import org.example.repository.PacienteRepository;
import org.example.repository.PersonaRepository;
import org.example.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final PersonaRepository personaRepository;

    // Registrar Médicos
    @PostMapping("/medicos")
    public ResponseEntity<Medico> registrarMedico(@RequestBody Medico medico) {
        return ResponseEntity.ok(usuarioService.saveMedico(medico));
    }

    // Registrar Pacientes
    @PostMapping("/pacientes")
    public ResponseEntity<Paciente> registrarPaciente(@RequestBody Paciente paciente) {
        return ResponseEntity.ok(usuarioService.savePaciente(paciente));
    }

    // Buscar por Tipo y Numero de Documento
    @GetMapping("/verificar")
    public ResponseEntity<?> verificarUsuario(@RequestParam Long tipoId, @RequestParam String numeroId){
        return personaRepository.findByTipoIdentificacion_IdAndNumeroIdentificacion(tipoId, numeroId)
                .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    //Listar todos los Medicos
    @GetMapping("/medicos")
    public ResponseEntity<List<Medico>> listarMedicos(){
        return ResponseEntity.ok(medicoRepository.findAll());
    }

    //Listar todos los Medicos
    @GetMapping("/pacientes")
    public ResponseEntity<List<Paciente>> listarPacientes(){
        return ResponseEntity.ok(pacienteRepository.findAll());
    }

}
