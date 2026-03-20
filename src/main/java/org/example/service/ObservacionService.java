package org.example.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.model.entity.Observacion;
import org.example.model.entity.SignoVital;
import org.example.repository.ObservacionRepository;
import org.example.repository.SignoVitalRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ObservacionService {

    private final ObservacionRepository observacionRepository;
    private final SignoVitalRepository signoVitalRepository;

    @Transactional
    public Observacion agregarObservacionMedica(Long signoId, String mensaje) {
        SignoVital signo = signoVitalRepository.findById(signoId)
                .orElseThrow(() -> new RuntimeException("Signo vital no encontrado"));

        Observacion obs = new Observacion();
        obs.setMensaje(mensaje);
        obs.setSignoVital(signo);

        return observacionRepository.save(obs);
    }

}
