package org.example.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.Getter;
import lombok.Setter;
import org.example.model.enums.GrupoSanguineo;
import org.example.model.enums.RH;
import org.example.model.enums.Sexo;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "PERSONA")
@Inheritance(strategy = InheritanceType.JOINED)
@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class Persona extends BaseEntity {

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_identificacion_id", nullable = false)
    private TipoIdentificacion tipoIdentificacion;

    @Column(name = "numero_identificacion", unique = true, nullable = false)
    private String numeroIdentificacion;

    private String telefono;

    @Column(unique = true)
    private String email;

    private String direccion;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    private Sexo sexo;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo_sanguineo")
    private GrupoSanguineo grupoSanguineo;

    @Enumerated(EnumType.STRING)
    private RH rh;

}
