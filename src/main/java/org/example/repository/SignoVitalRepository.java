package org.example.repository;

import org.example.model.entity.SignoVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SignoVitalRepository extends JpaRepository<SignoVital, Long> {

    List<SignoVital> findByPaciente_IdOrderByCreatedAtDesc(Long id);

    List<SignoVital> findByMedicoId(Long medicoId);

    void deleteById(Long id);

}
