let currentState = "GREETING";
let userData = {};
let currentUser = null;
let selectedRole = "";

const chatWindow = document.getElementById("chat-window");
const inputField = document.getElementById("user-input");
const logArea = document.getElementById("api-logs");

// Inicialización limpia del objeto de datos
function resetUserData() {
    userData = {
        tipoIdentificacion: { id: null },
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
    };
}

function addMessage(text, side) {
    const div = document.createElement("div");
    div.className = `bubble ${side}`;
    div.innerHTML = text.replace(/\n/g, "<br>");
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addLog(method, url, body = "") {
    const time = new Date().toLocaleTimeString();
    logArea.innerHTML +=
        `<div class="mb-2"><span class="text-warning">[${time}]</span> <span class="text-primary">${method}</span> ${url}<br><span class="text-secondary small">${body}</span></div>`;
    logArea.scrollTop = logArea.scrollHeight;
}

function startChat() {
    currentState = "GREETING_ROLE";
    resetUserData();
    currentUser = null;
    chatWindow.innerHTML = "";
    addMessage("¡Hola! Soy tu Hiper-ChatBot de confianza. 👋", "bot");
    addMessage(
        "Cuéntame, ¿cómo te identificas hoy?\n1. Paciente\n2. Médico",
        "bot",
    );
}

function handleUserInput() {
    const input = inputField.value.trim();
    if (!input) return;
    addMessage(input, "user");
    inputField.value = "";

    if (["0", "salir", "inicio"].includes(input.toLowerCase())) {
        addMessage("Operación cancelada. Volviendo al inicio...", "bot");
        setTimeout(startChat, 1000);
        return;
    }
    processState(input);
}

function mostrarMenuPrincipal() {
    let menu = "";

    if (selectedRole === "Paciente") {
        // Opciones exclusivas para el Paciente
        menu = `Hola **${currentUser.nombre}**, este es tu portal de salud:\n` +
            `1. Registrar mis Signos Vitales 🩺\n` +
            `2. Ver mi Historial y Notas Médicas 📚\n` +
            `0. Salir`;
    } else {
        // Opciones exclusivas para el Médico
        menu = `Bienvenido Dr. **${currentUser.apellido}**:\n` +
            `1. Listar mis Pacientes Asignados 👥\n` +
            `2. Agregar Observación a un Registro ✍️\n` +
            `0. Salir`;
    }

    addMessage(menu, "bot");
    currentState = "MAIN_MENU";
}

async function processState(input) {
    switch (currentState) {
        case "GREETING_ROLE":
            if (input === "1" || input === "2") {
                selectedRole = (input === "1") ? "Paciente" : "Médico";
                currentState = "SELECT_ID_TYPE";
                addMessage(
                    "Selecciona tu tipo de identificación:\n1. Cédula de Ciudadanía\n2. Tarjeta de Identidad\n3. Cédula de Extranjería\n4. Pasaporte",
                    "bot",
                );
            } else addMessage("Opción no válida. Envía 1 o 2.", "bot");
            break;

        case "SELECT_ID_TYPE":
            const types = {
                "1": "Cédula de Ciudadanía",
                "2": "Tarjeta de Identidad",
                "3": "Cédula de Extranjería",
                "4": "Pasaporte",
            };
            if (types[input]) {
                userData.tipoIdentificacion.id = parseInt(input);
                userData.tipoDescription = types[input];
                currentState = "ENTER_ID_NUMBER";
                addMessage(
                    "Por favor, diligencia tu número de identificación:",
                    "bot",
                );
            } else {
                addMessage(
                    "Opción no válida. Selecciona 1, 2, 3 o 4.",
                    "bot",
                );
            }
            break;

        case "ENTER_ID_NUMBER":
            userData.numeroIdentificacion = input;
            await verifyUserInDB(input);
            break;

        case "NOT_FOUND_OPTIONS":
            if (input === "1") {
                currentState = "REG_NAME";
                addMessage(
                    "Iniciemos el registro. Por favor envíame tus Nombres:",
                    "bot",
                );
            } else startChat();
            break;

        case "REG_NAME":
            userData.nombre = input;
            currentState = "REG_SURNAME";
            addMessage("Por favor envíame tus Apellidos:", "bot");
            break;

        case "REG_SURNAME":
            userData.apellido = input;
            currentState = "REG_BIRTHDATE";
            addMessage("Por favor envíame tu Fecha de Nacimiento (AAAA-MM-DD):", "bot");
            break;

        case "REG_BIRTHDATE":
            const edadCalculada = calcularEdad(input);
            
            if (edadCalculada < 0 || edadCalculada > 120 || isNaN(edadCalculada)) {
                addMessage("⚠️ La fecha ingresada no es válida. Usa el formato AAAA-MM-DD (Ej: 1990-05-20).", "bot");
            } else if (userData.tipoIdentificacion.id === 1 && edadCalculada < 18) { 
                // Validación de Cédula de Ciudadanía (ID 1)
                addMessage(`🚫 No puedes registrarte con Cédula si tienes ${edadCalculada} años. Debes ser mayor de edad.`, "bot");
                addMessage("Volviendo al inicio del registro...", "bot");
                setTimeout(startChat, 2000);
            } else {
                userData.fechaNacimiento = input; // Guardamos la fecha
                currentState = "REG_SEXO";
                addMessage(
                    "Selecciona tu Sexo:\n1. MASCULINO\n2. FEMENINO\n3. OTRO",
                    "bot",
                );
            }
            break;

        case "REG_SEXO":
            const sexos = { "1": "MASCULINO", "2": "FEMENINO", "3": "OTRO" };
            if (sexos[input]) {
                userData.sexo = sexos[input];
                currentState = "REG_GRUPO";
                addMessage(
                    "Selecciona tu Grupo Sanguíneo:\n1. A\n2. B\n3. AB\n4. O",
                    "bot",
                );
            } else addMessage("Selecciona 1, 2 o 3.", "bot");
            break;

        case "REG_GRUPO":
            const grupos = { "1": "A", "2": "B", "3": "AB", "4": "O" };
            if (grupos[input]) {
                userData.grupoSanguineo = grupos[input];
                currentState = "REG_RH";
                addMessage(
                    "Selecciona tu RH:\n1. POSITIVO (+)\n2. NEGATIVO (-)",
                    "bot",
                );
            } else addMessage("Selecciona 1, 2, 3 o 4.", "bot");
            break;

        case "REG_RH":
            const rhs = { "1": "POSITIVO", "2": "NEGATIVO" };
            if (rhs[input]) {
                userData.rh = rhs[input];
                if (selectedRole === "Paciente") {
                    currentState = "REG_MEDICO_ID";
                    addMessage(
                        "Ingresa el ID del Médico que te atenderá:",
                        "bot",
                    );
                } else {
                    currentState = "REG_PROFESIONAL";
                    addMessage("Ingresa tu Registro Médico:", "bot");
                }
            }
            break;

        case "REG_MEDICO_ID":
            userData.medicoId = input;
            await ejecutarPostRegistro();
            break;

        case "REG_PROFESIONAL":
            userData.registroMedico = input;
            await ejecutarPostRegistro();
            break;

        case "MAIN_MENU":
            if (selectedRole === "Paciente") {
                if (input === "1") {
                    currentState = "INPUT_SIS";
                    addMessage(
                        "Iniciemos el registro. Envía tu PRESIÓN SISTÓLICA:",
                        "bot",
                    );
                } else if (input === "2") {
                    await verMiHistorialPaciente();
                } else {
                    addMessage(
                        "Opción no válida para tu perfil de Paciente.",
                        "bot",
                    );
                }
            } else if (selectedRole === "Médico") {
                if (input === "1") {
                    await listarPacientesDelMedico();
                } else if (input === "2") {
                    currentState = "SELECT_SIGNOS_ID";
                    addMessage(
                        "Ingresa el ID del registro al que deseas añadir una observación:",
                        "bot",
                    );
                }
            }
            break;

        case "SELECT_SIGNOS_ID":
            await iniciarFlujoObservacion(input);
            break;

        case "WAITING_OBSERVATION_TEXT":
            await guardarObservacionFinal(input);
            break;

        case "INPUT_SIS":
            userData.sis = input;
            currentState = "INPUT_DIA";
            addMessage("Por favor enviar la PRESIÓN DIASTÓLICA:", "bot");
            break;

        case "INPUT_DIA":
            userData.dia = input;
            currentState = "INPUT_FREQ";
            addMessage("Por favor enviar la FRECUENCIA CARDIACA:", "bot");
            break;

        case "INPUT_FREQ":
            userData.freq = input;
            currentState = "ASK_EXTRA";
            addMessage(
                "¿Deseas registrar Temperatura y Saturación?\nEnvía 'SI' o 'NO'",
                "bot",
            );
            break;

        case "ASK_EXTRA":
            if (input.toUpperCase() === "SI") {
                currentState = "INPUT_TEMP";
                addMessage("Por favor enviar la TEMPERATURA:", "bot");
            } else {
                await guardarSignosVitales();
            }
            break;

        case "INPUT_TEMP":
            userData.temp = input;
            currentState = "INPUT_SAT";
            addMessage("Por favor enviar la SATURACIÓN DE OXIGENO:", "bot");
            break;

        case "INPUT_SAT":
            userData.sat = input;
            await guardarSignosVitales();
            break;
    }
}

// --- FUNCIONES DE COMUNICACIÓN CON EL API ---

async function verifyUserInDB(id) {
    const tipoId = userData.tipoIdentificacion.id;
    const url = `/api/usuarios/verificar?tipoId=${tipoId}&numeroId=${id}`;

    addLog("GET", url);
    addMessage("Buscando en nuestra base de datos... 🔍", "bot");

    try {
        const response = await fetch(url);
        if (response.ok) {
            currentUser = await response.json();
            addMessage(
                `¡Confirmado! Te encontré en el sistema como **${currentUser.nombre}**.`,
                "bot",
            );
            mostrarMenuPrincipal();
        } else {
            addMessage(
                `No logré encontrar un ${selectedRole} con ${userData.tipoDescription} No. **${id}**.`,
                "bot",
            );
            addMessage(
                `¿Qué te gustaría hacer?\n1. Registrarme como nuevo ${selectedRole}\n2. Corregir el número ingresado\n0. Salir`,
                "bot",
            );
            currentState = "NOT_FOUND_OPTIONS";
        }
    } catch (error) {
        addMessage(
            "⚠️ Ups, tuve un problema técnico al conectar con el servidor. Por favor, intenta de nuevo en un momento.",
            "bot",
        );
    }
}

function mostrarMenuPrincipal() {
    let menu = "";

    if (selectedRole === "Paciente") {
        // Opciones exclusivas para el Paciente
        menu = `Hola **${currentUser.nombre}**, este es tu portal de salud:\n` +
            `1. Registrar mis Signos Vitales 🩺\n` +
            `2. Ver mi Historial y Notas Médicas 📚\n` +
            `0. Salir`;
    } else {
        // Opciones exclusivas para el Médico
        menu = `Bienvenido Dr. **${currentUser.apellido}**:\n` +
            `1. Listar mis Pacientes Asignados 👥\n` +
            `2. Agregar Observación a un Registro ✍️\n` +
            `0. Salir`;
    }

    addMessage(menu, "bot");
    currentState = "MAIN_MENU";
}

async function listarPacientesDelMedico() {
    // La URL que definiste es correcta para traer los pacientes vinculados al médico logueado
    const url = `/api/medicos/${currentUser.id}/pacientes`;
    addLog("GET", url);
    addMessage("Consultando tu lista de pacientes asignados... 📋", "bot");

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener pacientes");

        const pacientes = await response.json();

        if (!pacientes || pacientes.length === 0) {
            addMessage(
                "Actualmente no tienes pacientes vinculados a tu registro médico. 👤",
                "bot",
            );
            addMessage(
                "Para vincular uno, el paciente debe ingresar tu ID al momento de su registro.\n\n¿Deseas volver al menú?\n0. Sí",
                "bot",
            );
            currentState = "MAIN_MENU";
        } else {
            addMessage(
                `Doctor, he encontrado **${pacientes.length}** pacientes bajo su supervisión:`,
                "bot",
            );

            pacientes.forEach((p, index) => {
                // Formateamos la información clínica del paciente
                const rhSimbolo = p.rh === "POSITIVO" ? "+" : "-";
                const infoSangre = p.grupoSanguineo
                    ? `${p.grupoSanguineo}${rhSimbolo}`
                    : "No registrado";

                let msg = `👤 **Paciente #${index + 1}**\n` +
                    `• **Nombre:** ${p.nombre} ${p.apellido}\n` +
                    `• **ID Sistema:** ${p.id}\n` +
                    `• **Documento:** ${p.numeroIdentificacion}\n` +
                    `• **Sexo:** ${p.sexo || "N/A"}\n` +
                    `• **G.S / RH:** ${infoSangre}`;

                addMessage(msg, "bot");
            });

            addMessage(
                "¿Qué desea realizar ahora?\n2. Agregar Observación Médica ✍️\n\n0. Salir",
                "bot",
            );
            currentState = "MAIN_MENU";
        }
    } catch (e) {
        console.error(e);
        addMessage(
            "Lo siento Doctor, hubo un fallo al cargar la lista de pacientes. Reintente en un momento. 😕",
            "bot",
        );
    }
}

