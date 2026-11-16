const MINUTOS_BASE_JORNADA = 555;
const CLAVE_ALMACENAMIENTO_LOCAL = "datos_reloj_checador_jornada";
const CLAVE_HISTORIAL_LOCAL = "historial_jornadas_laborales";
const ALTURA_FILA_ESTANDAR_PX = 48;
const ALTURA_FILA_EXTRAS_PX = 36;
const REPETICIONES_CICLO_HORAS = 11;
const REPETICIONES_CICLO_MINUTOS = 7;

const columnaHoras = document.getElementById("columnaHoras");
const columnaMinutos = document.getElementById("columnaMinutos");
const columnaPeriodo = document.getElementById("columnaPeriodo");
const columnaMinutosExtras = document.getElementById("columnaMinutosExtras");

const entradaTextoHora = document.getElementById("entradaTextoHora");
const entradaTextoMinuto = document.getElementById("entradaTextoMinuto");
const entradaTextoPeriodo = document.getElementById("entradaTextoPeriodo");
const entradaTextoMinutosExtras = document.getElementById("entradaTextoMinutosExtras");

const botonHoraActual = document.getElementById("botonHoraActual");
const botonCapturarEntrada = document.getElementById("botonCapturarEntrada");
const indicadorEntradaCapturada = document.getElementById("indicadorEntradaCapturada");
const textoHoraEntradaCapturada = document.getElementById("textoHoraEntradaCapturada");
const botonReiniciar = document.getElementById("botonReiniciar");

const indicadorHoraSalida = document.getElementById("indicadorHoraSalida");
const indicadorTiempoRestante = document.getElementById("indicadorTiempoRestante");
const indicadorTiempoTranscurrido = document.getElementById("indicadorTiempoTranscurrido");
const indicadorDuracionTotal = document.getElementById("indicadorDuracionTotal");
const barraProgreso = document.getElementById("barraProgreso");
const etiquetaEstado = document.getElementById("etiquetaEstado");
const etiquetaPorcentaje = document.getElementById("etiquetaPorcentaje");
const botonConfirmarSalidaAhora = document.getElementById("botonConfirmarSalidaAhora");

const contenedorSemanasHistorial = document.getElementById("contenedorSemanasHistorial");

const modalAlertaFin = document.getElementById("modalAlertaFin");
const modalHoraSalidaTexto = document.getElementById("modalHoraSalidaTexto");
const botonCerrarCruzModal = document.getElementById("botonCerrarCruzModal");
const botonAceptarModal = document.getElementById("botonAceptarModal");
const botonPosponerCincoMinutos = document.getElementById("botonPosponerCincoMinutos");

const modalEditarSalida = document.getElementById("modalEditarSalida");
const subtituloFechaEdicion = document.getElementById("subtituloFechaEdicion");
const campoEditarHora = document.getElementById("campoEditarHora");
const campoEditarMinuto = document.getElementById("campoEditarMinuto");
const campoEditarPeriodo = document.getElementById("campoEditarPeriodo");
const botonCerrarCruzEdicion = document.getElementById("botonCerrarCruzEdicion");
const botonCancelarEdicion = document.getElementById("botonCancelarEdicion");
const botonGuardarEdicionSalida = document.getElementById("botonGuardarEdicionSalida");

let temporizadorSeguimiento = null;
let temporizadoresDesplazamiento = {};
let fechaInicioJornada = null;
let fechaFinJornada = null;
let alertaMostrada = false;
let identificadorRegistroEnEdicion = null;

function obtenerAlturaFilaDeColumna(columnaElemento) {
    if (columnaElemento && columnaElemento.id === "columnaMinutosExtras") {
        return ALTURA_FILA_EXTRAS_PX;
    }
    return ALTURA_FILA_ESTANDAR_PX;
}

function rellenarColumnaLineal(columnaElemento, listaValores, valorSufijo = "") {
    columnaElemento.innerHTML = "";
    columnaElemento.dataset.esCiclico = "false";
    listaValores.forEach(function(valor) {
        const elementoFila = document.createElement("div");
        elementoFila.className = "elemento-desplazamiento";
        elementoFila.dataset.valor = valor;
        elementoFila.textContent = `${valor}${valorSufijo}`;

        elementoFila.addEventListener("click", function() {
            seleccionarValorEnColumna(columnaElemento, valor, true);
        });

        columnaElemento.appendChild(elementoFila);
    });
}

function rellenarColumnaCiclica(columnaElemento, listaValoresBase, repeticiones, valorSufijo = "") {
    columnaElemento.innerHTML = "";
    columnaElemento.dataset.esCiclico = "true";
    columnaElemento.dataset.totalBase = String(listaValoresBase.length);
    columnaElemento.dataset.totalRepeticiones = String(repeticiones);

    for (let rep = 0; rep < repeticiones; rep++) {
        listaValoresBase.forEach(function(valor, indiceBase) {
            const elementoFila = document.createElement("div");
            elementoFila.className = "elemento-desplazamiento";
            elementoFila.dataset.valor = valor;
            elementoFila.dataset.indiceBase = String(indiceBase);
            elementoFila.textContent = `${valor}${valorSufijo}`;

            elementoFila.addEventListener("click", function() {
                seleccionarValorEnColumna(columnaElemento, valor, true);
            });

            columnaElemento.appendChild(elementoFila);
        });
    }
}

