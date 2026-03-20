package org.example.repository;

import org.example.model.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    List<Medico> findByEspecialidadNombre(String nombreEspecialidad);

    Optional<Medico> findByNumeroIdentificacion(String numeroIdentificacion);

    Optional<Medico> findByEmail(String email);

    Optional<Medico> findByRegistroMedico(String registro);

}