/**
 * PASO 1: El médico ingresa el ID del Signo Vital (viene del MAIN_MENU)
 */
async function iniciarFlujoObservacion(signoId) {
    userData.currentSignoId = signoId;
    const urlVerificar = `/api/observaciones/historial/${signoId}`;

    addLog("GET", urlVerificar);

    try {
        const response = await fetch(urlVerificar);

        if (response.ok) {
            const signo = await response.json();

            // Lógica de seguridad: Si no hay objeto paciente (por el LAZY), usamos el ID
            const infoPaciente = (signo.paciente && signo.paciente.nombre)
                ? `${signo.paciente.nombre} ${signo.paciente.apellido}`
                : `Paciente del Registro #${signoId}`;

            addMessage(
                `✅ **Signo Localizado**\n` +
                    `👤 Corresponde a: ${infoPaciente}\n` +
                    `🩺 Presión: ${signo.presionSistolica}/${signo.presionDiastolica} mmHg\n\n` +
                    `¿Qué instrucción médica desea registrar?`,
                "bot",
            );

            currentState = "WAITING_OBSERVATION_TEXT";
        } else {
            addMessage(
                `❌ El ID **${signoId}** no existe en los registros actuales.`,
                "bot",
            );
            mostrarMenuPrincipal();
        }
    } catch (e) {
        console.error("Error en el mapeo LAZY:", e);
        addMessage(
            "⚠️ Error: El servidor no envió los detalles del paciente. Verifica que la relación no esté siendo ignorada por Jackson.",
            "bot",
        );
    }
}