function inicializarSelectoresDesplazamiento() {
    const listaHoras = [];
    for (let hora = 1; hora <= 12; hora++) {
        listaHoras.push(String(hora).padStart(2, "0"));
    }
    rellenarColumnaCiclica(columnaHoras, listaHoras, REPETICIONES_CICLO_HORAS);

    const listaMinutos = [];
    for (let minuto = 0; minuto < 60; minuto++) {
        listaMinutos.push(String(minuto).padStart(2, "0"));
    }
    rellenarColumnaCiclica(columnaMinutos, listaMinutos, REPETICIONES_CICLO_MINUTOS);

    const listaPeriodos = ["AM", "PM"];
    rellenarColumnaLineal(columnaPeriodo, listaPeriodos);

    const listaExtras = [];
    for (let extra = 0; extra <= 120; extra++) {
        listaExtras.push(String(extra));
    }
    rellenarColumnaLineal(columnaMinutosExtras, listaExtras, " min");

    vincularEventoDesplazamiento(columnaHoras, "horas");
    vincularEventoDesplazamiento(columnaMinutos, "minutos");
    vincularEventoDesplazamiento(columnaPeriodo, "periodo");
    vincularEventoDesplazamiento(columnaMinutosExtras, "extras");

    inicializarSelectsEdicionModal();
}

function inicializarSelectsEdicionModal() {
    campoEditarHora.innerHTML = "";
    for (let hora = 1; hora <= 12; hora++) {
        const textoHora = String(hora).padStart(2, "0");
        const opcion = document.createElement("option");
        opcion.value = textoHora;
        opcion.textContent = textoHora;
        campoEditarHora.appendChild(opcion);
    }

    campoEditarMinuto.innerHTML = "";
    for (let minuto = 0; minuto < 60; minuto++) {
        const textoMinuto = String(minuto).padStart(2, "0");
        const opcion = document.createElement("option");
        opcion.value = textoMinuto;
        opcion.textContent = textoMinuto;
        campoEditarMinuto.appendChild(opcion);
    }
}

function verificarLimitesContinuosCiclo(columnaElemento) {
    const alturaFila = obtenerAlturaFilaDeColumna(columnaElemento);
    const totalBase = parseInt(columnaElemento.dataset.totalBase, 10);
    const totalRepeticiones = parseInt(columnaElemento.dataset.totalRepeticiones, 10);
    const alturaUnCiclo = totalBase * alturaFila;

    const margenSuperior = alturaUnCiclo * 1.5;
    const margenInferior = alturaUnCiclo * (totalRepeticiones - 2.5);

    if (columnaElemento.scrollTop < margenSuperior) {
        columnaElemento.scrollTop += alturaUnCiclo * 2;
    } else if (columnaElemento.scrollTop > margenInferior) {
        columnaElemento.scrollTop -= alturaUnCiclo * 2;
    }
}

function recentrarEnCicloMedio(columnaElemento) {
    const alturaFila = obtenerAlturaFilaDeColumna(columnaElemento);
    const totalBase = parseInt(columnaElemento.dataset.totalBase, 10);
    const totalRepeticiones = parseInt(columnaElemento.dataset.totalRepeticiones, 10);
    const alturaUnCiclo = totalBase * alturaFila;
    const cicloCentral = Math.floor(totalRepeticiones / 2);

    const indiceActualTotal = Math.round(columnaElemento.scrollTop / alturaFila);
    const indiceEnCicloBase = ((indiceActualTotal % totalBase) + totalBase) % totalBase;
    const nuevoIndiceCentral = (cicloCentral * totalBase) + indiceEnCicloBase;
    const nuevaPosicionExacta = nuevoIndiceCentral * alturaFila;

    if (Math.abs(columnaElemento.scrollTop - nuevaPosicionExacta) > 1) {
        columnaElemento.scrollTo({
            top: nuevaPosicionExacta,
            behavior: "auto"
        });
        actualizarEstiloSeleccionVisual(columnaElemento);
    }
}

function vincularEventoDesplazamiento(columnaElemento, identificadorColumna) {
    const esCiclico = columnaElemento.dataset.esCiclico === "true";

    columnaElemento.addEventListener("scroll", function() {
        actualizarEstiloSeleccionVisual(columnaElemento);

        if (esCiclico) {
            verificarLimitesContinuosCiclo(columnaElemento);
        }

        if (temporizadoresDesplazamiento[identificadorColumna]) {
            clearTimeout(temporizadoresDesplazamiento[identificadorColumna]);
        }

        temporizadoresDesplazamiento[identificadorColumna] = setTimeout(function() {
            ajustarAElementoMasCercano(columnaElemento);
            if (esCiclico) {
                recentrarEnCicloMedio(columnaElemento);
            }
            recalcularYActualizarSeguimiento();
        }, 120);
    }, { passive: true });
}

