package org.example.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.model.enums.EstadoSignoVital;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "SIGNO_VITAL")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SignoVital extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EstadoSignoVital estado = EstadoSignoVital.NORMAL;

    @Column(name = "presion_sistolica")
    private Integer presionSistolica;

    @Column(name = "presion_diastolica")
    private Integer presionDiastolica;

    @Column(name = "frecuencia_cardiaca")
    private Integer frecuenciaCardiaca;

    @Column(precision = 4, scale = 2)
    private BigDecimal temperatura;

    @Column(name = "saturacion_oxigeno")
    private Integer saturacionOxigeno;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @OneToMany(mappedBy = "signoVital", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Observacion> observaciones;

    public void addObservacion(Observacion observacion) {

        if (this.observaciones == null) {
            this.observaciones = new ArrayList<>();
        }

        this.observaciones.add(observacion);
        observacion.setSignoVital(this);
    }

    @JsonProperty("pacienteId")
    public Long getPacienteId() {
        return paciente != null ? paciente.getId() : null;
    }

}