/**
 * PASO 2: Se envía la observación final al API
 */
async function guardarObservacionFinal(textoMensaje) {
    // Endpoint basado en tu estructura: /api/observaciones/responder/{signoId}
    const url = `/api/observaciones/responder/${userData.currentSignoId}`;

    // El cuerpo debe ser el objeto Observacion que espera tu Entidad
    const body = {
        mensaje: textoMensaje,
    };

    addLog("POST", url, JSON.stringify(body));

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            addMessage(
                "✅ Observación guardada correctamente. El paciente ya puede verla en su historial.",
                "bot",
            );
            await refreshDataTables(); // Refrescamos la pestaña de Observaciones
            mostrarMenuPrincipal();
        } else {
            addMessage(
                "No se pudo guardar la observación. Intente de nuevo.",
                "bot",
            );
        }
    } catch (error) {
        addMessage("Error de conexión al guardar la observación.", "bot");
    }
}

async function ejecutarPostRegistro() {
    const isPaciente = selectedRole === "Paciente";
    const endpoint = isPaciente
        ? "/api/usuarios/pacientes"
        : "/api/usuarios/medicos";

    const body = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        fechaNacimiento: userData.fechaNacimiento,
        numeroIdentificacion: userData.numeroIdentificacion,
        tipoIdentificacion: { id: parseInt(userData.tipoIdentificacion.id) },
        sexo: userData.sexo,
        grupoSanguineo: userData.grupoSanguineo,
        rh: userData.rh,
        ...(isPaciente
            ? { medico: { id: parseInt(userData.medicoId) } }
            : { registroMedico: userData.registroMedico }),
    };

    addLog("POST", endpoint, JSON.stringify(body));

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (res.ok) {
        currentUser = await res.json();
        addMessage(`¡Registro exitoso!`, "bot");
        await refreshDataTables();
        mostrarMenuPrincipal();
        currentState = "MAIN_MENU";
    }
}

