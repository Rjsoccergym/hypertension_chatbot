package org.example.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "MEDICO")
@PrimaryKeyJoinColumn(name = "persona_id")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Medico extends Persona {

    @ManyToMany
    @JoinTable(
            name = "MEDICO_ESPECIALIDAD",
            joinColumns = @JoinColumn(name = "medico_id"),
            inverseJoinColumns = @JoinColumn(name = "especialidad_id")
    )
    private Set<Especialidad> especialidad = new HashSet<>();

    @Column(name = "registro_medico", unique = true, nullable = false)
    private String registroMedico;

}
