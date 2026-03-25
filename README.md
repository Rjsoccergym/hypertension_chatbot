# 🤖 Hipertensión ChatBot - Sistema de Monitoreo Clínico

Este proyecto es una aplicación web integral diseñada para el seguimiento de pacientes con hipertensión. Utiliza un **ChatBot inteligente** basado en una máquina de estados para facilitar la interacción entre médicos y pacientes, permitiendo el registro de signos vitales y la retroalimentación médica en tiempo real.



## 🛠️ Stack Tecnológico

### Backend
* **Lenguaje:** Java 21 (Amazon Corretto)
* **Framework:** Spring Boot 3.2.5
* **Persistencia:** Spring Data JPA / Hibernate 6.4
* **Base de Datos:** PostgreSQL 16
* **Pruebas:** JUnit 5 & Mockito

### Frontend
* **Interfaz:** HTML5, CSS3 (Flexbox & Grid), Bootstrap 5.3
* **Lógica:** JavaScript Vanilla (ES6+) - Arquitectura orientada a estados.
* **Comunicación:** Fetch API (Consumo de servicios REST)

---

## 🏗️ Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada donde el Frontend gestiona la experiencia de usuario mediante un flujo de conversación dinámico, y el Backend asegura la integridad de los datos clínicos.

### Características Principales:
1.  **Herencia de Entidades:** Uso de `@MappedSuperclass` para la entidad `Persona`, heredada por `Paciente` y `Medico`.
2.  **Gestión de Relaciones:** Implementación de relaciones `@OneToMany` y `@ManyToOne` con carga diferida (**Lazy Loading**) optimizada mediante `JOIN FETCH`.
3.  **Seguridad de Datos:** Validación de mayoría de edad para documentos tipo Cédula de Ciudadanía mediante `java.time.LocalDate`.
4.  **Monitor REST:** Visualización en tiempo real de los payloads JSON enviados y recibidos por el ChatBot.

---

## 🚦 Endpoints Principales (API REST)

### Usuarios
* `GET /api/usuarios/verificar`: Valida la existencia de un usuario por documento.
* `POST /api/usuarios/pacientes`: Registra un nuevo paciente (Valida mayoría de edad).
* `POST /api/usuarios/medicos`: Registra un profesional de la salud.

### Signos Vitales
* `POST /api/signos-vitales/registrar`: Guarda presión (Sis/Dia), pulso, temp y saturación.
* `GET /api/signos-vitales/historial/{pacienteId}`: Recupera registros con sus respectivas observaciones médicas.

### Observaciones
* `POST /api/observaciones/responder/{signoId}`: Permite al médico añadir retroalimentación clínica a un registro específico.

---

## ⚙️ Configuración e Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/hypertension_chatbot.git
    ```

2.  **Configurar la Base de Datos:**
    Crear una base de datos en PostgreSQL y ajustar las credenciales en `src/main/resources/application.properties`:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/chatbot_db
    spring.datasource.username=tu_usuario
    spring.datasource.password=tu_contraseña
    spring.jpa.hibernate.ddl-auto=update
    ```

3.  **Ejecutar la aplicación:**
    ```bash
    mvn spring-boot:run
    ```

4.  **Acceso:**
    Abrir en el navegador: `http://localhost:3000`

---

## 📈 Roadmap (Product Backlog)
* [x] Implementación de lógica de hipertensión (Normal/Crítico).
* [x] Validación de mayoría de edad en registro.
* [x] Visualización de múltiples observaciones por signo vital.
* [ ] Integración de alertas automáticas vía Email/SMS para estados críticos.
* [ ] Generación de reportes PDF de historial clínico.

---

## 👥 Contribuciones
Proyecto desarrollado como parte del módulo de **Procesos de Desarrollo de Software** para la Maestría en Ingeniería.

**Autor:** @Rjsoccergym, @Jeronimo90-eng

**Fecha:** Marzo 2026