async function guardarSignosVitales() {
    const body = {
        paciente: { id: currentUser.id },
        medico: currentUser.medicoId ? { id: currentUser.medicoId } : { id: 1 },
        presionSistolica: parseInt(userData.sis),
        presionDiastolica: parseInt(userData.dia),
        frecuenciaCardiaca: parseInt(userData.freq),
        temperatura: userData.temp ? parseFloat(userData.temp) : null,
        saturacionOxigeno: userData.sat ? parseInt(userData.sat) : null,
    };

    addLog("POST", "/api/signos-vitales/registrar", JSON.stringify(body));
    const res = await fetch("/api/signos-vitales/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (res.ok) {
        addMessage(
            "Información guardada satisfactoriamente. ✅\n",
            "bot",
        );
        currentState = "MAIN_MENU";
        mostrarMenuPrincipal();
    }
}

async function verHistorialConObservaciones() {
    const url = `/api/signos-vitales/paciente/${currentUser.id}`;
    addLog("GET", url);

    try {
        const res = await fetch(url);
        const datos = await res.json();

        if (!datos || datos.length === 0) {
            addMessage(
                "Aún no tienes registros de signos vitales en tu historial. 📋",
                "bot",
            );
            addMessage(
                "Es importante monitorear tu presión. ¿Deseas realizar tu primer registro ahora?\n1. Sí, registrar signos\n0. Volver al menú",
                "bot",
            );
            currentState = "MAIN_MENU"; // Reutilizamos el menú para procesar la opción 1
        } else {
            addMessage(
                `He encontrado **${datos.length}** registros en tu historial:`,
                "bot",
            );
            datos.forEach((s, index) => {
                let fecha = new Date(s.createdAt).toLocaleString();
                let msg = `📌 **Registro #${index + 1}** (${fecha})\n` +
                    `• Presión: ${s.presionSistolica}/${s.presionDiastolica} mmHg\n` +
                    `• Pulso: ${s.frecuenciaCardiaca} BPM`;

                if (s.observaciones && s.observaciones.length > 0) {
                    msg += `\n\n👨‍⚕️ **Nota Médica:** "${
                        s.observaciones[0].mensaje
                    }"`;
                }
                addMessage(msg, "bot");
            });
            addMessage(
                "¿Deseas algo más?\n1. Nuevo Registro\n4. Ver de nuevo\n0. Salir",
                "bot",
            );
        }
    } catch (e) {
        addMessage("No pude cargar tu historial en este momento. 😕", "bot");
    }
}

