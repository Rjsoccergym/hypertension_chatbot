import org.example.model.entity.Medico;
import org.example.model.entity.Observacion;
import org.example.model.entity.Paciente;
import org.example.model.entity.SignoVital;
import org.example.model.enums.EstadoSignoVital;
import org.example.repository.ObservacionRepository;
import org.example.repository.SignoVitalRepository;
import org.example.service.ObservacionService;
import org.example.service.SignoVitalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para SignoVitalService y ObservacionService.
 *
 * ¿Qué es una prueba unitaria?
 *   Verifica una pequeña parte del código (una función) de forma aislada,
 *   sin base de datos ni servidores reales.
 *
 * ¿Qué es un Mock?
 *   Un objeto falso que reemplaza una dependencia real (ej. el repositorio).
 *   Le decimos exactamente qué debe devolver para controlar el escenario.
 *
 * Patrón AAA (Arrange / Act / Assert):
 *   - Arrange : prepara los datos y configura los mocks.
 *   - Act     : llama al método que queremos probar.
 *   - Assert  : verifica que el resultado sea el esperado.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas: Signos Vitales y Observaciones")
class ServiceTest {

    // --- Mocks (repositorios falsos) ---
    @Mock
    private SignoVitalRepository signoVitalRepository;

    @Mock
    private ObservacionRepository observacionRepository;

    // --- Servicios bajo prueba (se les inyectan los mocks automáticamente) ---
    @InjectMocks
    private SignoVitalService signoVitalService;

    @InjectMocks
    private ObservacionService observacionService;

    // --- Datos reutilizables en todos los tests ---
    private SignoVital signoVitalNormal;
    private Observacion observacionEjemplo;

    /**
     * Se ejecuta antes de cada test para preparar datos limpios.
     */
    @BeforeEach
    void setUp() {
        Paciente paciente = new Paciente();
        paciente.setId(1L);

        Medico medico = new Medico();
        medico.setId(10L);

        // Signo vital con valores normales (presión 120/80)
        signoVitalNormal = new SignoVital();
        signoVitalNormal.setId(1L);
        signoVitalNormal.setPresionSistolica(120);
        signoVitalNormal.setPresionDiastolica(80);
        signoVitalNormal.setFrecuenciaCardiaca(72);
        signoVitalNormal.setTemperatura(new BigDecimal("36.5"));
        signoVitalNormal.setSaturacionOxigeno(98);
        //signoVitalNormal.setEstado(EstadoSignoVital.NORMAL);
        signoVitalNormal.setPaciente(paciente);
        signoVitalNormal.setMedico(medico);

        // Observación de ejemplo asociada al signo vital
        observacionEjemplo = new Observacion();
        observacionEjemplo.setId(1L);
        observacionEjemplo.setMensaje("Paciente estable");
        observacionEjemplo.setLeido(false);
        observacionEjemplo.setSignoVital(signoVitalNormal);
    }

    // =========================================================
    // TEST 1: Registrar signos vitales normales
    // =========================================================

    /**
     * Escenario: el médico registra una presión 120/80.
     * Esperado : el sistema guarda el registro y devuelve estado NORMAL.
     */
    @Test
    @DisplayName("TC-01: Registrar signos vitales con presión normal (120/80)")
    void debeRegistrarSignosVitalesNormales() {
        // Arrange: el repositorio falso devuelve nuestro objeto de prueba al guardar
        when(signoVitalRepository.save(any(SignoVital.class)))
                .thenReturn(signoVitalNormal);

        // Act: llamamos al método real del servicio
        SignoVital resultado = signoVitalService.registrarSignosVitales(signoVitalNormal);

        // Assert: verificamos el resultado
        assertNotNull(resultado, "El resultado no debe ser nulo");
        assertEquals(EstadoSignoVital.NORMAL, resultado.getEstado(),
                "Una presión 120/80 debe clasificarse como NORMAL");
        assertEquals(120, resultado.getPresionSistolica());
        assertEquals(80, resultado.getPresionDiastolica());

        // Verificamos que el repositorio fue llamado exactamente una vez
        verify(signoVitalRepository, times(1)).save(any(SignoVital.class));
    }

