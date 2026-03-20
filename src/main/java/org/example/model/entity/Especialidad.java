package org.example.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ESPECIALIDAD")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Especialidad extends BaseEntity {

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

}