// Función para obtener y renderizar los datos en las tablas
async function refreshDataTables() {
    try {
        // --- CARGAR PACIENTES ---
        const resPacientes = await fetch("/api/usuarios/pacientes");
        const pacientes = await resPacientes.json();
        document.getElementById("table-pacientes-body").innerHTML = pacientes
            .map((p) => `
            <tr>
                <td>${p.id}</td>
                <td><small>${p.nombre} ${p.apellido}</small></td>
                <td>${p.numeroIdentificacion}</td>
                <td>${p.sexo || "N/A"}</td>
                <td>${p.grupoSanguineo || ""}${
                p.rh === "POSITIVO" ? "+" : "-"
            }</td>
                <td><span class="badge bg-primary">ID: ${
                p.medico?.id || p.medicoId || "N/A"
            }</span></td>
            </tr>`).join("");

        // --- CARGAR MÉDICOS ---
        const resMedicos = await fetch("/api/usuarios/medicos");
        const medicos = await resMedicos.json();
        document.getElementById("table-medicos-body").innerHTML = medicos.map(
            (m) => `
            <tr>
                <td>${m.id}</td>
                <td>${m.nombre}</td>
                <td>${m.numeroIdentificacion}</td>
                <td>${m.sexo || "N/A"}</td>
                <td>${m.registroMedico}</td>
                <td>${m.especialidad || "General"}</td>
            </tr>`,
        ).join("");

        // --- CARGAR SIGNOS VITALES ---
        const resSignos = await fetch("/api/signos-vitales/historial");
        const signos = await resSignos.json();
        document.getElementById("table-signos-body").innerHTML = signos.map(
            (s) => {
                const estado = calcularEstado(
                    s.presionSistolica,
                    s.presionDiastolica,
                );
                const colorEstado = estado.includes("ALTA")
                    ? "danger"
                    : (estado.includes("PRE") ? "warning" : "success");
                return `
            <tr>
                <td>${s.id}</td>
                <td>${s.paciente?.id || s.pacienteId || "N/A"}</td>
                <td><b>${s.presionSistolica}/${s.presionDiastolica}</b></td>
                <td>${s.frecuenciaCardiaca}</td>
                <td>${s.temperatura || "-"}/${s.saturacionOxigeno || "-"}</td>
                <td><span class="badge bg-${colorEstado}">${estado}</span></td>
            </tr>`;
            },
        ).join("");

        // --- CARGAR OBSERVACIONES ---
        const resObs = await fetch("/api/observaciones/historial");
        const observaciones = await resObs.json();
        document.getElementById("table-obs-body").innerHTML = observaciones.map(
            (o) => `
            <tr>
                <td>${o.id}</td>
                <td>${o.signoVital?.id || o.signoVitalId || "N/A"}</td>
                <td title="${JSON.stringify(o.mensaje)}"><small>${
                o.mensaje.substring(0, 20)
            }...</small></td>
                <td><small>${
                new Date(o.createdAt).toLocaleDateString()
            }</small></td>
            </tr>`,
        ).join("");
    } catch (error) {
        console.error("Error cargando tablas:", error);
    }
}