function actualizarEstiloSeleccionVisual(columnaElemento) {
    const alturaFila = obtenerAlturaFilaDeColumna(columnaElemento);
    const posicionSuperior = columnaElemento.scrollTop;
    const indiceAproximado = Math.round(posicionSuperior / alturaFila);
    const elementos = columnaElemento.children;

    for (let i = 0; i < elementos.length; i++) {
        if (i === indiceAproximado) {
            elementos[i].classList.add("seleccionado");
        } else {
            elementos[i].classList.remove("seleccionado");
        }
    }
}

function ajustarAElementoMasCercano(columnaElemento) {
    const alturaFila = obtenerAlturaFilaDeColumna(columnaElemento);
    const posicionSuperior = columnaElemento.scrollTop;
    const indiceObjetivo = Math.round(posicionSuperior / alturaFila);
    const posicionExacta = indiceObjetivo * alturaFila;

    if (Math.abs(columnaElemento.scrollTop - posicionExacta) > 1) {
        columnaElemento.scrollTo({
            top: posicionExacta,
            behavior: "smooth"
        });
    }
    actualizarEstiloSeleccionVisual(columnaElemento);
}

function seleccionarValorEnColumna(columnaElemento, valorBuscado, animar = false) {
    const alturaFila = obtenerAlturaFilaDeColumna(columnaElemento);
    const elementos = Array.from(columnaElemento.children);
    const esCiclico = columnaElemento.dataset.esCiclico === "true";

    if (esCiclico) {
        const totalBase = parseInt(columnaElemento.dataset.totalBase, 10);
        const totalRepeticiones = parseInt(columnaElemento.dataset.totalRepeticiones, 10);
        const cicloCentral = Math.floor(totalRepeticiones / 2);

        const indiceBase = elementos.findIndex(function(elemento) {
            return elemento.dataset.valor === String(valorBuscado);
        });

        if (indiceBase !== -1) {
            const indiceDestino = (cicloCentral * totalBase) + (indiceBase % totalBase);
            const posicionDestino = indiceDestino * alturaFila;
            columnaElemento.scrollTo({
                top: posicionDestino,
                behavior: animar ? "smooth" : "auto"
            });
            actualizarEstiloSeleccionVisual(columnaElemento);
            return;
        }
    }

    for (let i = 0; i < elementos.length; i++) {
        if (elementos[i].dataset.valor === String(valorBuscado)) {
            const posicionDestino = i * alturaFila;
            columnaElemento.scrollTo({
                top: posicionDestino,
                behavior: animar ? "smooth" : "auto"
            });
            actualizarEstiloSeleccionVisual(columnaElemento);
            break;
        }
    }
}

function obtenerValorActualDeColumna(columnaElemento) {
    const alturaFila = obtenerAlturaFilaDeColumna(columnaElemento);
    const posicionSuperior = columnaElemento.scrollTop;
    const indiceActual = Math.round(posicionSuperior / alturaFila);
    const elemento = columnaElemento.children[indiceActual];
    return elemento ? elemento.dataset.valor : null;
}

function formatearHoraDoceHoras(fecha) {
    let horas = fecha.getHours();
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const periodo = horas >= 12 ? "PM" : "AM";
    horas = horas % 12;
    horas = horas ? horas : 12;
    const horasFormateadas = String(horas).padStart(2, "0");
    return `${horasFormateadas}:${minutos} ${periodo}`;
}

function formatearMilisegundosATiempo(milisegundos) {
    const totalSegundos = Math.max(0, Math.floor(milisegundos / 1000));
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    const horasFormateadas = String(horas).padStart(2, "0");
    const minutosFormateados = String(minutos).padStart(2, "0");
    const segundosFormateados = String(segundos).padStart(2, "0");

    return `${horasFormateadas}:${minutosFormateados}:${segundosFormateados}`;
}

function obtenerFechaHoyCadenaIso() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

function obtenerLunesDeFecha(fechaReferencia) {
    const fecha = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), fechaReferencia.getDate(), 0, 0, 0, 0);
    const diaSemana = fecha.getDay();
    const diferencia = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    fecha.setDate(diferencia);
    return fecha;
}

