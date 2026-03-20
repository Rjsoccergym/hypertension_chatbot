package org.example.repository;

import org.example.model.entity.Observacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservacionRepository extends JpaRepository<Observacion, Long> {

    List<Observacion> findByMensaje(String keyword);

    List<Observacion> findBySignoVitalId(Long signoVitalId);

    List<Observacion> findBySignoVital_Paciente_IdAndLeidoFalse(Long pacienteId);
}