async function verMiHistorialPaciente() {
    // Usamos el ID del usuario que se logueó (currentUser.id)
    const url =
        `/api/signos-vitales/historialConObservaciones/${currentUser.id}`;
    addLog("GET", url);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en servidor");

        const misSignos = await response.json();

        if (misSignos.length === 0) {
            addMessage("Aún no tienes registros de signos vitales. 🩺", "bot");
            addMessage(
                "Es importante iniciar tu monitoreo. ¿Deseas registrar tu presión ahora?\n1. Sí, registrar\n0. Salir",
                "bot",
            );
            return;
        }

        addMessage(
            `He recuperado tus últimos **${misSignos.length}** registros:`,
            "bot",
        );

        misSignos.forEach((s, index) => {
            const fecha = new Date(s.createdAt).toLocaleString();
            let estadoPresion = calcularEstado(
                s.presionSistolica,
                s.presionDiastolica,
            );

            let msg = `📊 **Registro del ${fecha}**\n` +
                `• Presión: ${s.presionSistolica}/${s.presionDiastolica} mmHg (${estadoPresion})\n` +
                `• Pulso: ${s.frecuenciaCardiaca} BPM`;

            // Verificamos si hay observaciones
            if (s.observaciones && s.observaciones.length > 0) {
                msg +=
                    `\n\n👨‍⚕️ **Observaciones Médicas (${s.observaciones.length}):**`;

                // Recorremos TODAS las observaciones del arreglo
                s.observaciones.forEach((obs, i) => {
                    let textoLimpio = obs.mensaje;

                    // Limpieza por si acaso se guardó como JSON String
                    try {
                        if (
                            typeof textoLimpio === "string" &&
                            textoLimpio.startsWith("{")
                        ) {
                            const parsed = JSON.parse(textoLimpio);
                            textoLimpio = parsed.mensaje || textoLimpio;
                        }
                    } catch (e) { /* Texto plano, no hacemos nada */ }

                    // Añadimos cada nota con un pequeño guion o número
                    msg += `\n  ${i + 1}. "${textoLimpio}"`;
                });
            } else {
                msg += `\n\nℹ️ *Sin observaciones médicas aún.*`;
            }

            addMessage(msg, "bot");
        });

        addMessage(
            "¿Qué deseas hacer ahora?\n1. Nuevo Registro\n0. Salir",
            "bot",
        );
    } catch (error) {
        addMessage(
            "Lo siento, error al consultar los registros en el sistema.",
            "bot",
        );
    }
}

// Función auxiliar para dar feedback clínico básico
function calcularEstado(sis, dia) {
    if (sis < 120 && dia < 80) return "NORMAL ✅";
    if (sis >= 140 || dia >= 90) return "ALTA (HIPERTENSIÓN) ⚠️";
    return "PREHIPERTENSIÓN 🟡";
}

function calcularEdad(fechaString) {
    const hoy = new Date();
    const fechaNac = new Date(fechaString);
    if (isNaN(fechaNac.getTime())) return NaN;

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad;
}

startChat();
refreshDataTables();