function formatearFechaAIso(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

function generarEtiquetaSemana(lunesFecha) {
    const domingoFecha = new Date(lunesFecha);
    domingoFecha.setDate(lunesFecha.getDate() + 6);

    const opcionesFormato = { day: "numeric", month: "short" };
    const textoLunes = lunesFecha.toLocaleDateString("es-ES", opcionesFormato);
    const textoDomingo = domingoFecha.toLocaleDateString("es-ES", opcionesFormato);
    const anio = domingoFecha.getFullYear();

    return `Semana del ${textoLunes} al ${textoDomingo} de ${anio}`;
}

function calcularMinutosEntreHoras(horaEntradaTexto, horaSalidaTexto) {
    if (!horaEntradaTexto || !horaSalidaTexto) {
        return 0;
    }

    const convertirAMinutosDelDia = function(cadenaHora) {
        const partes = cadenaHora.trim().split(" ");
        if (partes.length < 2) return 0;
        const [horasTexto, minutosTexto] = partes[0].split(":");
        let horas = parseInt(horasTexto, 10);
        const minutos = parseInt(minutosTexto, 10);
        const periodo = partes[1].toUpperCase();

        if (periodo === "PM" && horas < 12) {
            horas += 12;
        } else if (periodo === "AM" && horas === 12) {
            horas = 0;
        }
        return (horas * 60) + minutos;
    };

    const minutosEntrada = convertirAMinutosDelDia(horaEntradaTexto);
    let minutosSalida = convertirAMinutosDelDia(horaSalidaTexto);

    if (minutosSalida < minutosEntrada) {
        minutosSalida += 1440;
    }

    return Math.max(0, minutosSalida - minutosEntrada);
}

function formatearMinutosAHorasYMinutos(totalMinutos) {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${String(minutos).padStart(2, "0")}m`;
}

function obtenerHistorialDesdeAlmacenamiento() {
    const historialGuardado = localStorage.getItem(CLAVE_HISTORIAL_LOCAL);
    if (!historialGuardado) {
        return [];
    }
    try {
        return JSON.parse(historialGuardado) || [];
    } catch (error) {
        return [];
    }
}

function guardarHistorialEnAlmacenamiento(listaHistorial) {
    localStorage.setItem(CLAVE_HISTORIAL_LOCAL, JSON.stringify(listaHistorial));
    renderizarHistorialSemanas();
}

function guardarEstadoEnAlmacenamiento(hora, minuto, periodo, extras) {
    const estadoAGuardar = {
        hora: hora,
        minuto: minuto,
        periodo: periodo,
        minutosExtras: extras
    };
    localStorage.setItem(CLAVE_ALMACENAMIENTO_LOCAL, JSON.stringify(estadoAGuardar));
}

function cargarEstadoDesdeAlmacenamiento() {
    const estadoGuardadoTexto = localStorage.getItem(CLAVE_ALMACENAMIENTO_LOCAL);
    if (!estadoGuardadoTexto) {
        establecerValoresConHoraActual(false);
        return;
    }

    try {
        const datos = JSON.parse(estadoGuardadoTexto);
        if (datos.hora && datos.minuto && datos.periodo) {
            seleccionarValorEnColumna(columnaHoras, datos.hora, false);
            seleccionarValorEnColumna(columnaMinutos, datos.minuto, false);
            seleccionarValorEnColumna(columnaPeriodo, datos.periodo, false);
            seleccionarValorEnColumna(columnaMinutosExtras, datos.minutosExtras || "0", false);
            recalcularYActualizarSeguimiento();
        } else {
            establecerValoresConHoraActual(false);
        }
    } catch (error) {
        establecerValoresConHoraActual(false);
    }
}

function establecerValoresConHoraActual(animar = true) {
    const fechaActual = new Date();
    let horas = fechaActual.getHours();
    const minutos = fechaActual.getMinutes();
    const periodo = horas >= 12 ? "PM" : "AM";

    horas = horas % 12;
    horas = horas ? horas : 12;

    const horasTexto = String(horas).padStart(2, "0");
    const minutosTexto = String(minutos).padStart(2, "0");

    seleccionarValorEnColumna(columnaHoras, horasTexto, animar);
    seleccionarValorEnColumna(columnaMinutos, minutosTexto, animar);
    seleccionarValorEnColumna(columnaPeriodo, periodo, animar);

    setTimeout(recalcularYActualizarSeguimiento, animar ? 200 : 0);
}

function recalcularYActualizarSeguimiento() {
    const valorHora = obtenerValorActualDeColumna(columnaHoras);
    const valorMinuto = obtenerValorActualDeColumna(columnaMinutos);
    const valorPeriodo = obtenerValorActualDeColumna(columnaPeriodo);
    const valorExtras = parseInt(obtenerValorActualDeColumna(columnaMinutosExtras), 10) || 0;

    if (!valorHora || !valorMinuto || !valorPeriodo) {
        return;
    }

    let horasEntero = parseInt(valorHora, 10);
    const minutosEntero = parseInt(valorMinuto, 10);

    if (valorPeriodo === "PM" && horasEntero < 12) {
        horasEntero += 12;
    } else if (valorPeriodo === "AM" && horasEntero === 12) {
        horasEntero = 0;
    }

    const fechaActual = new Date();
    fechaInicioJornada = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        fechaActual.getDate(),
        horasEntero,
        minutosEntero,
        0,
        0
    );

    if (fechaInicioJornada.getTime() - fechaActual.getTime() > 12 * 60 * 60 * 1000) {
        fechaInicioJornada.setDate(fechaInicioJornada.getDate() - 1);
    }

    const duracionTotalMinutos = MINUTOS_BASE_JORNADA + valorExtras;
    const duracionTotalMilisegundos = duracionTotalMinutos * 60 * 1000;
    fechaFinJornada = new Date(fechaInicioJornada.getTime() + duracionTotalMilisegundos);
    alertaMostrada = false;

    const horasTotales = Math.floor(duracionTotalMinutos / 60);
    const minutosRestantesTotales = duracionTotalMinutos % 60;
    indicadorDuracionTotal.textContent = `${horasTotales}h ${minutosRestantesTotales}m`;

    guardarEstadoEnAlmacenamiento(valorHora, valorMinuto, valorPeriodo, valorExtras);
    actualizarCamposTextoDesdeRuedas(valorHora, valorMinuto, valorPeriodo, valorExtras);

    if (temporizadorSeguimiento) {
        clearInterval(temporizadorSeguimiento);
    }
    actualizarMetricas();
    temporizadorSeguimiento = setInterval(actualizarMetricas, 1000);
}

function actualizarCamposTextoDesdeRuedas(valorHora, valorMinuto, valorPeriodo, valorExtras) {
    if (entradaTextoHora && document.activeElement !== entradaTextoHora) {
        entradaTextoHora.value = valorHora;
    }
    if (entradaTextoMinuto && document.activeElement !== entradaTextoMinuto) {
        entradaTextoMinuto.value = valorMinuto;
    }
    if (entradaTextoPeriodo && document.activeElement !== entradaTextoPeriodo) {
        entradaTextoPeriodo.value = valorPeriodo;
    }
    if (entradaTextoMinutosExtras && document.activeElement !== entradaTextoMinutosExtras) {
        entradaTextoMinutosExtras.value = valorExtras;
    }
}

function sincronizarRuedasDesdeTexto() {
    let hora = parseInt(entradaTextoHora.value, 10);
    let minuto = parseInt(entradaTextoMinuto.value, 10);
    const periodo = entradaTextoPeriodo.value;
    let extras = parseInt(entradaTextoMinutosExtras.value, 10);

    if (isNaN(hora) || hora < 1) hora = 1;
    if (hora > 12) hora = 12;

    if (isNaN(minuto) || minuto < 0) minuto = 0;
    if (minuto > 59) minuto = 59;

    if (isNaN(extras) || extras < 0) extras = 0;
    if (extras > 300) extras = 300;

    const textoHora = String(hora).padStart(2, "0");
    const textoMinuto = String(minuto).padStart(2, "0");

    entradaTextoHora.value = textoHora;
    entradaTextoMinuto.value = textoMinuto;
    entradaTextoMinutosExtras.value = extras;

    seleccionarValorEnColumna(columnaHoras, textoHora, true);
    seleccionarValorEnColumna(columnaMinutos, textoMinuto, true);
    seleccionarValorEnColumna(columnaPeriodo, periodo, true);

    if (extras <= 120) {
        seleccionarValorEnColumna(columnaMinutosExtras, String(extras), true);
    }

    setTimeout(recalcularYActualizarSeguimiento, 150);
}

function actualizarMetricas() {
    if (!fechaInicioJornada || !fechaFinJornada) {
        return;
    }

    const ahora = new Date();
    const tiempoRestanteMilisegundos = fechaFinJornada.getTime() - ahora.getTime();
    const tiempoTranscurridoMilisegundos = ahora.getTime() - fechaInicioJornada.getTime();
    const duracionTotalMilisegundos = fechaFinJornada.getTime() - fechaInicioJornada.getTime();

    indicadorHoraSalida.textContent = formatearHoraDoceHoras(fechaFinJornada);

    if (tiempoRestanteMilisegundos > 0) {
        indicadorTiempoRestante.textContent = formatearMilisegundosATiempo(tiempoRestanteMilisegundos);
        indicadorTiempoTranscurrido.textContent = formatearMilisegundosATiempo(Math.max(0, tiempoTranscurridoMilisegundos));

        const porcentajeCalculado = Math.min(100, Math.max(0, (tiempoTranscurridoMilisegundos / duracionTotalMilisegundos) * 100));
        barraProgreso.style.width = `${porcentajeCalculado.toFixed(1)}%`;
        barraProgreso.classList.remove("completado");
        etiquetaPorcentaje.textContent = `${Math.floor(porcentajeCalculado)}%`;
        etiquetaEstado.textContent = "En progreso";
        document.title = `${indicadorTiempoRestante.textContent} - Control de Jornada`;
    } else {
        indicadorTiempoRestante.textContent = "00:00:00";
        indicadorTiempoTranscurrido.textContent = formatearMilisegundosATiempo(duracionTotalMilisegundos);
        barraProgreso.style.width = "100%";
        barraProgreso.classList.add("completado");
        etiquetaPorcentaje.textContent = "100%";
        etiquetaEstado.textContent = "Jornada cumplida";
        document.title = "Jornada Finalizada - Control de Jornada";

        if (!alertaMostrada) {
            activarAlertaFinJornada();
        }
    }
}

function capturarHoraDeEntradaActual() {
    recalcularYActualizarSeguimiento();

    if (!fechaInicioJornada || !fechaFinJornada) {
        return;
    }

    const ahora = new Date();
    const fechaIsoHoy = obtenerFechaHoyCadenaIso();
    const lunesSemana = obtenerLunesDeFecha(ahora);
    const semanaClave = formatearFechaAIso(lunesSemana);
    const semanaEtiqueta = generarEtiquetaSemana(lunesSemana);

    const horaEntradaCapturada = formatearHoraDoceHoras(fechaInicioJornada);
    const horaSalidaEstimada = formatearHoraDoceHoras(fechaFinJornada);
    const valorExtras = parseInt(obtenerValorActualDeColumna(columnaMinutosExtras), 10) || 0;

    const nombreDia = ahora.toLocaleDateString("es-ES", { weekday: "long" });
    const nombreDiaCapitalizado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
    const fechaCompletaTexto = ahora.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

    const historial = obtenerHistorialDesdeAlmacenamiento();
    const indiceExistente = historial.findIndex(function(registro) {
        return registro.fechaIso === fechaIsoHoy;
    });

    const registroHoy = {
        id: fechaIsoHoy,
        fechaIso: fechaIsoHoy,
        fechaDiaTexto: nombreDiaCapitalizado,
        fechaCompletaTexto: fechaCompletaTexto,
        semanaClave: semanaClave,
        semanaEtiqueta: semanaEtiqueta,
        horaEntrada: horaEntradaCapturada,
        horaSalidaEstimada: horaSalidaEstimada,
        horaSalidaConfirmada: null,
        minutosExtras: valorExtras,
        minutosTrabajadosTotales: null,
        estado: "en_progreso"
    };

    if (indiceExistente !== -1) {
        registroHoy.horaSalidaConfirmada = historial[indiceExistente].horaSalidaConfirmada;
        registroHoy.estado = historial[indiceExistente].estado || "en_progreso";
        registroHoy.minutosTrabajadosTotales = historial[indiceExistente].minutosTrabajadosTotales;
        historial[indiceExistente] = registroHoy;
    } else {
        historial.push(registroHoy);
    }

    guardarHistorialEnAlmacenamiento(historial);

    textoHoraEntradaCapturada.textContent = horaEntradaCapturada;
    indicadorEntradaCapturada.classList.remove("oculto");
}

function confirmarSalidaRegistrada(horaSalidaEspecifica = null) {
    const fechaIsoHoy = obtenerFechaHoyCadenaIso();
    const historial = obtenerHistorialDesdeAlmacenamiento();
    const indice = historial.findIndex(function(registro) {
        return registro.fechaIso === fechaIsoHoy;
    });

    const horaConfirmada = horaSalidaEspecifica || formatearHoraDoceHoras(new Date());

    if (indice !== -1) {
        historial[indice].horaSalidaConfirmada = horaConfirmada;
        historial[indice].estado = "completado";
        historial[indice].minutosTrabajadosTotales = calcularMinutosEntreHoras(
            historial[indice].horaEntrada,
            horaConfirmada
        );
        guardarHistorialEnAlmacenamiento(historial);
    } else {
        capturarHoraDeEntradaActual();
        confirmarSalidaRegistrada(horaConfirmada);
    }
}

function abrirModalEdicionParaRegistro(idRegistro) {
    const historial = obtenerHistorialDesdeAlmacenamiento();
    const registro = historial.find(function(item) {
        return item.id === idRegistro;
    });

    if (!registro) {
        return;
    }

    identificadorRegistroEnEdicion = idRegistro;
    subtituloFechaEdicion.textContent = `${registro.fechaDiaTexto}, ${registro.fechaCompletaTexto}`;

    const horaReferencia = registro.horaSalidaConfirmada || registro.horaSalidaEstimada;
    if (horaReferencia) {
        const partes = horaReferencia.trim().split(" ");
        if (partes.length >= 2) {
            const [horas, minutos] = partes[0].split(":");
            campoEditarHora.value = String(horas).padStart(2, "0");
            campoEditarMinuto.value = String(minutos).padStart(2, "0");
            campoEditarPeriodo.value = partes[1].toUpperCase();
        }
    }

    modalEditarSalida.classList.remove("oculto");
}

function cerrarModalEdicion() {
    modalEditarSalida.classList.add("oculto");
    identificadorRegistroEnEdicion = null;
}

function guardarSalidaModificada() {
    if (!identificadorRegistroEnEdicion) {
        return;
    }

    const hora = campoEditarHora.value;
    const minuto = campoEditarMinuto.value;
    const periodo = campoEditarPeriodo.value;
    const horaSalidaFinal = `${hora}:${minuto} ${periodo}`;

    const historial = obtenerHistorialDesdeAlmacenamiento();
    const indice = historial.findIndex(function(item) {
        return item.id === identificadorRegistroEnEdicion;
    });

    if (indice !== -1) {
        historial[indice].horaSalidaConfirmada = horaSalidaFinal;
        historial[indice].estado = "completado";
        historial[indice].minutosTrabajadosTotales = calcularMinutosEntreHoras(
            historial[indice].horaEntrada,
            horaSalidaFinal
        );
        guardarHistorialEnAlmacenamiento(historial);
    }

    cerrarModalEdicion();
}

function renderizarHistorialSemanas() {
    const historial = obtenerHistorialDesdeAlmacenamiento();
    contenedorSemanasHistorial.innerHTML = "";

    if (historial.length === 0) {
        contenedorSemanasHistorial.innerHTML = `<div class="mensaje-historial-vacio">No hay registros de jornada capturados aún. Usa el botón "Capturar hora de entrada" para registrar hoy.</div>`;
        return;
    }

    const mapaSemanas = {};
    historial.forEach(function(registro) {
        if (!mapaSemanas[registro.semanaClave]) {
            mapaSemanas[registro.semanaClave] = {
                clave: registro.semanaClave,
                etiqueta: registro.semanaEtiqueta,
                registros: []
            };
        }
        mapaSemanas[registro.semanaClave].registros.push(registro);
    });

    const listaClavesSemanas = Object.keys(mapaSemanas).sort().reverse();

    listaClavesSemanas.forEach(function(claveSemana) {
        const semana = mapaSemanas[claveSemana];

        semana.registros.sort(function(a, b) {
            return a.fechaIso.localeCompare(b.fechaIso);
        });

        let minutosTotalesSemana = 0;
        semana.registros.forEach(function(reg) {
            if (reg.minutosTrabajadosTotales) {
                minutosTotalesSemana += reg.minutosTrabajadosTotales;
            }
        });

        const tarjetaSemana = document.createElement("div");
        tarjetaSemana.className = "tarjeta-semana";

        const cabeceraSemana = document.createElement("div");
        cabeceraSemana.className = "cabecera-tarjeta-semana";
        cabeceraSemana.innerHTML = `
            <span class="titulo-semana">${semana.etiqueta}</span>
            <span class="horas-totales-semana">Total: ${formatearMinutosAHorasYMinutos(minutosTotalesSemana)}</span>
        `;
        tarjetaSemana.appendChild(cabeceraSemana);

        const listaDias = document.createElement("div");
        listaDias.className = "lista-dias-semana";

        semana.registros.forEach(function(reg) {
            const filaDia = document.createElement("div");
            filaDia.className = "fila-registro-dia";

            const textoSalidaMostrar = reg.horaSalidaConfirmada || `${reg.horaSalidaEstimada} (estimada)`;
            const claseInsignia = reg.estado === "completado" ? "insignia-completado" : "insignia-progreso";
            const textoInsignia = reg.estado === "completado" ? "Completado" : "En progreso";
            const textoTotalHorasDia = reg.minutosTrabajadosTotales ? formatearMinutosAHorasYMinutos(reg.minutosTrabajadosTotales) : "--";

            filaDia.innerHTML = `
                <div class="info-dia-principal">
                    <span class="nombre-dia">${reg.fechaDiaTexto}</span>
                    <span class="fecha-dia">${reg.fechaCompletaTexto}</span>
                </div>
                <div class="detalles-horarios-dia">
                    <div class="bloque-horario">
                        <span class="etiqueta-pequena">Entrada</span>
                        <span class="valor-horario">${reg.horaEntrada}</span>
                    </div>
                    <div class="bloque-horario">
                        <span class="etiqueta-pequena">Salida</span>
                        <span class="valor-horario">${textoSalidaMostrar}</span>
                    </div>
                    <div class="bloque-horario">
                        <span class="etiqueta-pequena">Horas</span>
                        <span class="valor-horario">${textoTotalHorasDia}</span>
                    </div>
                </div>
                <div class="columna-acciones-dia">
                    <span class="insignia-estado ${claseInsignia}">${textoInsignia}</span>
                    <button type="button" class="boton-accion-secundario boton-editar-dia" data-id="${reg.id}">Editar salida</button>
                </div>
            `;

            const botonEditar = filaDia.querySelector(".boton-editar-dia");
            botonEditar.addEventListener("click", function() {
                abrirModalEdicionParaRegistro(reg.id);
            });

            listaDias.appendChild(filaDia);
        });

        tarjetaSemana.appendChild(listaDias);
        contenedorSemanasHistorial.appendChild(tarjetaSemana);
    });
}

function comprobarEstadoCapturaHoy() {
    const fechaIsoHoy = obtenerFechaHoyCadenaIso();
    const historial = obtenerHistorialDesdeAlmacenamiento();
    const registroHoy = historial.find(function(item) {
        return item.fechaIso === fechaIsoHoy;
    });

    if (registroHoy) {
        textoHoraEntradaCapturada.textContent = registroHoy.horaEntrada;
        indicadorEntradaCapturada.classList.remove("oculto");
    } else {
        indicadorEntradaCapturada.classList.add("oculto");
    }
}

function activarAlertaFinJornada() {
    alertaMostrada = true;
    modalHoraSalidaTexto.textContent = formatearHoraDoceHoras(fechaFinJornada);
    modalAlertaFin.classList.remove("oculto");

    if (window.focus) {
        window.focus();
    }
}

function cerrarModalAlerta() {
    modalAlertaFin.classList.add("oculto");
}

function posponerCincoMinutos() {
    cerrarModalAlerta();
    alertaMostrada = false;
    const CINCO_MINUTOS_EN_MILISEGUNDOS = 5 * 60 * 1000;
    fechaFinJornada = new Date(Date.now() + CINCO_MINUTOS_EN_MILISEGUNDOS);

    const horasTotales = Math.floor((fechaFinJornada.getTime() - fechaInicioJornada.getTime()) / (60 * 1000 * 60));
    const minutosTotales = Math.floor(((fechaFinJornada.getTime() - fechaInicioJornada.getTime()) / (60 * 1000)) % 60);
    indicadorDuracionTotal.textContent = `${horasTotales}h ${minutosTotales}m (pospuesto)`;

    actualizarMetricas();
}

function restablecerValoresPorDefecto() {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO_LOCAL);
    seleccionarValorEnColumna(columnaMinutosExtras, "0", true);
    establecerValoresConHoraActual(true);
    cerrarModalAlerta();
}

botonHoraActual.addEventListener("click", function() {
    establecerValoresConHoraActual(true);
});

botonCapturarEntrada.addEventListener("click", function() {
    capturarHoraDeEntradaActual();
});

botonConfirmarSalidaAhora.addEventListener("click", function() {
    confirmarSalidaRegistrada();
});

botonReiniciar.addEventListener("click", function() {
    restablecerValoresPorDefecto();
});

if (entradaTextoHora) {
    entradaTextoHora.addEventListener("change", sincronizarRuedasDesdeTexto);
}

if (entradaTextoMinuto) {
    entradaTextoMinuto.addEventListener("change", sincronizarRuedasDesdeTexto);
}

if (entradaTextoPeriodo) {
    entradaTextoPeriodo.addEventListener("change", sincronizarRuedasDesdeTexto);
}

if (entradaTextoMinutosExtras) {
    entradaTextoMinutosExtras.addEventListener("change", sincronizarRuedasDesdeTexto);
    entradaTextoMinutosExtras.addEventListener("input", function() {
        let valor = parseInt(entradaTextoMinutosExtras.value, 10);
        if (!isNaN(valor) && valor >= 0) {
            if (valor <= 120) {
                seleccionarValorEnColumna(columnaMinutosExtras, String(valor), true);
            }
            recalcularYActualizarSeguimiento();
        }
    });
}

botonAceptarModal.addEventListener("click", function() {
    confirmarSalidaRegistrada(formatearHoraDoceHoras(fechaFinJornada));
    cerrarModalAlerta();
});

if (botonCerrarCruzModal) {
    botonCerrarCruzModal.addEventListener("click", function() {
        cerrarModalAlerta();
    });
}

botonPosponerCincoMinutos.addEventListener("click", function() {
    posponerCincoMinutos();
});

botonCerrarCruzEdicion.addEventListener("click", function() {
    cerrarModalEdicion();
});

botonCancelarEdicion.addEventListener("click", function() {
    cerrarModalEdicion();
});

botonGuardarEdicionSalida.addEventListener("click", function() {
    guardarSalidaModificada();
});

modalAlertaFin.addEventListener("click", function(evento) {
    if (evento.target === modalAlertaFin) {
        cerrarModalAlerta();
    }
});

modalEditarSalida.addEventListener("click", function(evento) {
    if (evento.target === modalEditarSalida) {
        cerrarModalEdicion();
    }
});

document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") {
        if (!modalAlertaFin.classList.contains("oculto")) {
            cerrarModalAlerta();
        }
        if (!modalEditarSalida.classList.contains("oculto")) {
            cerrarModalEdicion();
        }
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("sw.js").catch(function() {});
    });
}

document.addEventListener("DOMContentLoaded", function() {
    inicializarSelectoresDesplazamiento();
    cargarEstadoDesdeAlmacenamiento();
    renderizarHistorialSemanas();
    comprobarEstadoCapturaHoy();
});
