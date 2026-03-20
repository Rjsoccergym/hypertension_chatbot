package org.example.repository;

import org.example.model.entity.SignoVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SignoVitalRepository extends JpaRepository<SignoVital, Long> {

    List<SignoVital> findByPacienteIdOrderByFechaRegistroDesc(Long pacienteId);

    List<SignoVital> findByMedicoId(Long medicoId);

    void deleteById(Long id);

}
