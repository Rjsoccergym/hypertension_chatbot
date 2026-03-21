package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.entity.Observacion;
import org.example.model.entity.SignoVital;
import org.example.repository.ObservacionRepository;
import org.example.repository.SignoVitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ObservacionService {

    private final ObservacionRepository observacionRepository;
    private final SignoVitalRepository signoVitalRepository;

    @Transactional
    public Observacion agregarObservacionMedica(Long signoId, Observacion observacion) {
        SignoVital signo = signoVitalRepository.findById(signoId)
                .orElseThrow(() -> new RuntimeException("Signo vital no encontrado"));

        observacion.setSignoVital(signo);

        return observacionRepository.save(observacion);
    }

    // Muestra TODOS las Observaciones registradas en el Sistema
    @Transactional(readOnly = true)
    public List<Observacion> obtenerAllHistorial() {
        return observacionRepository.findAll();
    }

    // Muestra la Observacion registrada por ID del Signo Vital
    @Transactional(readOnly = true)
    public List<Observacion> obtenerObservacionById(Long signoId) {
        return observacionRepository.findBySignoVital_Id(signoId);
    }


}