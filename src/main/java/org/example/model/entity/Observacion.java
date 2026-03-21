package org.example.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "OBSERVACION")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Observacion extends BaseEntity {

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(nullable = false)
    private boolean leido = false;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signo_vital_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private SignoVital signoVital;

    @JsonProperty("signoVitalId")
    public Long getSignoVitalId() {
        return signoVital != null ? signoVital.getId() : null;
    }

}
