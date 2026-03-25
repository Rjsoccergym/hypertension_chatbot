// =============================================================================
// CAPA DE SERVICIO: todas las llamadas HTTP en un solo lugar
// =============================================================================

const ApiService = {
    async get(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
        return res.json();
    },

    async post(url, body) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST ${url} → ${res.status}`);
        return res.json();
    },

    verificarUsuario: (tipoId, numeroId) =>
        ApiService.get(
            `/api/usuarios/verificar?tipoId=${tipoId}&numeroId=${numeroId}`,
        ),

    registrarPaciente: (body) =>
        ApiService.post("/api/usuarios/pacientes", body),
    registrarMedico: (body) => ApiService.post("/api/usuarios/medicos", body),

    pacientesDelMedico: (medicoId) =>
        ApiService.get(`/api/medicos/${medicoId}/pacientes`),

    historialConObservaciones: (pacienteId) =>
        ApiService.get(
            `/api/signos-vitales/historialConObservaciones/${pacienteId}`,
        ),

    signoVitalPorId: (signoId) =>
        ApiService.get(`/api/observaciones/historial/${signoId}`),

    guardarSignos: (body) =>
        ApiService.post("/api/signos-vitales/registrar", body),

    guardarObservacion: (signoId, mensaje) =>
        ApiService.post(`/api/observaciones/responder/${signoId}`, { mensaje }),

    // Endpoints para las tablas del dashboard
    listaPacientes: () => ApiService.get("/api/usuarios/pacientes"),
    listaMedicos: () => ApiService.get("/api/usuarios/medicos"),
    listaSignos: () => ApiService.get("/api/signos-vitales/historial"),
    listaObservaciones: () => ApiService.get("/api/observaciones/historial"),
};

// =============================================================================
// UTILIDADES PURAS (sin efectos secundarios)
// =============================================================================

const Utils = {
    calcularEdad(fechaString) {
        const hoy = new Date();
        const fechaNac = new Date(fechaString);
        if (isNaN(fechaNac.getTime())) return NaN;

        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return edad;
    },

    calcularEstadoPresion(sis, dia) {
        if (sis < 120 && dia < 80) return "NORMAL ✅";
        if (sis >= 140 || dia >= 90) return "ALTA (HIPERTENSIÓN) ⚠️";
        return "PREHIPERTENSIÓN 🟡";
    },

    rhSimbolo: (rh) => rh === "POSITIVO" ? "+" : "-",

    limpiarMensajeObservacion(texto) {
        try {
            if (typeof texto === "string" && texto.startsWith("{")) {
                return JSON.parse(texto).mensaje || texto;
            }
        } catch (_) { /* texto plano, ignorar */ }
        return texto;
    },

    formatearFecha: (isoString) => new Date(isoString).toLocaleString(),
};

// =============================================================================
// CLASE PRINCIPAL: encapsula estado, UI y flujo de la conversación
// =============================================================================

class ChatBot {
    // --- Constantes de estado ---
    static ESTADOS = {
        SALUDO_ROL: "SALUDO_ROL",
        TIPO_ID: "TIPO_ID",
        NUMERO_ID: "NUMERO_ID",
        NO_ENCONTRADO: "NO_ENCONTRADO",
        REG_NOMBRE: "REG_NOMBRE",
        REG_APELLIDO: "REG_APELLIDO",
        REG_FECHA: "REG_FECHA",
        REG_SEXO: "REG_SEXO",
        REG_GRUPO: "REG_GRUPO",
        REG_RH: "REG_RH",
        REG_MEDICO_ID: "REG_MEDICO_ID",
        REG_PROFESIONAL: "REG_PROFESIONAL",
        MENU_PRINCIPAL: "MENU_PRINCIPAL",
        SIGNOS_SIS: "SIGNOS_SIS",
        SIGNOS_DIA: "SIGNOS_DIA",
        SIGNOS_FREQ: "SIGNOS_FREQ",
        SIGNOS_EXTRA: "SIGNOS_EXTRA",
        SIGNOS_TEMP: "SIGNOS_TEMP",
        SIGNOS_SAT: "SIGNOS_SAT",
        SEL_SIGNO_ID: "SEL_SIGNO_ID",
        ESPERANDO_OBS: "ESPERANDO_OBS",
    };

    static TIPOS_ID = {
        "1": "Cédula de Ciudadanía",
        "2": "Tarjeta de Identidad",
        "3": "Cédula de Extranjería",
        "4": "Pasaporte",
    };
    static SEXOS = { "1": "MASCULINO", "2": "FEMENINO", "3": "OTRO" };
    static GRUPOS = { "1": "A", "2": "B", "3": "AB", "4": "O" };
    static RHS = { "1": "POSITIVO", "2": "NEGATIVO" };

    constructor() {
        this._chatWindow = document.getElementById("chat-window");
        this._logArea = document.getElementById("api-logs");
        this._input = document.getElementById("user-input");

        // Mapa de estados → handlers (elimina el switch monolítico)
        this._handlers = {
            [ChatBot.ESTADOS.SALUDO_ROL]: (i) => this._handleSaludoRol(i),
            [ChatBot.ESTADOS.TIPO_ID]: (i) => this._handleTipoId(i),
            [ChatBot.ESTADOS.NUMERO_ID]: (i) => this._handleNumeroId(i),
            [ChatBot.ESTADOS.NO_ENCONTRADO]: (i) => this._handleNoEncontrado(i),
            [ChatBot.ESTADOS.REG_NOMBRE]: (i) => this._handleRegNombre(i),
            [ChatBot.ESTADOS.REG_APELLIDO]: (i) => this._handleRegApellido(i),
            [ChatBot.ESTADOS.REG_FECHA]: (i) => this._handleRegFecha(i),
            [ChatBot.ESTADOS.REG_SEXO]: (i) => this._handleRegSexo(i),
            [ChatBot.ESTADOS.REG_GRUPO]: (i) => this._handleRegGrupo(i),
            [ChatBot.ESTADOS.REG_RH]: (i) => this._handleRegRh(i),
            [ChatBot.ESTADOS.REG_MEDICO_ID]: (i) => this._handleRegMedicoId(i),
            [ChatBot.ESTADOS.REG_PROFESIONAL]: (i) =>
                this._handleRegProfesional(i),
            [ChatBot.ESTADOS.MENU_PRINCIPAL]: (i) =>
                this._handleMenuPrincipal(i),
            [ChatBot.ESTADOS.SIGNOS_SIS]: (i) => this._handleSignosSis(i),
            [ChatBot.ESTADOS.SIGNOS_DIA]: (i) => this._handleSignosDia(i),
            [ChatBot.ESTADOS.SIGNOS_FREQ]: (i) => this._handleSignosFreq(i),
            [ChatBot.ESTADOS.SIGNOS_EXTRA]: (i) => this._handleSignosExtra(i),
            [ChatBot.ESTADOS.SIGNOS_TEMP]: (i) => this._handleSignosTemp(i),
            [ChatBot.ESTADOS.SIGNOS_SAT]: (i) => this._handleSignosSat(i),
            [ChatBot.ESTADOS.SEL_SIGNO_ID]: (i) => this._handleSelSignoId(i),
            [ChatBot.ESTADOS.ESPERANDO_OBS]: (i) => this._handleEsperandoObs(i),
        };

        this.init();
    }

    // -------------------------------------------------------------------------
    // ESTADO INTERNO
    // -------------------------------------------------------------------------

    _resetState() {
        this._estado = ChatBot.ESTADOS.SALUDO_ROL;
        this._rol = "";
        this._usuarioActual = null;
        this._datos = {
            tipoIdentificacion: { id: null },
            tipoDescripcion: "",
            numeroIdentificacion: "",
            fechaNacimiento: "",
            nombre: "",
            apellido: "",
            sexo: "",
            grupoSanguineo: "",
            rh: "",
            medicoId: null,
            registroMedico: "",
            sis: null,
            dia: null,
            freq: null,
            temp: null,
            sat: null,
            currentSignoId: null,
        };
    }

    // -------------------------------------------------------------------------
    // UI: mensajes y logs
    // -------------------------------------------------------------------------

    _addMessage(text, side) {
        const div = document.createElement("div");
        div.className = `bubble ${side}`;
        div.innerHTML = text.replace(/\n/g, "<br>");
        this._chatWindow.appendChild(div);
        this._chatWindow.scrollTop = this._chatWindow.scrollHeight;
    }

    _bot(text) {
        this._addMessage(text, "bot");
    }
    _user(text) {
        this._addMessage(text, "user");
    }

    _log(method, url, body = "") {
        const time = new Date().toLocaleTimeString();
        this._logArea.innerHTML += `<div class="mb-2">
                <span class="text-warning">[${time}]</span>
                <span class="text-primary">${method}</span> ${url}<br>
                <span class="text-secondary small">${body}</span>
            </div>`;
        this._logArea.scrollTop = this._logArea.scrollHeight;
    }

    _errorBot(msg = "⚠️ Error de conexión. Intenta nuevamente.") {
        this._bot(msg);
    }

    // -------------------------------------------------------------------------
    // PUNTO DE ENTRADA PÚBLICO
    // -------------------------------------------------------------------------

    init() {
        this._resetState();
        this._chatWindow.innerHTML = "";
        this._bot("¡Hola! Soy tu Hiper-ChatBot de confianza. 👋");
        this._bot(
            "Cuéntame, ¿cómo te identificas hoy?\n1. Paciente\n2. Médico",
        );
    }

    handleInput() {
        const input = this._input.value.trim();
        if (!input) return;
        this._user(input);
        this._input.value = "";

        if (["0", "salir", "inicio"].includes(input.toLowerCase())) {
            this._bot("Operación cancelada. Volviendo al inicio...");
            setTimeout(() => this.init(), 1000);
            return;
        }

        const handler = this._handlers[this._estado];
        if (handler) handler(input);
    }

    // -------------------------------------------------------------------------
    // MENÚ PRINCIPAL (único, sin duplicado)
    // -------------------------------------------------------------------------

    _mostrarMenuPrincipal() {
        const u = this._usuarioActual;
        const menu = this._rol === "Paciente"
            ? `Hola **${u.nombre}**, este es tu portal de salud:\n1. Registrar mis Signos Vitales 🩺\n2. Ver mi Historial y Notas Médicas 📚\n0. Salir`
            : `Bienvenido Dr. **${u.apellido}**:\n1. Listar mis Pacientes Asignados 👥\n2. Agregar Observación a un Registro ✍️\n0. Salir`;

        this._bot(menu);
        this._estado = ChatBot.ESTADOS.MENU_PRINCIPAL;
    }

    // -------------------------------------------------------------------------
    // HANDLERS DE ESTADO
    // -------------------------------------------------------------------------

    _handleSaludoRol(input) {
        if (!["1", "2"].includes(input)) {
            this._bot("Opción no válida. Envía 1 o 2.");
            return;
        }
        this._rol = input === "1" ? "Paciente" : "Médico";
        this._estado = ChatBot.ESTADOS.TIPO_ID;
        this._bot(
            "Selecciona tu tipo de identificación:\n1. Cédula de Ciudadanía\n2. Tarjeta de Identidad\n3. Cédula de Extranjería\n4. Pasaporte",
        );
    }

    _handleTipoId(input) {
        const tipo = ChatBot.TIPOS_ID[input];
        if (!tipo) {
            this._bot("Selecciona 1, 2, 3 o 4.");
            return;
        }
        this._datos.tipoIdentificacion.id = parseInt(input);
        this._datos.tipoDescripcion = tipo;
        this._estado = ChatBot.ESTADOS.NUMERO_ID;
        this._bot("Por favor, diligencia tu número de identificación:");
    }

    async _handleNumeroId(input) {
        this._datos.numeroIdentificacion = input;
        await this._verificarUsuario(input);
    }

    _handleNoEncontrado(input) {
        if (input === "1") {
            this._estado = ChatBot.ESTADOS.REG_NOMBRE;
            this._bot("Iniciemos el registro. Por favor envíame tus Nombres:");
        } else {
            this.init();
        }
    }

    _handleRegNombre(input) {
        this._datos.nombre = input;
        this._estado = ChatBot.ESTADOS.REG_APELLIDO;
        this._bot("Por favor envíame tus Apellidos:");
    }

    _handleRegApellido(input) {
        this._datos.apellido = input;
        this._estado = ChatBot.ESTADOS.REG_FECHA;
        this._bot("Por favor envíame tu Fecha de Nacimiento (AAAA-MM-DD):");
    }

    _handleRegFecha(input) {
        const edad = Utils.calcularEdad(input);
        if (isNaN(edad) || edad < 0 || edad > 120) {
            this._bot(
                "⚠️ Fecha no válida. Usa el formato AAAA-MM-DD (Ej: 1990-05-20).",
            );
            return;
        }
        if (this._datos.tipoIdentificacion.id === 1 && edad < 18) {
            this._bot(
                `🚫 No puedes registrarte con Cédula si tienes ${edad} años. Debes ser mayor de edad.`,
            );
            this._bot("Volviendo al inicio...");
            setTimeout(() => this.init(), 2000);
            return;
        }
        this._datos.fechaNacimiento = input;
        this._estado = ChatBot.ESTADOS.REG_SEXO;
        this._bot("Selecciona tu Sexo:\n1. MASCULINO\n2. FEMENINO\n3. OTRO");
    }

    _handleRegSexo(input) {
        const sexo = ChatBot.SEXOS[input];
        if (!sexo) {
            this._bot("Selecciona 1, 2 o 3.");
            return;
        }
        this._datos.sexo = sexo;
        this._estado = ChatBot.ESTADOS.REG_GRUPO;
        this._bot("Selecciona tu Grupo Sanguíneo:\n1. A\n2. B\n3. AB\n4. O");
    }

    _handleRegGrupo(input) {
        const grupo = ChatBot.GRUPOS[input];
        if (!grupo) {
            this._bot("Selecciona 1, 2, 3 o 4.");
            return;
        }
        this._datos.grupoSanguineo = grupo;
        this._estado = ChatBot.ESTADOS.REG_RH;
        this._bot("Selecciona tu RH:\n1. POSITIVO (+)\n2. NEGATIVO (-)");
    }

    _handleRegRh(input) {
        const rh = ChatBot.RHS[input];
        if (!rh) {
            this._bot("Selecciona 1 o 2.");
            return;
        }
        this._datos.rh = rh;
        if (this._rol === "Paciente") {
            this._estado = ChatBot.ESTADOS.REG_MEDICO_ID;
            this._bot("Ingresa el ID del Médico que te atenderá:");
        } else {
            this._estado = ChatBot.ESTADOS.REG_PROFESIONAL;
            this._bot("Ingresa tu Registro Médico:");
        }
    }

    async _handleRegMedicoId(input) {
        this._datos.medicoId = input;
        await this._ejecutarRegistro();
    }

    async _handleRegProfesional(input) {
        this._datos.registroMedico = input;
        await this._ejecutarRegistro();
    }

    async _handleMenuPrincipal(input) {
        if (this._rol === "Paciente") {
            if (input === "1") {
                this._estado = ChatBot.ESTADOS.SIGNOS_SIS;
                this._bot("Iniciemos el registro. Envía tu PRESIÓN SISTÓLICA:");
            } else if (input === "2") {
                await this._verHistorialPaciente();
            } else {
                this._bot("Opción no válida para tu perfil de Paciente.");
            }
        } else {
            if (input === "1") {
                await this._listarPacientes();
            } else if (input === "2") {
                this._estado = ChatBot.ESTADOS.SEL_SIGNO_ID;
                this._bot(
                    "Ingresa el ID del registro al que deseas añadir una observación:",
                );
            }
        }
    }

    _handleSignosSis(input) {
        this._datos.sis = input;
        this._estado = ChatBot.ESTADOS.SIGNOS_DIA;
        this._bot("Por favor enviar la PRESIÓN DIASTÓLICA:");
    }

    _handleSignosDia(input) {
        this._datos.dia = input;
        this._estado = ChatBot.ESTADOS.SIGNOS_FREQ;
        this._bot("Por favor enviar la FRECUENCIA CARDIACA:");
    }

    _handleSignosFreq(input) {
        this._datos.freq = input;
        this._estado = ChatBot.ESTADOS.SIGNOS_EXTRA;
        this._bot(
            "¿Deseas registrar Temperatura y Saturación?\nEnvía 'SI' o 'NO'",
        );
    }

    async _handleSignosExtra(input) {
        if (input.toUpperCase() === "SI") {
            this._estado = ChatBot.ESTADOS.SIGNOS_TEMP;
            this._bot("Por favor enviar la TEMPERATURA:");
        } else {
            await this._guardarSignos();
        }
    }

    _handleSignosTemp(input) {
        this._datos.temp = input;
        this._estado = ChatBot.ESTADOS.SIGNOS_SAT;
        this._bot("Por favor enviar la SATURACIÓN DE OXIGENO:");
    }

    async _handleSignosSat(input) {
        this._datos.sat = input;
        await this._guardarSignos();
    }

    async _handleSelSignoId(input) {
        this._datos.currentSignoId = input;
        await this._iniciarFlujoObservacion(input);
    }

    async _handleEsperandoObs(input) {
        await this._guardarObservacion(input);
    }

    // -------------------------------------------------------------------------
    // LÓGICA DE NEGOCIO (con llamadas al ApiService)
    // -------------------------------------------------------------------------

    async _verificarUsuario(numeroId) {
        const { tipoIdentificacion, tipoDescripcion } = this._datos;
        const url =
            `/api/usuarios/verificar?tipoId=${tipoIdentificacion.id}&numeroId=${numeroId}`;
        this._log("GET", url);
        this._bot("Buscando en nuestra base de datos... 🔍");

        try {
            this._usuarioActual = await ApiService.verificarUsuario(
                tipoIdentificacion.id,
                numeroId,
            );
            this._bot(
                `¡Confirmado! Te encontré en el sistema como **${this._usuarioActual.nombre}**.`,
            );
            this._mostrarMenuPrincipal();
        } catch {
            this._bot(
                `No logré encontrar un ${this._rol} con ${tipoDescripcion} No. **${numeroId}**.`,
            );
            this._bot(
                `¿Qué te gustaría hacer?\n1. Registrarme como nuevo ${this._rol}\n2. Corregir el número ingresado\n0. Salir`,
            );
            this._estado = ChatBot.ESTADOS.NO_ENCONTRADO;
        }
    }

    async _ejecutarRegistro() {
        const d = this._datos;
        const esPaciente = this._rol === "Paciente";
        const endpoint = esPaciente
            ? "/api/usuarios/pacientes"
            : "/api/usuarios/medicos";

        const body = {
            nombre: d.nombre,
            apellido: d.apellido,
            fechaNacimiento: d.fechaNacimiento,
            numeroIdentificacion: d.numeroIdentificacion,
            tipoIdentificacion: { id: parseInt(d.tipoIdentificacion.id) },
            sexo: d.sexo,
            grupoSanguineo: d.grupoSanguineo,
            rh: d.rh,
            ...(esPaciente
                ? { medico: { id: parseInt(d.medicoId) } }
                : { registroMedico: d.registroMedico }),
        };

        this._log("POST", endpoint, JSON.stringify(body));
        try {
            this._usuarioActual = esPaciente
                ? await ApiService.registrarPaciente(body)
                : await ApiService.registrarMedico(body);
            this._bot("¡Registro exitoso! ✅");
            await refreshDataTables();
            this._mostrarMenuPrincipal();
        } catch {
            this._errorBot(
                "No se pudo completar el registro. Intenta de nuevo.",
            );
        }
    }

    async _listarPacientes() {
        const url = `/api/medicos/${this._usuarioActual.id}/pacientes`;
        this._log("GET", url);
        this._bot("Consultando tu lista de pacientes asignados... 📋");

        try {
            const pacientes = await ApiService.pacientesDelMedico(
                this._usuarioActual.id,
            );

            if (!pacientes?.length) {
                this._bot("Actualmente no tienes pacientes vinculados. 👤");
                this._bot(
                    "Para vincular uno, el paciente debe ingresar tu ID al registrarse.\n\n0. Volver al menú",
                );
            } else {
                this._bot(
                    `Doctor, he encontrado **${pacientes.length}** pacientes bajo su supervisión:`,
                );
                pacientes.forEach((p, i) => {
                    const sangre = p.grupoSanguineo
                        ? `${p.grupoSanguineo}${Utils.rhSimbolo(p.rh)}`
                        : "No registrado";
                    this._bot(
                        `👤 **Paciente #${i + 1}**\n` +
                            `• **Nombre:** ${p.nombre} ${p.apellido}\n` +
                            `• **ID Sistema:** ${p.id}\n` +
                            `• **Documento:** ${p.numeroIdentificacion}\n` +
                            `• **Sexo:** ${p.sexo || "N/A"}\n` +
                            `• **G.S / RH:** ${sangre}`,
                    );
                });
                this._bot(
                    "¿Qué desea realizar ahora?\n2. Agregar Observación Médica ✍️\n\n0. Salir",
                );
            }
            this._estado = ChatBot.ESTADOS.MENU_PRINCIPAL;
        } catch {
            this._errorBot(
                "Lo siento Doctor, hubo un fallo al cargar la lista de pacientes. 😕",
            );
        }
    }

    async _verHistorialPaciente() {
        const url =
            `/api/signos-vitales/historialConObservaciones/${this._usuarioActual.id}`;
        this._log("GET", url);

        try {
            const signos = await ApiService.historialConObservaciones(
                this._usuarioActual.id,
            );

            if (!signos.length) {
                this._bot("Aún no tienes registros de signos vitales. 🩺");
                this._bot(
                    "¿Deseas registrar tu presión ahora?\n1. Sí, registrar\n0. Salir",
                );
                return;
            }

            this._bot(
                `He recuperado tus últimos **${signos.length}** registros:`,
            );
            signos.forEach((s) => {
                const estado = Utils.calcularEstadoPresion(
                    s.presionSistolica,
                    s.presionDiastolica,
                );
                let msg =
                    `📊 **Registro del ${
                        Utils.formatearFecha(s.createdAt)
                    }**\n` +
                    `• Presión: ${s.presionSistolica}/${s.presionDiastolica} mmHg (${estado})\n` +
                    `• Pulso: ${s.frecuenciaCardiaca} BPM`;

                if (s.observaciones?.length) {
                    msg +=
                        `\n\n👨‍⚕️ **Observaciones Médicas (${s.observaciones.length}):**`;
                    s.observaciones.forEach((obs, i) => {
                        msg += `\n  ${i + 1}. "${
                            Utils.limpiarMensajeObservacion(obs.mensaje)
                        }"`;
                    });
                } else {
                    msg += `\n\nℹ️ *Sin observaciones médicas aún.*`;
                }
                this._bot(msg);
            });

            this._bot("¿Qué deseas hacer ahora?\n1. Nuevo Registro\n0. Salir");
        } catch {
            this._errorBot(
                "Lo siento, error al consultar los registros en el sistema.",
            );
        }
    }

    async _iniciarFlujoObservacion(signoId) {
        const url = `/api/observaciones/historial/${signoId}`;
        this._log("GET", url);

        try {
            const signo = await ApiService.signoVitalPorId(signoId);
            const infoPaciente = signo.paciente?.nombre
                ? `${signo.paciente.nombre} ${signo.paciente.apellido}`
                : `Paciente del Registro #${signoId}`;

            this._bot(
                `✅ **Signo Localizado**\n` +
                    `👤 Corresponde a: ${infoPaciente}\n` +
                    `🩺 Presión: ${signo.presionSistolica}/${signo.presionDiastolica} mmHg\n\n` +
                    `¿Qué instrucción médica desea registrar?`,
            );
            this._estado = ChatBot.ESTADOS.ESPERANDO_OBS;
        } catch {
            this._bot(
                `❌ El ID **${signoId}** no existe en los registros actuales.`,
            );
            this._mostrarMenuPrincipal();
        }
    }

    async _guardarObservacion(texto) {
        const url =
            `/api/observaciones/responder/${this._datos.currentSignoId}`;
        this._log("POST", url, JSON.stringify({ mensaje: texto }));
        try {
            await ApiService.guardarObservacion(
                this._datos.currentSignoId,
                texto,
            );
            this._bot(
                "✅ Observación guardada correctamente. El paciente ya puede verla en su historial.",
            );
            await refreshDataTables();
            this._mostrarMenuPrincipal();
        } catch {
            this._errorBot(
                "No se pudo guardar la observación. Intente de nuevo.",
            );
        }
    }

    async _guardarSignos() {
        const d = this._datos;
        const body = {
            paciente: { id: this._usuarioActual.id },
            medico: { id: this._usuarioActual.medicoId ?? 1 },
            presionSistolica: parseInt(d.sis),
            presionDiastolica: parseInt(d.dia),
            frecuenciaCardiaca: parseInt(d.freq),
            temperatura: d.temp ? parseFloat(d.temp) : null,
            saturacionOxigeno: d.sat ? parseInt(d.sat) : null,
        };

        this._log(
            "POST",
            "/api/signos-vitales/registrar",
            JSON.stringify(body),
        );
        try {
            await ApiService.guardarSignos(body);
            this._bot("Información guardada satisfactoriamente. ✅");
            this._mostrarMenuPrincipal();
        } catch {
            this._errorBot(
                "No se pudo guardar los signos vitales. Intenta de nuevo.",
            );
        }
    }
}

