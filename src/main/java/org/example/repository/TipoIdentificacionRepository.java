package org.example.repository;

import org.example.model.entity.TipoIdentificacion;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoIdentificacionRepository {

    Optional<TipoIdentificacion> findByCodigo(String codigo);

}
