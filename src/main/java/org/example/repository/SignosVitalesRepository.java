package org.example.repository;

import org.example.model.entity.SignoVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignosVitalesRepository extends JpaRepository<SignoVital, Long> {

    List<SignoVital> findByPacienteId(Long pacienteId);

    List<SignoVital> findByMedicoId(Long medicoId);

}