    // =========================================================
    // TEST 2: Detectar hipertensión crítica
    // =========================================================

    /**
     * Escenario: el médico registra una presión 160/100 (hipertensión severa).
     * Esperado : el sistema detecta estado CRÍTICO.
     */
    @Test
    @DisplayName("TC-02: Detectar estado CRÍTICO con presión 160/100")
    void debeDetectarEstadoCritico() {
        // Arrange: creamos un signo vital con valores críticos
        SignoVital signoVitalCritico = new SignoVital();
        signoVitalCritico.setId(2L);
        signoVitalCritico.setPresionSistolica(160);
        signoVitalCritico.setPresionDiastolica(100);
        signoVitalCritico.setEstado(EstadoSignoVital.CRITICO);

        when(signoVitalRepository.save(any(SignoVital.class)))
                .thenReturn(signoVitalCritico);

        // Act
        SignoVital resultado = signoVitalService.registrarSignosVitales(signoVitalCritico);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoSignoVital.CRITICO, resultado.getEstado(),
                "Una presión 160/100 debe clasificarse como CRÍTICO");

        verify(signoVitalRepository, times(1)).save(any(SignoVital.class));
    }

    // =========================================================
    // TEST 3: Agregar una observación médica
    // =========================================================

    /**
     * Escenario: el médico agrega una observación a un signo vital existente.
     * Esperado : la observación se guarda asociada al signo vital correcto.
     */
    @Test
    @DisplayName("TC-03: Agregar observación médica a un signo vital existente")
    void debeAgregarObservacionMedica() {
        // Arrange: el repositorio encuentra el signo vital por ID
        when(signoVitalRepository.findById(1L))
                .thenReturn(Optional.of(signoVitalNormal));

        when(observacionRepository.save(any(Observacion.class)))
                .thenReturn(observacionEjemplo);

        Observacion nuevaObservacion = new Observacion();
        nuevaObservacion.setMensaje("Paciente estable");
        nuevaObservacion.setLeido(false);

        // Act
        Observacion resultado = observacionService.agregarObservacionMedica(1L, nuevaObservacion);

        // Assert
        assertNotNull(resultado, "La observación guardada no debe ser nula");
        assertEquals("Paciente estable", resultado.getMensaje());
        assertFalse(resultado.isLeido(), "Una nueva observación debe estar sin leer");
        assertNotNull(resultado.getSignoVital(), "Debe estar asociada a un signo vital");

        verify(signoVitalRepository, times(1)).findById(1L);
        verify(observacionRepository, times(1)).save(any(Observacion.class));
    }

    // =========================================================
    // TEST 4: Error cuando el signo vital no existe
    // =========================================================

    /**
     * Escenario: se intenta agregar una observación a un signo vital que no existe.
     * Esperado : el servicio lanza una excepción con mensaje claro.
     */
    @Test
    @DisplayName("TC-04: Lanzar excepción si el signo vital no existe")
    void debeLanzarExcepcionSiSignoVitalNoExiste() {
        // Arrange: el repositorio no encuentra ningún registro con ese ID
        when(signoVitalRepository.findById(999L))
                .thenReturn(Optional.empty());

        Observacion observacion = new Observacion();
        observacion.setMensaje("Observación huérfana");

        // Act & Assert: verificamos que se lanza la excepción correcta
        RuntimeException excepcion = assertThrows(
                RuntimeException.class,
                () -> observacionService.agregarObservacionMedica(999L, observacion),
                "Debe lanzar excepción cuando el signo vital no existe"
        );

        assertEquals("Signo vital no encontrado", excepcion.getMessage());

        // El repositorio de observaciones NUNCA debe ser llamado en este caso
        verify(observacionRepository, never()).save(any(Observacion.class));
    }

}