// =============================================================================
// DASHBOARD: tablas de datos (independiente del ChatBot)
// =============================================================================

async function refreshDataTables() {
    try {
        const [pacientes, medicos, signos, observaciones] = await Promise.all([
            ApiService.listaPacientes(),
            ApiService.listaMedicos(),
            ApiService.listaSignos(),
            ApiService.listaObservaciones(),
        ]);

        document.getElementById("table-pacientes-body").innerHTML = pacientes
            .map((p) => `
            <tr>
                <td>${p.id}</td>
                <td><small>${p.nombre} ${p.apellido}</small></td>
                <td>${p.numeroIdentificacion}</td>
                <td>${p.sexo || "N/A"}</td>
                <td>${p.grupoSanguineo || ""}${Utils.rhSimbolo(p.rh)}</td>
                <td><span class="badge bg-primary">ID: ${
                p.medico?.id ?? p.medicoId ?? "N/A"
            }</span></td>
            </tr>`).join("");

        document.getElementById("table-medicos-body").innerHTML = medicos.map((
            m,
        ) => `
            <tr>
                <td>${m.id}</td>
                <td>${m.nombre}</td>
                <td>${m.numeroIdentificacion}</td>
                <td>${m.sexo || "N/A"}</td>
                <td>${m.registroMedico}</td>
                <td>${m.especialidad || "General"}</td>
            </tr>`).join("");

        document.getElementById("table-signos-body").innerHTML = signos.map(
            (s) => {
                const estado = Utils.calcularEstadoPresion(
                    s.presionSistolica,
                    s.presionDiastolica,
                );
                const color = estado.includes("ALTA")
                    ? "danger"
                    : estado.includes("PRE")
                    ? "warning"
                    : "success";
                return `
            <tr>
                <td>${s.id}</td>
                <td>${s.paciente?.id ?? s.pacienteId ?? "N/A"}</td>
                <td><b>${s.presionSistolica}/${s.presionDiastolica}</b></td>
                <td>${s.frecuenciaCardiaca}</td>
                <td>${s.temperatura ?? "-"}/${s.saturacionOxigeno ?? "-"}</td>
                <td><span class="badge bg-${color}">${estado}</span></td>
            </tr>`;
            },
        ).join("");

        document.getElementById("table-obs-body").innerHTML = observaciones.map(
            (o) => `
            <tr>
                <td>${o.id}</td>
                <td>${o.signoVital?.id ?? o.signoVitalId ?? "N/A"}</td>
                <td title="${JSON.stringify(o.mensaje)}"><small>${
                o.mensaje.substring(0, 20)
            }...</small></td>
                <td><small>${
                new Date(o.createdAt).toLocaleDateString()
            }</small></td>
            </tr>`
        ).join("");
    } catch (error) {
        console.error("Error cargando tablas:", error);
    }
}

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

const bot = new ChatBot();

window.bot = bot;
window.refreshDataTables = refreshDataTables;

refreshDataTables();
