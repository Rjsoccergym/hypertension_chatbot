package org.example.repository;

import org.example.model.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {

    Optional<Persona> findByTipoIdentificacion_IdAndNumeroIdentificacion(Long tipoId, String numeroId);

}
