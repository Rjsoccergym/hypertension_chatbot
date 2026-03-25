package org.example.repository;

import org.example.model.entity.SignoVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SignoVitalRepository extends JpaRepository<SignoVital, Long> {

    List<SignoVital> findByPaciente_IdOrderByCreatedAtDesc(Long id);

    @Query("SELECT s FROM SignoVital s LEFT JOIN FETCH s.observaciones WHERE s.paciente.id = :pacienteId ORDER BY s.createdAt DESC")
    List<SignoVital> findByPacienteIdWithObservaciones(@Param("pacienteId") Long pacienteId);

    List<SignoVital> findByMedicoId(Long medicoId);

    void deleteById(Long id);

}
