package org.example.repository;

import org.example.model.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByNumeroIdentificacion(String numeroIdentificacion);

    Optional<Paciente> findByEmail(String email);

}
