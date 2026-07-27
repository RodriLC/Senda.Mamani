
// Capturador de errores global para depuración
window.onerror = function (msg, url, lineNo, columnNo, error) {
    var message = [
        'Mensaje: ' + msg,
        'Línea: ' + lineNo,
        'Columna: ' + columnNo,
        'Detalle: ' + (error ? error.stack : 'No disponible')
    ].join('\n');
    alert("¡SE DETECTÓ UN ERROR EN EL JUEGO!\n\n" + message);
    return false;
};

// ZzFX - Zuper Zmall Zeound Zynth - Micro Edition
// MIT License - Copyright 2019 Frank Force
let zzfxX, zzfxV = .3;
const zzfx = (...z) => {
    try {
        if (!zzfxX) zzfxX = new (window.AudioContext || window.webkitAudioContext)();
        if (zzfxX.state === 'suspended') zzfxX.resume();
        let [volume=1, randomness=.05, frequency=220, attack=0, sustain=0,
            release=.1, shape=0, shapeCurve=1, slide=0, deltaSlide=0,
            pitchJump=0, pitchJumpTime=0, repeatTime=0, noise=0, modulation=0,
            bitCrush=0, delay=0, sustainVolume=1, decay=0, tremolo=0] = z;
        let sampleRate = zzfxX.sampleRate;
        let sign = v => v > 0 ? 1 : -1;
        let startSlide = slide *= 500 * 2 * Math.PI / sampleRate / sampleRate;
        let startFrequency = frequency *= 2 * Math.PI / sampleRate;
        let b = [], t = 0, tm = 0, i = 0, j = 1, r = 0, c = 0, s = 0;
        let length = sampleRate * (attack + decay + sustain + release + delay);
        length = Math.max(1, length);
        for (i = 0; i < length; b[i++] = s) {
            if (++c > bitCrush * 100) {
                c = 0;
                s = i < attack * sampleRate ? i / (attack * sampleRate) :
                    i < (attack + decay) * sampleRate ? 1 - ((i - attack * sampleRate) / (decay * sampleRate)) * (1 - sustainVolume) :
                    i < (attack + decay + sustain) * sampleRate ? sustainVolume :
                    i < length - delay * sampleRate ? (length - i - delay * sampleRate) / (release * sampleRate) * sustainVolume : 0;
                s *= volume * zzfxV * (1 - tremolo + tremolo * Math.sin(2 * Math.PI * i / sampleRate * 10));
                s *= sign(Math.sin(t)) * (1 - shape) + Math.sin(t) * shape;
                frequency += slide += deltaSlide * 500 * 2 * Math.PI / sampleRate / sampleRate / sampleRate;
                if (j && ++j > pitchJumpTime * sampleRate) {
                    frequency += pitchJump * 500 * 2 * Math.PI / sampleRate / sampleRate;
                    j = 0;
                }
                if (repeatTime && ++r > repeatTime * sampleRate) {
                    frequency = startFrequency;
                    slide = startSlide;
                    r = 1;
                    tm = 0;
                }
                t += frequency + frequency * modulation * Math.sin(tm++);
                t += randomness * 2 * Math.PI * Math.random();
            }
        }
        let buffer = zzfxX.createBuffer(1, length, sampleRate);
        buffer.getChannelData(0).set(b);
        let source = zzfxX.createBufferSource();
        source.buffer = buffer;
        source.connect(zzfxX.destination);
        source.start();
        return source;
    } catch (e) {
        console.error("ZzFX Error:", e);
        return null;
    }
};

/* ==========================================================================
   SISTEMA DE AUDIO — ZzFX Generativo (0 bytes en assets)
   ========================================================================== */
const sistemaAudio = {
    volumenMusica: 0.35,
    volumenSFX: 0.55,
    silenciado: false, // Activado por defecto para escuchar la nueva música
    _bgmActual: null,
    _estadoMusicaActual: null,
    audioContextInit: false,

    // Mapeo de BGM
    _bgmTracks: {
        MENU: 'audio/bgm_menu.mp3',
        MAPA: 'audio/bgm_mapa.mp3',
        COMBATE: 'audio/bgm_combate.mp3',
        TIENDA: 'audio/bgm_tienda.mp3',
        CAMPAMENTO: 'audio/bgm_campamento.mp3',
        EVENTO: 'audio/bgm_evento.mp3',
        CUTSCENE: 'audio/bgm_cutscene.mp3',
        TUTORIAL: 'audio/bgm_tutorial.mp3',
        TUTORIAL_COMPLETO: 'audio/bgm_mapa.mp3',
        RECOMPENSA: 'audio/bgm_recompensa.mp3',
        VICTORIA: 'audio/bgm_victoria.mp3',
        GAMEOVER: 'audio/bgm_gameover.mp3'
    },

    // Mapeo de SFX (Array de parametros para ZzFX)
    _sfxTracks: {
        hover: [,,1675,,.06,.02,1,1.14,,,837,.06],
        click: [,,700,,.02,.02,1,1.1,,,200,.04],
        confirmar: [,,400,.05,.14,.24,1,1.5,,,300,.06],
        confirmarEpico: [,,600,.1,.3,.5,1,2,,,400,.1],
        retroceder: [,,200,,.05,.1,1,1.5,,,100,.05],
        ataque: [,,200,.02,.05,.1,2,1.5,,,,.1],
        escudo: [,,300,.01,.1,.1,1,.5,1,,150,.05],
        curacion: [,,400,.1,.3,.3,1,1.5,1,1,,.1],
        danoJugador: [,,150,.05,.1,.2,2,1.5,,,,.1],
        danoEnemigo: [,,100,.02,.05,.1,2,1.5,,,,.1],
        finTurno: [,,300,.05,.1,.1,1,1.5,,,200,.05],
        huir: [,,250,.1,.2,.3,1,.5,-1,,100,.1],
        enemigoAtaca: [,,150,.02,.05,.1,2,1.5,,,,.1],
        nodoSeleccionar: [,,1200,,.04,.02,1,1.1,,,500,.05],
        entrarCombate: [,,100,.1,.2,.4,3,2,,,,.1],
        entrarTienda: [,,600,.1,.2,.3,1,1.5,,,400,.1],
        entrarEvento: [,,500,.1,.2,.3,1,1.5,,,300,.1],
        entrarCampamento: [,,300,.1,.2,.3,1,1.5,,,200,.1],
        compra: [,,800,.05,.1,.2,1,1.5,,,500,.05],
        error: [,,150,,.05,.1,2,1.5,,,,.05],
        descanso: [,,300,.1,.3,.5,1,1.5,,,200,.1],
        mejora: [,,700,.1,.2,.4,1,1.5,1,1,,.1],
        eleccion: [,,500,,.05,.1,1,1.5,,,300,.05],
        eventoBien: [,,600,.1,.2,.3,1,1.5,1,1,,.1],
        eventoMal: [,,150,.1,.2,.3,2,1.5,,,,.1],
        recompensa: [,,800,.1,.3,.5,1,1.5,1,1,,.1]
    },

    inicializar() {
        if (!this.audioContextInit) {
            // Inicializar silenciosamente para evitar lag después
            const oldV = zzfxV;
            zzfxV = 0;
            zzfx();
            zzfxV = oldV;
            this.audioContextInit = true;
        }
    },

    toggleMute() {
        this.silenciado = !this.silenciado;
        if (this._bgmActual) {
            this._bgmActual.volume = this.silenciado ? 0 : this.volumenMusica;
        }
    },

    reproducirMusica(estado) {
        if (this._estadoMusicaActual === estado) return;
        this._estadoMusicaActual = estado;

        if (this._bgmActual) {
            this._bgmActual.pause();
            this._bgmActual.currentTime = 0;
            this._bgmActual = null;
        }

        const trackUrl = this._bgmTracks[estado];
        if (trackUrl) {
            this._bgmActual = new Audio(trackUrl);
            this._bgmActual.loop = true;
            this._bgmActual.volume = this.silenciado ? 0 : this.volumenMusica;
            this._bgmActual.play().catch(e => {
                console.warn("Navegador bloqueó autoplay de BGM:", e);
            });
        }
    },

    sfx(nombre) {
        if (this.silenciado) return;
        const params = this._sfxTracks[nombre];
        if (params) {
            zzfxV = this.volumenSFX;
            zzfx(...params);
        }
    }
};





const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Polyfill robusto e incondicional para ctx.roundRect
if (typeof CanvasRenderingContext2D !== 'undefined') {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        let r = 0;
        if (typeof radii === 'number') {
            r = radii;
        } else if (Array.isArray(radii) && radii.length > 0) {
            r = radii[0];
        }
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}
const menuUi = document.getElementById('menu-ui');

// Máquina de estados para controlar qué pantalla dibujar
const ESTADOS = {
    MENU: 'MENU',
    CUTSCENE: 'CUTSCENE',
    TUTORIAL: 'TUTORIAL',
    TUTORIAL_COMPLETO: 'TUTORIAL_COMPLETO',
    MAPA: 'MAPA',
    COMBATE: 'COMBATE',
    VICTORIA: 'VICTORIA',
    TIENDA: 'TIENDA',
    EVENTO: 'EVENTO',
    CAMPAMENTO: 'CAMPAMENTO',
    RECOMPENSA: 'RECOMPENSA',
    GAMEOVER: 'GAMEOVER',
    VICTORIA_TOTAL: 'VICTORIA_TOTAL'
};

// ==========================================
// CONFIGURACIÓN CENTRALIZADA DE COORDENADAS DE UI (ESCALABLE)
// ==========================================
const UI_CONFIG = {
    // Cartas en mano (combate y tutorial) - Layout plano horizontal centrado
    mano: {
        xInicial: 79,   // centrado: (480 - 5*54 - 4*5) / 2 = 79
        yBase: 200,     // posición Y base (parte inferior, quieta)
        ancho: 54,      // ancho de cada carta
        alto: 62,       // alto de cada carta
        espacio: 5      // espacio entre cartas
    },
    // Pantalla de Combate
    combate: {
        huir: { x: 15, y: 15, w: 55, h: 20 },
        terminarTurno: { x: 405, y: 210, w: 60, h: 22 }
    },
    // Tienda del Callawaya
    tienda: {
        volverMapa: { x: 388, y: 4, w: 80, h: 16 }, // Esquina superior derecha
        tabs: [
            { id: 'objetos', texto: 'OBJETOS', x: 8, y: 22, w: 108, h: 18 },
            { id: 'pasivas', texto: 'PASIVAS', x: 124, y: 22, w: 108, h: 18 },
            { id: 'mazo', texto: 'MAZO', x: 240, y: 22, w: 108, h: 18 }
        ],
        itemAncho: 100,
        itemAlto: 148,
        pasivaAncho: 210,
        pasivaAlto: 74,
        cartaAncho: 100,
        cartaAlto: 148,
        panelDetalle: { x: 20, y: 200, w: 440, h: 35 },
        btnComprar: { x: 302, y: 204, w: 158, h: 24 }
    },
    // Pantalla de Recompensa de Combate
    recompensa: {
        cartaAncho: 110,
        cartaAlto: 130,
        cartaY: 80,
        carta1X: 30,
        carta2X: 185,
        carta3X: 340,
        omitir: { x: 160, y: 235, w: 160, h: 25 }
    },
    // Eventos del Yatiri
    evento: {
        opcionAncho: 186,
        opcionAlto: 34
    },
    // Campamento (La Pascana)
    campamento: {
        opcionAncho: 220,
        opcionAlto: 30,
        opcion1: { x: 30, y: 100 },
        opcion2: { x: 30, y: 145 },
        volverMapa: { x: 30, y: 200, w: 220, h: 30 }
    },
    // Pantalla de Game Over
    gameOver: {
        reintentar: { x: 175, y: 180, w: 130, h: 30 }
    }
};

// ── Variables de estado (ahora solo como fallback de referencia) ──
let toastActual = null;       // Mantenido para compatibilidad
let confirmacionActual = null; // Mantenido para compatibilidad

/* ==========================================================================
   SISTEMA DE TOAST HTML — Notificaciones elegantes sobre el canvas
   ========================================================================== */
const _toastContainer = document.getElementById('toast-container');

function mostrarToast(texto, subtexto, tipo) {
    // tipo: 'info' | 'compra' | 'error' | 'especial' | 'eventoMal' | 'eventoBien'
    if (!_toastContainer) return;

    const tipoValido = ['info','compra','error','especial','eventoMal','eventoBien'].includes(tipo)
        ? tipo : 'info';

    const div = document.createElement('div');
    div.className = 'toast-notif toast-' + tipoValido;
    div.innerHTML = '<span class="toast-titulo">' + (texto  || '') + '</span>'
                  + (subtexto ? '<span class="toast-sub">' + subtexto + '</span>' : '');

    _toastContainer.appendChild(div);

    // Auto-eliminar con animación de salida
    const duracion = 2800;
    const tiempoSalida = duracion - 380;
    setTimeout(() => { div.classList.add('saliendo'); }, tiempoSalida);
    setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, duracion);
}

// ── Botón de Mute ─────────────────────────────────────────────────────────
const MUTE_BTN = { x: 460, y: 255, w: 18, h: 12 };

function dibujarBotonMute() {
    if (estadoActual === ESTADOS.MENU) return; // No lo mostramos en el menú HTML
    const b = MUTE_BTN;
    const hover = esCursorSobreBoton(b.x, b.y, b.w, b.h);

    ctx.fillStyle = hover ? "rgba(50,50,60,0.95)" : "rgba(18,18,24,0.85)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 3);
    else ctx.rect(b.x, b.y, b.w, b.h);
    ctx.fill();

    ctx.strokeStyle = hover ? "#ffcc00" : "#555";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = sistemaAudio.silenciado ? "#e74c3c" : "#2ecc71";
    ctx.font = "7px Arial";
    ctx.textAlign = "center";
    ctx.fillText(sistemaAudio.silenciado ? "🔇" : "🔊", b.x + b.w / 2, b.y + b.h - 2);
    ctx.textAlign = "left";

    if (hover) canvas.style.cursor = "pointer";
}

// dibujarToast() es un stub vacío — las notificaciones ahora usan HTML
function dibujarToast() { /* Las toasts son HTML; nada que dibujar en canvas */ }


/* ==========================================================================
   SISTEMA DE CONFIRMACIÓN HTML — Reemplaza confirm() del navegador
   ========================================================================== */
const _confirmUI = document.getElementById('confirmacion-ui');

function mostrarConfirmacion(titulo, subtexto, cbAceptar, cbCancelar) {
    if (!_confirmUI) return;

    // Texto
    document.getElementById('confirm-titulo-text').textContent = titulo  || '';
    document.getElementById('confirm-sub-text').textContent    = subtexto || '';

    // Asignar callbacks directamente con onclick (se sobreescribe cada vez, sin bug de referencias)
    document.getElementById('confirm-btn-aceptar').onclick = () => {
        _confirmUI.classList.remove('visible');
        confirmacionActual = null;
        sistemaAudio.sfx('confirmar');
        if (cbAceptar) cbAceptar();
    };
    document.getElementById('confirm-btn-cancelar').onclick = () => {
        _confirmUI.classList.remove('visible');
        confirmacionActual = null;
        sistemaAudio.sfx('retroceder');
        if (cbCancelar) cbCancelar();
    };

    confirmacionActual = { titulo, subtexto, cbAceptar, cbCancelar }; // compatibilidad
    _confirmUI.classList.add('visible');
}

// ==========================================
// SISTEMA DE DIÁLOGOS RPG (Visual Novel)
// ==========================================
function dibujarDialogoRPG(retratoBase64, nombre, texto, parpadeo, posicionTop = false) {
    const margin = 10;
    const boxHeight = 70;
    // Si está arriba, bajamos la caja a Y=30 para que la etiqueta del nombre (Y-14) no se corte.
    const boxY = posicionTop ? 30 : 270 - boxHeight - margin;


    // Fondo de la caja de diálogo
    ctx.fillStyle = "rgba(20, 20, 30, 0.85)";
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(margin + 120, boxY, 480 - margin * 2 - 120, boxHeight, 8);
    } else {
        ctx.fillRect(margin + 120, boxY, 480 - margin * 2 - 120, boxHeight);
    }
    ctx.fill();

    // Borde
    ctx.strokeStyle = "#f39c12";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Etiqueta del nombre
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(margin + 120, boxY - 14, nombre.length * 6 + 10, 16);
    ctx.fillStyle = "#ffffff";
    ctx.font = "6px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText(nombre, margin + 125, boxY - 4);

    // Texto del diálogo (dividido en líneas)
    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    const palabras = texto.split(" ");
    let lineas = [];
    let lineaActual = "";

    for (let i = 0; i < palabras.length; i++) {
        const probLinea = lineaActual + palabras[i] + " ";
        const metrics = ctx.measureText(probLinea);
        if (metrics.width > (480 - margin * 2 - 140)) {
            lineas.push(lineaActual);
            lineaActual = palabras[i] + " ";
        } else {
            lineaActual = probLinea;
        }
    }
    lineas.push(lineaActual);

    lineas.forEach((linea, index) => {
        ctx.fillText(linea, margin + 130, boxY + 20 + (index * 12));
    });

    // Flecha parpadeante (haz clic para continuar)
    if (parpadeo && Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillStyle = "#f1c40f";
        ctx.fillText("▼", 480 - margin - 20, boxY + boxHeight - 8);
    }

    // Dibujar el retrato (Yatiri) en un círculo
    const imgRetrato = imagenesCargadas.personajes && imagenesCargadas.personajes.yatiriPortrait;
    if (imgRetrato && imgRetrato.complete && imgRetrato.naturalWidth > 0) {
        const pWidth = 100;
        const pHeight = 100;
        // Si posicionTop es true, alineamos la caja un poco más abajo.
        const pY = posicionTop ? 15 : 270 - pHeight;
        const pX = 10; // Lo movemos un poco a la derecha para que el círculo se vea completo

        const centerX = pX + pWidth / 2;
        const centerY = pY + pHeight / 2;
        const radius = 46; // Radio del círculo

        // Borde y fondo oscuro del círculo (por si la imagen es transparente)
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#14141e";
        ctx.fill();

        // Recorte (clip) para la imagen
        ctx.clip();
        ctx.drawImage(imgRetrato, pX, pY, pWidth, pHeight);
        ctx.restore();

        // Dibujar el borde del círculo
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#f39c12";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}
// dibujarConfirmacion() es un stub vacío — el modal ahora usa HTML
// La variable confirmacionActual aún se usa en el manejador de clics del canvas
// para bloquear interacciones mientras el modal HTML está abierto.
function dibujarConfirmacion() { /* El modal de confirmación es HTML; nada que dibujar en canvas */ }


/* ==========================================================================
   5.1. VARIABLES DE CUTSCENE (Intro Narrativa)
   ========================================================================== */
// ── Cinemática de Transición Acto 1 → 2 (Valles y Minas de Potosí) ──
const imgCineActo2_1Base64 = "img/cine_acto2_1.webp";
const imgCineActo2_2Base64 = "img/cine_acto2_2.webp";
const imgCineActo2_3Base64 = "img/cine_acto2_3.webp";

let CUTSCENE_SLIDES = [
    {
        titulo: "El Mundo Tiembla",
        texto: "El mundo andino tiembla. Las criaturas de la Pachamama han enloquecido, corrompidas por fuerzas oscuras que amenazan los tres biomas sagrados...",
        colorFondo1: "#0c2317",
        colorFondo2: "#1a4a2e",
        acento: "#2ecc71",
        imgKey: "cine_intro_1"
    },
    {
        titulo: "El Llamado",
        texto: "Tú eres MAMANI, un joven guerrero de los Andes. La Senda te llama. Solo tú puedes atravesar la Amazonia, los Socavones de Potosi y el Salar Cosmico.",
        colorFondo1: "#2c1c00",
        colorFondo2: "#5c3d1e",
        acento: "#f39c12",
        imgKey: "cine_intro_2"
    },
    {
        titulo: "Tu Misión",
        texto: "Usa tus cartas de combate, gestiona tu Energia y derrota a los tres Guardianes Corrompidos. La Pachamama espera a su heroe.",
        colorFondo1: "#0a0a2a",
        colorFondo2: "#1a1a5c",
        acento: "#9b59b6",
        imgKey: "cine_intro_3"
    }
];

let cutsceneSlideActual = 0;        // Slide actual (0-2)
let cutsceneCharIndex = 0;          // Cuántos caracteres del texto se han revelado
let cutsceneTimer = 0;              // Timestamp para controlar velocidad del typewriter
let cutsceneTitiloVisible = false;  // Si el título ya fue revelado
let cutsceneTituloIndex = 0;        // Caracteres del título revelados
const TYPEWRITER_VELOCIDAD = 30;    // ms por caracter
let cutsceneUltimoTick = 0;

// ── Catálogo de cinemáticas de transición entre Actos ────────────────────────
const CUTSCENE_SLIDES_ACTO2 = [
    {
        titulo: "El Adiós a la Selva",
        texto: "Con el Jichi en paz, las aguas vuelven a su cauce. Una vibración helada desciende de las cumbres... El camino de Mamani ahora asciende hacia el cielo.",
        colorFondo1: "#1a3020",
        colorFondo2: "#2a4a1a",
        acento: "#e67e22",
        imgKey: "cine_acto2_1"
    },
    {
        titulo: "El Gigante de Plata",
        texto: "Ante él se alza el Cerro Rico de Potosí, una colosal montaña que ha devorado miles de almas. El aire es escaso y la tierra sangra plata.",
        colorFondo1: "#1a0a00",
        colorFondo2: "#3d1a00",
        acento: "#c0392b",
        imgKey: "cine_acto2_2"
    },
    {
        titulo: "La Sombra del Socavón",
        texto: "En la oscuridad del socavón, el metal brilla con codicia maldita. El Tío de la Mina vigila cada paso, esperando su ofrenda... o su próximo sacrificio.",
        colorFondo1: "#0a0a0a",
        colorFondo2: "#1a0505",
        acento: "#8e44ad",
        imgKey: "cine_acto2_3"
    }
];

// ── Cinemática de Transición Acto 2 → 3 (Altiplano y Salar de Uyuni) ───────────
const CUTSCENE_SLIDES_ACTO3 = [
    {
        titulo: "Plata y Sangre",
        texto: "La mina ha cobrado su tributo, pero Mamani ha sobrevivido. Deja atrás el polvo rojo de Potosí y sus lamentos, buscando purificar su espíritu en las alturas infinitas del Altiplano.",
        colorFondo1: "#1a0005",
        colorFondo2: "#3d0010",
        acento: "#8e44ad",
        imgKey: "cine_acto3_1"
    },
    {
        titulo: "El Cielo en la Tierra",
        texto: "Un horizonte blanco y cegador le da la bienvenida. El Salar de Uyuni es un inmenso espejo donde la tierra y los cielos se unen. Aquí, en el techo del mundo, aguarda su destino final.",
        colorFondo1: "#0a1a2a",
        colorFondo2: "#152a3a",
        acento: "#f1c40f",
        imgKey: "cine_acto3_2"
    }
];

// Callback que se ejecuta al terminar una cinemática de transición (null = flujo normal)
let cutsceneOnEnd = null;

/* ==========================================================================
   5.2. VARIABLES DE TUTORIAL
   ========================================================================== */
/*
 * Tipos de paso:
 *  INFO   → Panel informativo central, auto-avanza (toca para saltar)
 *  ACCION → El jugador DEBE hacer algo (spotlight activo, input restringido)
 *  MISION → Pantalla dramática de misión (auto-avanza)
 *  LIBRE  → Combate sin restricciones hasta matar al enemigo
 */
const TUTORIAL_PASOS = [
    // ── Paso 0: Bienvenida ──────────────────────────────────────────────
    {
        id: 0, tipo: "INFO", duracion: 4000,
        color: "#2ecc71",
        titulo: "¡BIENVENIDO, MAMANI!",
        lineas: [
            "Este tutorial te ensena a combatir.",
            "Sigue las instrucciones paso a paso.",
            "¡Toca para continuar cuando quieras!"
        ],
        spotlight: null, accion: "AUTO"
    },
    // ── Paso 1: Explicar Energía ────────────────────────────────────────
    {
        id: 1, tipo: "INFO", duracion: 4500,
        color: "#f39c12",
        titulo: "TU ENERGIA (AP)",
        lineas: [
            "Las gemas doradas son tu ENERGIA.",
            "Tienes 3 gemas al inicio de cada turno.",
            "Cada carta CONSUME gemas para usarse."
        ],
        spotlight: { x: 330, y: 6, w: 95, h: 28 },
        accion: "AUTO"
    },
    // ── Paso 2: Jugar carta ROJA ────────────────────────────────────────
    {
        id: 2, tipo: "ACCION",
        color: "#e74c3c",
        titulo: "CARTA DE ATAQUE",
        lineas: [
            "Toca 1x la carta ROJA para seleccionarla.",
            "Tocala 2da vez para ATACAR al enemigo.",
            "Cuesta 1 AP (gema de energia)."
        ],
        spotlight: { x: 75, y: 196, w: 62, h: 70 },
        accion: "JUGAR_OFENSIVA"
    },
    // ── Paso 3: Explicar resultado del ataque ───────────────────────────
    {
        id: 3, tipo: "INFO", duracion: 4000,
        color: "#e74c3c",
        titulo: "¡ATACASTE!",
        lineas: [
            "¡El Machete Zafrero golpeo al Quirquincho!",
            "Tu AP bajo de 3 a 2 gemas.",
            "Aun tienes 2 AP para mas cartas."
        ],
        spotlight: null, accion: "AUTO"
    },
    // ── Paso 4: Jugar carta AZUL ────────────────────────────────────────
    {
        id: 4, tipo: "ACCION",
        color: "#3498db",
        titulo: "CARTA DE DEFENSA",
        lineas: [
            "Toca 1x la carta AZUL para seleccionarla.",
            "Tocala 2da vez para ACTIVAR el escudo.",
            "El bloqueo absorbe dano enemigo."
        ],
        spotlight: { x: 134, y: 196, w: 62, h: 70 },
        accion: "JUGAR_DEFENSIVA"
    },
    // ── Paso 5: Explicar resultado de defensa ───────────────────────────
    {
        id: 5, tipo: "INFO", duracion: 4000,
        color: "#3498db",
        titulo: "¡ESCUDO ACTIVADO!",
        lineas: [
            "El Bloqueo azul aparece en tu barra de HP.",
            "Absorbe el dano del proximo ataque.",
            "Se pierde al inicio de tu siguiente turno."
        ],
        spotlight: null, accion: "AUTO"
    },
    // ── Paso 6: Terminar Turno ──────────────────────────────────────────
    {
        id: 6, tipo: "ACCION",
        color: "#e67e22",
        titulo: "TERMINAR TURNO",
        lineas: [
            "Presiona el boton TERMINAR TURNO.",
            "El enemigo actuara, pero tu Bloqueo",
            "lo absorbera. ¡Hazlo ahora!"
        ],
        spotlight: { x: 399, y: 204, w: 72, h: 34 },
        accion: "TERMINAR_TURNO"
    },
    // ── Paso 7: El enemigo atacó, AP restaurado ─────────────────────────
    {
        id: 7, tipo: "INFO", duracion: 4000,
        color: "#9b59b6",
        titulo: "TURNO DEL ENEMIGO",
        lineas: [
            "¡El Quirquincho ataco! Tu Bloqueo absorbio",
            "el golpe. Ahora es tu turno de nuevo.",
            "Tu AP se restauro a 3 gemas."
        ],
        spotlight: null, accion: "AUTO"
    },
    // ── Paso 8: MISIÓN ──────────────────────────────────────────────────
    {
        id: 8, tipo: "MISION", duracion: 4500,
        color: "#e74c3c",
        titulo: "MISION",
        lineas: [
            "¡DERROTA AL QUIRQUINCHO!",
            "Usa tus cartas para vaciar su HP.",
            "Recuerda terminar el turno si te quedas",
            "sin AP. ¡El AP se restaura cada turno!"
        ],
        spotlight: null, accion: "AUTO"
    },
    // ── Paso 9: LIBRE — matar al enemigo ───────────────────────────────
    {
        id: 9, tipo: "LIBRE",
        color: "#ffcc00",
        titulo: "¡COMBATE LIBRE!",
        lineas: [
            "¡Usa tus cartas y derrota al Quirquincho!",
            "Termina el turno si se te acaba el AP.",
            "¡La Pachamama te observa!"
        ],
        spotlight: null, accion: "DERROTAR_ENEMIGO"
    }
];

let tutorialPasoActual = 0;
let tutorialPasoMapaActual = 0;
let tutorialAutoTimer = null;
let tutorialFlechaAnim = 0;
let tutorialCompletado = false; // Solo sesión: se resetea al recargar la página
let enModoTutorial = false;
let tutorialAutoStart = 0;       // Timestamp de inicio del paso AUTO actual

let estadoActual = ESTADOS.MENU; // El juego inicia siempre en el menú principal
let tiempoMisionCombate = 0; // Temporizador para el banner de inicio de combate
let modoLeyenda = false;
let viajesCompletados = parseInt(localStorage.getItem('sendaMamani_viajesCompletados') || '0');

// --- SISTEMA DE LOGROS GLOBAL ---
let stats_muertes = parseInt(localStorage.getItem('sendaMamani_muertes')) || 0;
let stats_monstruos = parseInt(localStorage.getItem('sendaMamani_monstruos')) || 0;
let coleccion_reliquias = [];
try { coleccion_reliquias = JSON.parse(localStorage.getItem('sendaMamani_coleccion_reliquias') || '[]'); } catch(e){}
let coleccion_cartas = [];
try { coleccion_cartas = JSON.parse(localStorage.getItem('sendaMamani_coleccion_cartas') || '[]'); } catch(e){}

function guardarLogro(tipo, valor) {
    if (tipo === 'muerte') {
        stats_muertes++;
        localStorage.setItem('sendaMamani_muertes', stats_muertes);
    } else if (tipo === 'monstruo') {
        stats_monstruos++;
        localStorage.setItem('sendaMamani_monstruos', stats_monstruos);
    } else if (tipo === 'reliquia') {
        if (!coleccion_reliquias.includes(valor)) {
            coleccion_reliquias.push(valor);
            localStorage.setItem('sendaMamani_coleccion_reliquias', JSON.stringify(coleccion_reliquias));
        }
    } else if (tipo === 'carta') {
        if (!coleccion_cartas.includes(valor)) {
            coleccion_cartas.push(valor);
            localStorage.setItem('sendaMamani_coleccion_cartas', JSON.stringify(coleccion_cartas));
        }
    }
}

// Variables de la máquina de escribir de la victoria total
let textoVictoriaIndex = 0;
let ultimoTickTextoVictoria = 0;
const TEXTO_VICTORIA_NORMAL =
    "Tras una batalla legendaria en el Salar Cosmico, Mamani logra purificar la esencia de Huiracocha.\n\n" +
    "Los tres biomas sagrados vuelven a respirar paz y la Pachamama sonrie bendiciendo los Andes bolivianos.\n\n" +
    "¡Felicidades, Guerrero! Has completado La Senda de Mamani.\n\n" +
    "Intenta ahora la Senda de Leyenda (NG+) para un verdadero desafio.";

const TEXTO_VICTORIA_LEYENDA =
    "La Senda de Leyenda ha sido conquistada. Huiracocha cae liberado de su corrupcion cosmica definitiva.\n\n" +
    "Mamani ha demostrado el verdadero coraje andino, superando todos los limites inimaginables.\n\n" +
    "Pero... en los confines del horizonte, una nueva grieta temporal se abre en el Titicaca...\n\n" +
    "¿Que nuevas amenazas aguardan?\n\n" +
    "LA SENDA DE MAMANI 2 - CONTINUARA...";

function obtenerFactorDificultad() {
    if (modoLeyenda) return 1.30; // Modo Leyenda tiene dificultad fija (+30%)
    return 1.0 + (viajesCompletados * 0.10); // +10% por cada viaje normal completado
}
let cartaSeleccionadaIndex = null; // Índice de la carta actualmente SELECCIONADA (primer toque)

// Variables de control de La Pascana (Campamento)
let campamentoAccionRealizada = false;
let estrellasCampamento = [];

// Coordenadas lógicas del cursor del mouse y validador de hover
let mouseX = -100;
let mouseY = -100;

function esCursorSobreBoton(x, y, w, h) {
    return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}



/* ==========================================================================
5.5. CLASES Y MODELOS DE DATOS (MAMANI Y CARTAS)
========================================================================== */

// ==========================================
// POOL DE CARTAS DE RECOMPENSA
// Cartas temáticas andinas que el jugador puede ganar al vencer enemigos.
// Las elementales solo aparecen si actoActual >= 2.
// ==========================================
const POOL_CARTAS_RECOMPENSA = [
    // OFENSIVAS
    { nombre: "Chicotazo", costoAP: 1, daño: 70, tipo: "Ofensiva", categoria: "ofensiva", descripcion: "18 daño. Golpe veloz." },
    { nombre: "Patada Andina", costoAP: 2, daño: 100, tipo: "Ofensiva", categoria: "ofensiva", descripcion: "25 daño. Golpe brutal." },
    { nombre: "Fuerza del Cóndor", costoAP: 1, daño: 55, tipo: "Ofensiva", categoria: "ofensiva", efecto: "Sangrado", descripcion: "14 daño + Sangrado." }
    , { nombre: "Mal de Ojo", costoAP: 1, tipo: "Nerfeo", categoria: "nerfeo", efecto: "DEBILITAR", valor: 0, cooldown: 2, descripcion: "Debilita: -5 ATK enemigo." }
];

// Variables globales de control de recompensa
let oroRecompensa = 0;
let nombreEnemigoVencido = ""; // Guarda el nombre del enemigo derrotado para mostrarlo en pantalla
let opcionesCartasRecompensa = []; // Array de 3 cartas ofrecidas
let esRecompensaJefe = false; // Indica si las recompensas ofrecidas son de un Jefe
let reliquiaJefeObtenida = null; // Carta/reliquia que se da directamente al mazo al matar un jefe
let itemsTiendaActuales = { objetos: [], mazo: [] };
let costoReemplazar = 15;

// Reliquias de Jefe
const RELIQUIAS_JEFE = {
    acto1: { nombre: "Escama del Jichi", descripcion: "Te curas 8 de HP al ganar un combate.", spriteKey: "reliquiaJichi", tipo: "Sustento" },
    acto2: { nombre: "Cigarro Eterno", descripcion: "Ganas +5 Escudo al inicio de tu turno.", spriteKey: "reliquiaTio", tipo: "Defensiva" },
    acto3: { nombre: "Corona Cósmica", descripcion: "El trofeo definitivo de tu viaje.", spriteKey: "reliquiaHuiracocha", tipo: "Cósmica" }
};

// Cartas especiales de recompensa de Jefe
const CARTAS_RECOMPENSA_JEFE_ACTO1 = [
    { nombre: "Torrente Jichi", costoAP: 2, daño: 35, tipo: "Elemental (Agua)", categoria: "elemental", efecto: "EMPAPADO", valor: 0, cooldown: 2, descripcion: "35 daño. Aplica Empapado." },
    { nombre: "Escudo Titicaca", costoAP: 2, bloqueo: 32, tipo: "Defensiva", categoria: "defensiva", efecto: null, valor: 0, descripcion: "Gran Escudo sagrado. +32 Bloqueo." },
    { nombre: "Fuerza del Jichi", costoAP: 2, daño: 45, tipo: "Ofensiva", categoria: "ofensiva", efecto: "SANGRADO", valor: 5, descripcion: "45 daño. Aplica Sangrado." }
];

const CARTAS_RECOMPENSA_JEFE_ACTO2 = [
    { nombre: "Poder Pachamama", costoAP: 2, daño: 60, tipo: "Elemental (Tierra)", categoria: "elemental", efecto: null, valor: 0, descripcion: "Explosión ancestral. Hace 60 daño." },
    { nombre: "Chakana Eterna", costoAP: 2, bloqueo: 45, tipo: "Defensiva", categoria: "defensiva", efecto: null, valor: 0, descripcion: "Protección divina. +45 Bloqueo." },
    { nombre: "Coca Ancestral", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "AP_BONUS", valor: 2, cooldown: 2, descripcion: "Energía andina. +2 AP este turno." }
];

// Definición de las cartas base que tiene el jugador
const CARTAS_BASE = {
    ofensiva: {
        nombre: "Machete Zafrero",
        costoAP: 1,
        daño: 50, // Corregido el daño a 50 para alinearse con su descripción
        tipo: "Ofensiva",
        efecto: "Sangrado", // Hace 3 de daño por turno
        descripcion: "12 daño físico. Aplica Sangrado."
    },
    defensiva: {
        nombre: "Escudo de Cuero",
        costoAP: 1,
        bloqueo: 10,
        tipo: "Defensiva",
        descripcion: "+10 Bloqueo."
    },
    elemental: null,
    mejora: null,
    nerfeo: null
};

// Objeto global que representa a Mamani

let caracterIndex = 0;
let ultimoFrameTime = 0;
let partidaIniciada = false;

const jugador = {
    nombre: "Mamani",
    hpMax: 100,
    hp: 100, // Vida actual
    apMax: 3,
    ap: 3,   // Puntos de Acción para usar cartas en el turno
    inventario: [], // Items consumibles (Mochila general)
    slotsCombate: [null, null, null], // Items equipados para combate
    coleccionCartas: [{ ...CARTAS_BASE.ofensiva }, { ...CARTAS_BASE.defensiva }], // Todas las cartas poseidas
    oro: 100, // Monedas para comprar en la tienda del Callawaya (modificado para inicio rápido en Acto 2)
    escudo: 0, // Puntos de defensa acumulados en el turno

    // Sistema de mano fija de 5 categorías
    // Al inicio solo Ofensiva + Defensiva desbloqueadas; el resto se compra en la Tienda
    mano: {
        ofensiva: { ...CARTAS_BASE.ofensiva },    // ✓ Desbloqueada desde el inicio
        defensiva: { ...CARTAS_BASE.defensiva },   // ✓ Desbloqueada desde el inicio
        elemental: null,   // 🔒 Bloqueada - desbloquear en Tienda
        mejora: null,      // 🔒 Bloqueada - desbloquear en Tienda
        nerfeo: null       // 🔒 Bloqueada - desbloquear en Tienda
    },

    // Espacio para guardar las reliquias activas (ej. La Chakana Eterna)
    reliquias: [],

    // Sistema de buffs por niveles (Honkai-inspired)
    pasivas: { vitalidad: 0, energia: 0, defensa: 0, fuerza: 0 },
    danioBonus: 0,   // Daño fijo adicional (buff de Fuerza)
    bloqueoBase: 0,  // Escudo adicional al inicio de combate (buff de Defensa)

    // Método para reiniciar los puntos de acción al comenzar un turno
    restaurarAP() {
        // Senda de Leyenda (modo leyenda) tiene una penalización de -1 en el AP inicial y máximo restaurado
        if (modoLeyenda) {
            this.ap = Math.max(2, this.apMax - 1);
        } else {
            this.ap = this.apMax;
        }
    }
};

// Objeto global que representa al enemigo activo en el combate
// Rastrea el bioma actual (1: Amazonía, 2: Minas, 3: Salar Cósmico)
let actoActual = 0; // Empieza desde el tutorial (Acto 0)
let mapaTutorialPaso = 0; // Controla el flujo del tutorial del mapa en el Acto 0
let tiendaTutorialPaso = 0;
let tiendaTutorialCompletado = false;

// Objeto global del enemigo activo
const enemigo = {
    nombre: "Quirquincho Acorazado",
    hpMax: 150,
    hp: 150,
    defensa: 0.90,
    escudo: 0, // Registramos el escudo temporal del enemigo
    estado: null, // Puede ser null o "EMPAPADO"
    intencion: {
        tipo: "ATAQUE",
        valor: 10,
        descripcion: "Preparando ataque de 10 DMG"
    },

    // Función para cambiar los datos del enemigo según el acto y tipo de nodo
    configurarEnemigo(tipoCombate) {
        this.estado = null; // Limpiamos estados al iniciar el combate
        this.faseActual = 1; // Fase inicial
        const factor = obtenerFactorDificultad();

        if (tipoCombate === "JEFE") {
            if (actoActual === 0) {
                // Jefe del Tutorial (Acto 0): Quirquincho fortalecido
                this.nombre = "Quirquincho de Entrenamiento";
                this.faseActual = 2; // Prevenir fase 2 regenerativa
                this.hpMax = 120; // Reducido para el tutorial
                this.hp = this.hpMax;
                this.defensa = 0;
                this.intencion = { tipo: "ATAQUE", valor: 5, descripcion: "Golpe: 5 DMG" };
            }
            else if (actoActual === 1) {
                // Jefe del Acto 1: El Jichi (Amazonía)
                this.nombre = "El Jichi";
                this.hpMax = Math.round(240 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.0;
                this.intencion = { tipo: "ATAQUE", valor: Math.round(12 * factor), descripcion: "Inundación: " + Math.round(12 * factor) + " DMG" };
            }
            else if (actoActual === 2) {
                // Jefe del Acto 2: El Tío (Valles y Minas)
                this.nombre = "El Tío de la Mina";
                this.hpMax = Math.round(350 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.15;
                this.intencion = { tipo: "ATAQUE", valor: Math.round(16 * factor), descripcion: "Llamarada: " + Math.round(16 * factor) + " DMG" };
            }
            else if (actoActual === 3) {
                // Jefe Final del Acto 3: Huiracocha (Salar Cósmico)
                this.nombre = "Huiracocha";
                this.hpMax = Math.round(850 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.40;
                this.intencion = { tipo: "ATAQUE", valor: Math.round(25 * factor), descripcion: "Ira Cósmica: " + Math.round(25 * factor) + " DMG" };
            }
        } else {
            // Cargar enemigo normal según el Acto actual
            let rnd = Math.random();
            const nodoIdx = nodoActualIndex || 1;
            
            // Garantizar que los mini-jefes del Acto 3 aparezcan en sus nodos sin ser anulados por la aleatoriedad
            if (actoActual === 3 && nodoIdx === 1) {
                this.nombre = "El Monolito Viviente";
                this.hpMax = Math.round(180 * factor); // Tanque
                this.hp = this.hpMax;
                this.defensa = 0.30;
                this.intencion = { tipo: "ATAQUE", valor: Math.round(18 * factor), descripcion: "Golpe Lítico: " + Math.round(18 * factor) + " DMG" };
            } else if (actoActual === 3 && nodoIdx === 3) {
                this.nombre = "El Arcángel Caído";
                this.hpMax = Math.round(150 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.15;
                this.intencion = { tipo: "MALDICION", valor: Math.round(14 * factor), descripcion: "Tridente de Fuego: " + Math.round(14 * factor) + " DMG + Debilita" };
            } else if (actoActual >= 2 && rnd < 0.15) {
                this.nombre = "Kari Kari";
                this.hpMax = Math.round(90 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.05;
                this.intencion = { tipo: "ROBO_SANGRE", valor: Math.round(9 * factor), descripcion: "Robo Vida: " + Math.round(9 * factor) + " DMG" };
            } else if (actoActual === 3 && rnd < 0.3) {
                this.nombre = "El Supay";
                this.hpMax = Math.round(130 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.1;
                this.intencion = { tipo: "QUEMADURA", valor: Math.round(11 * factor), descripcion: "Fuego: " + Math.round(11 * factor) + " DMG" };

            } else if (actoActual === 1) {
                // Acto 1: 3 mini-bosses asignados a nodos específicos
                const nodoIdx = nodoActualIndex || 1;
                if (nodoIdx === 1) {
                    // Combate 1: El Mapinguari
                    this.nombre = "El Mapinguari";
                    this.hpMax = Math.round(130 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.10;
                    this.intencion = { tipo: "ATAQUE", valor: Math.round(12 * factor), descripcion: "Zarpazo Brutal: " + Math.round(12 * factor) + " DMG" };
                } else if (nodoIdx === 8) {
                    // Combate 2: El Guajojo
                    this.nombre = "El Guajojo";
                    this.hpMax = Math.round(80 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.0;
                    this.intencion = { tipo: "MALDICION", valor: 0, descripcion: "Canto Funebre: Debilita" };
                } else {
                    // Combate 3 (nodo 9) o fallback: El Duende Oriental
                    this.nombre = "El Duende Oriental";
                    this.hpMax = Math.round(90 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.05;
                    this.intencion = { tipo: "ATAQUE", valor: Math.round(7 * factor), descripcion: "Emboscada: " + Math.round(7 * factor) + " DMG" };
                }
            }
            else if (actoActual === 2) {
                // Acto 2: 3 mini-bosses asignados a nodos específicos
                const nodoIdx = nodoActualIndex || 1;
                if (nodoIdx === 1) {
                    this.nombre = "Quirquincho Salvaje";
                    this.hpMax = Math.round(110 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.25; // 25% defensa
                    this.intencion = { tipo: "ATAQUE", valor: Math.round(11 * factor), descripcion: "Pico Afilado: " + Math.round(11 * factor) + " DMG" };
                } else if (nodoIdx === 4) {
                    this.nombre = "La Viuda";
                    this.hpMax = Math.round(95 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.05;
                    this.intencion = { tipo: "MALDICION", valor: 0, descripcion: "Llanto: Te debilita" };
                } else if (nodoIdx === 3) {
                    this.nombre = "El Kharisiri";
                    this.hpMax = Math.round(100 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.10;
                    this.intencion = { tipo: "ROBO_SANGRE", valor: Math.round(9 * factor), descripcion: "Saca Grasa: " + Math.round(9 * factor) + " DMG" };
                } else if (nodoIdx === 7) {
                    this.nombre = "El Jukumari";
                    this.hpMax = Math.round(180 * factor); // Tanque
                    this.hp = this.hpMax;
                    this.defensa = 0.20;
                    this.intencion = { tipo: "ATAQUE", valor: Math.round(15 * factor), descripcion: "Garras de Oso: " + Math.round(15 * factor) + " DMG" };
                } else {
                    this.nombre = "Quirquincho Minero";
                    this.hpMax = Math.round(110 * factor);
                    this.hp = this.hpMax;
                    this.defensa = 0.25; // 25% defensa
                    this.intencion = { tipo: "ATAQUE", valor: Math.round(11 * factor), descripcion: "Pico Afilado: " + Math.round(11 * factor) + " DMG" };
                }
            }
            else {
                // Acto 3 random fallback
                this.nombre = "Quirquincho Acorazado Ancestral";
                this.hpMax = Math.round(160 * factor);
                this.hp = this.hpMax;
                this.defensa = 0.55; // 55% defensa
                this.intencion = { tipo: "ATAQUE", valor: Math.round(15 * factor), descripcion: "Giro de Caparazón: " + Math.round(15 * factor) + " DMG" };
            }
        }

        // NUEVO: En modo Senda de Leyenda (NG+), los enemigos empiezan con 15 de escudo gratis
        if (modoLeyenda) {
            this.escudo = 15;
            console.log("¡Senda de Leyenda! El enemigo comienza con 15 de Escudo.");
        } else {
            this.escudo = 0;
        }
    },

    definirSiguienteMovimiento() {
        const factor = obtenerFactorDificultad();
        let multFase = (this.faseActual === 2) ? 1.6 : 1.0; // 60% más daño en fase 2
        if (this.nombre === "Quirquincho de Entrenamiento") {
            this.intencion = { tipo: "ATAQUE", valor: 25, descripcion: "Ataque pesado: 25 DMG" };
        }
        else if (this.nombre.includes("El Jichi")) {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(12 * multFase), descripcion: "Inundación: " + Math.round(12 * multFase) + " DMG" },
                { tipo: "MALDICION", valor: 0, descripcion: "Constricción: Te debilita" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "El Guajojo") {
            const acciones = [
                { tipo: "MALDICION", valor: 0, descripcion: "Canto Funebre: Te debilita" },
                { tipo: "ATAQUE", valor: Math.round(6 * factor), descripcion: "Chillido Sonico: " + Math.round(6 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 12, descripcion: "Alas Fantasmales: +12 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "El Mapinguari") {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(12 * factor), descripcion: "Zarpazo Brutal: " + Math.round(12 * factor) + " DMG" },
                { tipo: "ATAQUE", valor: Math.round(15 * factor), descripcion: "Pisoton Sismico: " + Math.round(15 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 25, descripcion: "Pelaje Grueso: +25 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "El Duende Oriental") {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(7 * factor), descripcion: "Emboscada: " + Math.round(7 * factor) + " DMG" },
                { tipo: "ATAQUE", valor: Math.round(9 * factor), descripcion: "Zarpazo Travieso: " + Math.round(9 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 18, descripcion: "Sombrero Magico: +18 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "La Viuda") {
            const acciones = [
                { tipo: "MALDICION", valor: 0, descripcion: "Lamento: Te debilita" },
                { tipo: "ATAQUE", valor: Math.round(9 * factor), descripcion: "Toque Frio: " + Math.round(9 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 15, descripcion: "Velo Espectral: +15 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "El Kharisiri") {
            const acciones = [
                { tipo: "ROBO_SANGRE", valor: Math.round(11 * factor), descripcion: "Robo de Grasa: " + Math.round(11 * factor) + " DMG" },
                { tipo: "ATAQUE", valor: Math.round(14 * factor), descripcion: "Cuchillazo: " + Math.round(14 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 12, descripcion: "Campana Sombría: +12 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "El Jukumari") {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(16 * factor), descripcion: "Abrazo de Oso: " + Math.round(16 * factor) + " DMG" },
                { tipo: "ATAQUE", valor: Math.round(14 * factor), descripcion: "Zarpazo Brutal: " + Math.round(14 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 25, descripcion: "Piel Gruesa: +25 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre === "Quirquincho Minero") {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(11 * factor), descripcion: "Pico Afilado: " + Math.round(11 * factor) + " DMG" },
                { tipo: "ATAQUE", valor: Math.round(13 * factor), descripcion: "Excavar: " + Math.round(13 * factor) + " DMG" },
                { tipo: "DEFENSA", valor: 20, descripcion: "Coraza de Mineral: +20 Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre.includes("El Tío de la Mina")) {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(16 * multFase), descripcion: "Llamarada: " + Math.round(16 * multFase) + " DMG" },
                { tipo: "DEFENSA", valor: Math.round(20 * multFase), descripcion: "Pared de Carbón: +" + Math.round(20 * multFase) + " Escudo" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else if (this.nombre.includes("Huiracocha")) {
            const acciones = [
                { tipo: "ATAQUE", valor: Math.round(25 * multFase), descripcion: "Ira Cósmica: " + Math.round(25 * multFase) + " DMG" },
                { tipo: "DEFENSA", valor: Math.round(40 * multFase), descripcion: "Poder Solar: +" + Math.round(40 * multFase) + " Escudo" },
                { tipo: "MALDICION", valor: 0, descripcion: "Juicio Divino: Debilitamiento" }
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
        else {
            const acciones = [
                { tipo: "ATAQUE", valor: 10, descripcion: "Ataque físico de 10" },
                { tipo: "DEFENSA", valor: 15, descripcion: "Se enrosca: +15 Escudo" } // Sincronizado para usar Escudo real
            ];
            this.intencion = acciones[Math.floor(Math.random() * acciones.length)];
        }
    }
};

// ==========================================
// SISTEMA DE ANIMACIONES CANVAS (Fase 2)
// ==========================================
const animaciones = {
    jugador: {
        atkOffset: 0, hitShake: 0, shieldFlash: 0, pose: null, poseTimer: 0, cat: null,
        fase: 'idle', faseTick: 0, escalaY: 1, inclinacion: 0
    },
    enemigo: {
        atkOffset: 0, hitShake: 0, shieldFlash: 0, pose: null, poseTimer: 0, cat: null,
        fase: 'idle', faseTick: 0, escalaY: 1, inclinacion: 0
    },
    textosFlotantes: [],  // { x, y, texto, color, vida, maxVida, escala }
    proyectiles: [],      // { x, y, vx, vy, tipo, vida, maxVida, angulo }
    hitSparks: [],        // { x, y, tipo, vida, maxVida, rayos }
    particulas: [],       // { x, y, vx, vy, vida, maxVida, color, size }
    flashPantalla: 0,     // frames de flash blanco/color
    flashColor: 'rgba(255,255,255,',
    ondaChoque: null      // { x, y, radio, maxRadio, vida, color }
};

// Datos de configuración por tipo de carta
const ANIM_CONFIG = {
    ofensiva: {
        proyectilColor: '#ffffff',
        proyectilColor2: '#ffcc00',
        sparkColor: '#ff6600',
        sparkColor2: '#ffcc00',
        flashColor: 'rgba(255,140,0,',
        ondaColor: '#ff8800',
        numRayos: 8,
        particleColor: '#ff9900',
        particleColor2: '#ffcc00'
    },
    defensiva: {
        proyectilColor: '#3498db',
        proyectilColor2: '#aaddff',
        sparkColor: '#3498db',
        sparkColor2: '#ffffff',
        flashColor: 'rgba(52,152,219,',
        ondaColor: '#5dade2',
        numRayos: 6,
        particleColor: '#3498db',
        particleColor2: '#aaddff'
    },
    elemental: {
        proyectilColor: '#9b59b6',
        proyectilColor2: '#ff00ff',
        sparkColor: '#cc44ff',
        sparkColor2: '#ffffff',
        flashColor: 'rgba(155,89,182,',
        ondaColor: '#bb8fce',
        numRayos: 10,
        particleColor: '#cc44ff',
        particleColor2: '#ff88ff'
    },
    mejora: {
        proyectilColor: '#2ecc71',
        proyectilColor2: '#aaffcc',
        sparkColor: '#2ecc71',
        sparkColor2: '#ffffff',
        flashColor: 'rgba(46,204,113,',
        ondaColor: '#58d68d',
        numRayos: 5,
        particleColor: '#2ecc71',
        particleColor2: '#aaffcc'
    },
    nerfeo: {
        proyectilColor: '#8e44ad',
        proyectilColor2: '#e8daef',
        sparkColor: '#8e44ad',
        sparkColor2: '#bb8fce',
        flashColor: 'rgba(142,68,173,',
        ondaColor: '#a569bd',
        numRayos: 7,
        particleColor: '#8e44ad',
        particleColor2: '#d7bde2'
    }
};

function activarAnimacion(objetivo, tipo, opciones = {}) {
    const cat = opciones.cat || 'ofensiva';
    animaciones[objetivo].pose = tipo;
    animaciones[objetivo].poseTimer = 55;
    if (opciones.cat) animaciones[objetivo].cat = opciones.cat;

    if (tipo === 'ataque') {
        // Iniciar secuencia faseada: anticip → avance → impacto → retroceso
        animaciones[objetivo].fase = 'anticip';
        animaciones[objetivo].faseTick = 0;
        animaciones[objetivo].inclinacion = (objetivo === 'jugador') ? -0.18 : 0.18;
        // El proyectil se lanzará desde la fase 'avance'
        animaciones[objetivo]._pendingProyectil = { cat, objetivo };

    } else if (tipo === 'dano') {
        animaciones[objetivo].hitShake = 18;
        if (opciones.texto) {
            const xT = (objetivo === 'jugador') ? 80 : 390;
            const yT = (objetivo === 'jugador') ? 85 : 140;
            animaciones.textosFlotantes.push({
                x: xT + (Math.random() * 24 - 12), y: yT,
                texto: opciones.texto,
                color: opciones.texto === 'Bloqueado' ? '#aaddff' : '#ff4444',
                vida: 80, maxVida: 80, escala: opciones.texto === 'Bloqueado' ? 1.0 : 1.4
            });
        }

    } else if (tipo === 'escudo') {
        animaciones[objetivo].shieldFlash = 45;
        // Efecto de aura de escudo — onda suave azul/verde
        const cfg = ANIM_CONFIG[cat] || ANIM_CONFIG.defensiva;
        const cx = (objetivo === 'jugador') ? 80 : 390;
        animaciones.ondaChoque = { x: cx, y: 155, radio: 8, maxRadio: 55, vida: 30, maxVida: 30, color: cfg.ondaColor };
        // Partículas de escudo flotando hacia arriba
        for (let i = 0; i < 10; i++) {
            animaciones.particulas.push({
                x: cx + (Math.random() * 50 - 25),
                y: 155 + (Math.random() * 30),
                vx: (Math.random() - 0.5) * 1.5,
                vy: -(1.5 + Math.random() * 2),
                vida: 40 + Math.random() * 30,
                maxVida: 70,
                color: cfg.particleColor,
                size: 2 + Math.random() * 2
            });
        }
        if (opciones.texto) {
            const xT = (objetivo === 'jugador') ? 80 : 390;
            const yT = (objetivo === 'jugador') ? 80 : 135;
            animaciones.textosFlotantes.push({
                x: xT + (Math.random() * 20 - 10), y: yT,
                texto: opciones.texto,
                color: cat === 'mejora' ? '#2ecc71' : '#3498db',
                vida: 80, maxVida: 80, escala: 1.3
            });
        }
    }
}

function _lanzarProyectil(cfg_p) {
    const { cat, objetivo } = cfg_p;
    const cfg = ANIM_CONFIG[cat] || ANIM_CONFIG.ofensiva;

    // Origen
    const x0 = (objetivo === 'jugador') ? 115 : 340;
    const y0 = 150;

    // Destino: mejora va a la boca de Mamani (auto-curación)
    let x1, y1;
    if (cat === 'mejora') {
        x1 = 80;  // boca de Mamani
        y1 = 125;
    } else {
        x1 = (objetivo === 'jugador') ? 370 : 110;
        y1 = 155;
    }

    const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    const speed = cat === 'mejora' ? 10 : 14;
    animaciones.proyectiles.push({
        x: x0, y: y0,
        vx: (x1 - x0) / dist * speed,
        vy: (y1 - y0) / dist * speed,
        tipo: cat,
        destX: x1, destY: y1,
        vida: Math.ceil(dist / speed) + 2,
        maxVida: Math.ceil(dist / speed) + 2,
        angulo: Math.atan2(y1 - y0, x1 - x0),
        objetivo,
        cfg
    });
}


function _explotarImpacto(px, py, cfg, objetivo, tipoCarta) {
    if (tipoCarta === 'mejora') {
        // === AURA VERDE: Mamani absorbe la coca ===
        animaciones.ondaChoque = { x: 80, y: 150, radio: 5, maxRadio: 55, vida: 35, maxVida: 35, color: '#2ecc71' };
        animaciones.flashPantalla = 5;
        animaciones.flashColor = 'rgba(46,204,113,';
        for (let i = 0; i < 20; i++) {
            const ang = (Math.PI * 2 / 20) * i;
            const d2 = 20 + Math.random() * 15;
            animaciones.particulas.push({
                x: 80 + Math.cos(ang) * d2,
                y: 150 + Math.sin(ang) * d2,
                vx: Math.cos(ang) * 0.5,
                vy: -(2 + Math.random() * 2.5),
                vida: 50 + Math.random() * 30, maxVida: 80,
                color: (i % 2 === 0) ? '#2ecc71' : '#aaffcc',
                size: 2 + Math.random() * 2
            });
        }
        animaciones.textosFlotantes.push({
            x: 40, y: 110,
            texto: '\u2665 ENERGIA',
            color: '#2ecc71',
            vida: 90, maxVida: 90, escala: 1.2
        });
        return;
    }

    // Flash de pantalla
    animaciones.flashPantalla = 7;
    animaciones.flashColor = cfg.flashColor;
    // Onda de choque
    animaciones.ondaChoque = { x: px, y: py, radio: 5, maxRadio: 65, vida: 22, maxVida: 22, color: cfg.ondaColor };
    // Hit-spark
    animaciones.hitSparks.push({
        x: px, y: py,
        tipo: cfg,
        vida: 20, maxVida: 20,
        rayos: cfg.numRayos,
        angOffset: Math.random() * Math.PI
    });
    // Particulas de impacto
    for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 / 16) * i + Math.random() * 0.4;
        const vel = 2.5 + Math.random() * 4;
        animaciones.particulas.push({
            x: px, y: py,
            vx: Math.cos(ang) * vel,
            vy: Math.sin(ang) * vel - 1,
            vida: 25 + Math.random() * 20, maxVida: 45,
            color: (i % 2 === 0) ? cfg.particleColor : cfg.particleColor2,
            size: 1.5 + Math.random() * 2.5
        });
    }
}


function actualizarAnimaciones() {
    const FASES_JUGADOR = [
        { nombre: 'anticip', duracion: 8 },   // Se prepara, retrocede ligeramente
        { nombre: 'avance', duracion: 12 },  // Dash hacia adelante
        { nombre: 'impacto', duracion: 10 },  // Golpe en el punto más adelante
        { nombre: 'retorno', duracion: 18 }   // Vuelve suavemente a su posición
    ];

    ['jugador', 'enemigo'].forEach(obj => {
        const a = animaciones[obj];
        const dir = (obj === 'jugador') ? 1 : -1;

        // --- SISTEMA DE FASES ---
        if (a.fase !== 'idle') {
            a.faseTick++;
            const faseActual = FASES_JUGADOR.find(f => f.nombre === a.fase);
            const faseIdx = FASES_JUGADOR.findIndex(f => f.nombre === a.fase);

            if (a.fase === 'anticip') {
                // Retroceso leve + compresión vertical (agacharse)
                const t = a.faseTick / faseActual.duracion;
                a.atkOffset = dir * (-12) * Math.sin(t * Math.PI);
                a.escalaY = 1 - 0.08 * Math.sin(t * Math.PI);
                a.inclinacion = dir * 0.18 * Math.sin(t * Math.PI);
                if (a.faseTick >= faseActual.duracion) {
                    a.fase = 'avance'; a.faseTick = 0;
                    // Lanzar proyectil al inicio del avance
                    if (a._pendingProyectil) { _lanzarProyectil(a._pendingProyectil); a._pendingProyectil = null; }
                }

            } else if (a.fase === 'avance') {
                const t = a.faseTick / faseActual.duracion;
                // Easing: aceleración fuerte al inicio
                const ease = 1 - (1 - t) * (1 - t);
                a.atkOffset = dir * 45 * ease;
                a.escalaY = 1 + 0.06 * Math.sin(t * Math.PI);
                a.inclinacion = dir * -0.25 * ease; // Inclinado hacia adelante
                if (a.faseTick >= faseActual.duracion) { a.fase = 'impacto'; a.faseTick = 0; }

            } else if (a.fase === 'impacto') {
                a.atkOffset = dir * 45;
                a.escalaY = 1.08;
                a.inclinacion = dir * -0.25;
                if (a.faseTick >= faseActual.duracion) { a.fase = 'retorno'; a.faseTick = 0; }

            } else if (a.fase === 'retorno') {
                const t = a.faseTick / faseActual.duracion;
                const ease = t * t; // Desacelera al final
                a.atkOffset = dir * 45 * (1 - ease);
                a.escalaY = 1 + 0.04 * (1 - t);
                a.inclinacion = dir * -0.25 * (1 - ease);
                if (a.faseTick >= faseActual.duracion) {
                    a.fase = 'idle'; a.faseTick = 0;
                    a.atkOffset = 0; a.escalaY = 1; a.inclinacion = 0;
                }
            }
        }

        // Pose timer general
        if (a.poseTimer > 0) {
            a.poseTimer--;
            if (a.poseTimer <= 0) { a.pose = null; a.cat = null; }
        }

        // Temblor de daño
        if (a.hitShake > 0) {
            a.hitShake -= 0.5;
            if (a.hitShake < 0) a.hitShake = 0;
        }
        // Flash de escudo
        if (a.shieldFlash > 0) a.shieldFlash -= 1;
    });

    // --- Proyectiles ---
    for (let i = animaciones.proyectiles.length - 1; i >= 0; i--) {
        const p = animaciones.proyectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        if (p.vida <= 0) {
            // Explotar al llegar
            _explotarImpacto(p.destX, p.destY, p.cfg, p.objetivo, p.tipo);
            animaciones.proyectiles.splice(i, 1);
        }
    }

    // --- Hit-Sparks ---
    for (let i = animaciones.hitSparks.length - 1; i >= 0; i--) {
        animaciones.hitSparks[i].vida--;
        if (animaciones.hitSparks[i].vida <= 0) animaciones.hitSparks.splice(i, 1);
    }

    // --- Partículas ---
    for (let i = animaciones.particulas.length - 1; i >= 0; i--) {
        const p = animaciones.particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravedad suave
        p.vida--;
        if (p.vida <= 0) animaciones.particulas.splice(i, 1);
    }

    // --- Onda de choque ---
    if (animaciones.ondaChoque) {
        const o = animaciones.ondaChoque;
        o.radio += (o.maxRadio - o.radio) * 0.3;
        o.vida--;
        if (o.vida <= 0) animaciones.ondaChoque = null;
    }

    // --- Flash de pantalla ---
    if (animaciones.flashPantalla > 0) animaciones.flashPantalla--;

    // --- Textos flotantes ---
    for (let i = animaciones.textosFlotantes.length - 1; i >= 0; i--) {
        const t = animaciones.textosFlotantes[i];
        t.y -= 0.5;
        t.vida--;
        if (t.vida <= 0) animaciones.textosFlotantes.splice(i, 1);
    }
}

// Dibuja todos los efectos especiales encima de los personajes
function dibujarEfectosEspeciales() {
    // --- Onda de Choque ---
    if (animaciones.ondaChoque) {
        const o = animaciones.ondaChoque;
        const alfa = o.vida / o.maxVida;
        ctx.save();
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 2.5 * alfa;
        ctx.globalAlpha = alfa * 0.8;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radio, 0, Math.PI * 2);
        ctx.stroke();
        // Segunda onda más grande y tenue
        ctx.lineWidth = 1;
        ctx.globalAlpha = alfa * 0.3;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radio * 1.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // --- Proyectiles ---
    animaciones.proyectiles.forEach(p => {
        const progreso = 1 - p.vida / p.maxVida;
        const alfa = Math.sin(progreso * Math.PI);
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angulo);

        if (p.tipo === 'ofensiva') {
            // === MACHETE REAL girando en el aire ===
            ctx.rotate(Date.now() / 80); // gira rapido como si volara

            // Estela de brillo dorado detras del machete
            const estela = ctx.createLinearGradient(-38, 0, -14, 0);
            estela.addColorStop(0, 'rgba(255,200,60,0)');
            estela.addColorStop(1, 'rgba(255,220,80,0.35)');
            ctx.fillStyle = estela;
            ctx.fillRect(-38, -1.5, 24, 3);

            // Hoja del machete (forma trapezoidal con lomo curvado)
            const gradHoja = ctx.createLinearGradient(-14, -3, 10, 3);
            gradHoja.addColorStop(0, '#b0b0b0');
            gradHoja.addColorStop(0.35, '#f5f5f5');
            gradHoja.addColorStop(0.65, '#d8d8d8');
            gradHoja.addColorStop(1, '#707070');
            ctx.fillStyle = gradHoja;
            ctx.beginPath();
            ctx.moveTo(-14, -2.5);   // talon de hoja
            ctx.lineTo(11, -0.5);    // punta superior
            ctx.lineTo(10, 2.5);     // punta inferior
            ctx.quadraticCurveTo(0, 5.5, -14, 3.5); // lomo curvado
            ctx.closePath();
            ctx.fill();

            // Linea de filo brillante
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-13, -2);
            ctx.lineTo(11, -0.5);
            ctx.stroke();

            // Guarda metalica
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(-17, -3.5, 4, 8);
            ctx.strokeStyle = '#5a4000';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-17, -3.5, 4, 8);

            // Mango de madera
            const gradMango = ctx.createLinearGradient(-28, 0, -17, 0);
            gradMango.addColorStop(0, '#3D1C02');
            gradMango.addColorStop(0.4, '#7B3F00');
            gradMango.addColorStop(1, '#3D1C02');
            ctx.fillStyle = gradMango;
            ctx.beginPath();
            ctx.roundRect(-29, -2, 13, 5, 1.5);
            ctx.fill();
            // Textura de mango (lineas de madera)
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 0.5;
            for (let mn = -27; mn < -17; mn += 3) {
                ctx.beginPath(); ctx.moveTo(mn, -1.5); ctx.lineTo(mn, 2.5); ctx.stroke();
            }

        } else if (p.tipo === 'defensiva') {

            // Orbe de escudo — círculo con brillo
            const r = 7;
            const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, p.cfg.proyectilColor2);
            grad.addColorStop(1, p.cfg.proyectilColor);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            // Cruz interior
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-r * 0.5, 0); ctx.lineTo(r * 0.5, 0);
            ctx.moveTo(0, -r * 0.5); ctx.lineTo(0, r * 0.5);
            ctx.stroke();

        } else if (p.tipo === 'elemental') {
            // Bola de energía elemental con anillo giratorio
            const r = 8;
            const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, p.cfg.proyectilColor2);
            grad.addColorStop(1, p.cfg.proyectilColor);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            // Anillo orbitando
            const angOrb = Date.now() / 100;
            ctx.strokeStyle = p.cfg.proyectilColor2;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, r + 3, r * 0.4, angOrb, 0, Math.PI * 2);
            ctx.stroke();

        } else if (p.tipo === 'mejora') {
            // === HOJA DE COCA real volando a la boca ===
            ctx.rotate(Math.sin(Date.now() / 120) * 0.3);
            const hs = 0.9 + Math.sin(Date.now() / 80) * 0.06;
            ctx.scale(hs, hs);
            const gradHoja2 = ctx.createLinearGradient(-8, -6, 8, 6);
            gradHoja2.addColorStop(0, '#145a32');
            gradHoja2.addColorStop(0.4, '#27ae60');
            gradHoja2.addColorStop(0.7, '#2ecc71');
            gradHoja2.addColorStop(1, '#a9dfbf');
            ctx.fillStyle = gradHoja2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0b3a21';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(-7, 1);
            ctx.quadraticCurveTo(0, -0.5, 7, -1);
            ctx.stroke();
            ctx.lineWidth = 0.4;
            ctx.strokeStyle = '#1e8449';
            [[-4, -2.5], [0, -2.8], [3.5, -2.2]].forEach(([bx, ex]) => {
                ctx.beginPath(); ctx.moveTo(bx, 0.5); ctx.quadraticCurveTo(bx + 1, ex, bx + 3, -0.5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(bx, 0.5); ctx.quadraticCurveTo(bx + 1, -ex, bx + 3, 1.5); ctx.stroke();
            });
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-2, -2.5, 2.5, 1.2, -0.4, 0, Math.PI * 2);
            ctx.fill();
            if (Math.random() < 0.45) {
                animaciones.particulas.push({
                    x: p.x + (Math.random() * 5 - 2.5), y: p.y + (Math.random() * 5 - 2.5),
                    vx: (Math.random() - 0.5) * 0.8, vy: -(0.5 + Math.random()), vida: 18, maxVida: 18,
                    color: Math.random() < 0.5 ? '#2ecc71' : '#a9dfbf', size: 1.5
                });
            }

        } else {
            // === MAL DE OJO: OJO MALIGNO GIRANDO ===
            ctx.rotate(Math.sin(Date.now() / 200) * 0.2);
            ctx.fillStyle = '#150025';
            ctx.beginPath(); ctx.ellipse(0, 0, 11, 7.5, 0, 0, Math.PI * 2); ctx.fill();
            const gradIris = ctx.createRadialGradient(0, 0, 0, 0, 0, 5.5);
            gradIris.addColorStop(0, '#ff2200');
            gradIris.addColorStop(0.5, '#990000');
            gradIris.addColorStop(1, '#3a0000');
            ctx.fillStyle = gradIris;
            ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath(); ctx.ellipse(0, 0, 1.4, 4.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath(); ctx.ellipse(-2.5, -2, 1.8, 1, -0.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#cc44ff';
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.ellipse(0, 0, 11, 7.5, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 0.8;
            [[-1, 1]].forEach(([pe]) => {
                pe = pe;
                [-1, 1].forEach(s => {
                    ctx.beginPath(); ctx.moveTo(s * 9, -3); ctx.lineTo(s * 13, -5); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(s * 7, -5); ctx.lineTo(s * 9, -8); ctx.stroke();
                });
            });
            if (Math.random() < 0.5) {
                animaciones.particulas.push({
                    x: p.x + (Math.random() * 10 - 5), y: p.y + (Math.random() * 10 - 5),
                    vx: (Math.random() - 0.5) * 1.2, vy: -(0.3 + Math.random() * 0.8), vida: 15, maxVida: 15,
                    color: Math.random() < 0.5 ? '#8e44ad' : '#ff0000', size: 2
                });
            }
        }
        ctx.restore();
    });

    // --- Hit Sparks ---
    animaciones.hitSparks.forEach(s => {
        const t = 1 - s.vida / s.maxVida;
        const alfa = Math.pow(1 - t, 1.5);
        const scale = 0.4 + t * 1.2;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(s.x, s.y);
        // Rayos del hit-spark
        for (let r = 0; r < s.rayos; r++) {
            const ang = (Math.PI * 2 / s.rayos) * r + s.angOffset;
            const len1 = (8 + (r % 2) * 7) * scale;
            const len2 = (3 + (r % 2) * 3) * scale;
            const w = (r % 2 === 0) ? 2.5 : 1.5;
            // Rayo externo
            ctx.strokeStyle = (r % 2 === 0) ? s.tipo.sparkColor : s.tipo.sparkColor2;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * len2, Math.sin(ang) * len2);
            ctx.lineTo(Math.cos(ang) * len1, Math.sin(ang) * len1);
            ctx.stroke();
        }
        // Núcleo del spark
        const gradCore = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * scale);
        gradCore.addColorStop(0, '#ffffff');
        gradCore.addColorStop(0.5, s.tipo.sparkColor2);
        gradCore.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradCore;
        ctx.beginPath();
        ctx.arc(0, 0, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // --- Partículas ---
    animaciones.particulas.forEach(p => {
        const alfa = p.vida / p.maxVida;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
    });

    // --- Textos flotantes ---
    animaciones.textosFlotantes.forEach(t => {
        const alfa = Math.min(1, t.vida / (t.maxVida * 0.5));
        const escala = t.escala || 1;
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.globalAlpha = alfa;
        ctx.font = `${Math.round(6 * escala)}px 'Press Start 2P'`;
        ctx.fillText(t.texto, t.x, t.y);
        ctx.restore();
    });

    // --- Flash de pantalla ---
    if (animaciones.flashPantalla > 0) {
        const alfa = (animaciones.flashPantalla / 7) * 0.35;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.fillStyle = animaciones.flashColor + '1)';
        ctx.fillRect(0, 0, 480, 270);
        ctx.restore();
    }
}

// ==========================================
// SISTEMA DE NODOS DEL MAPA — DINÁMICO POR ACTO
// ==========================================
// Cada acto tiene su propio mapa con nodos, ciudades y conexiones únicos.
// Al pasar de acto, reiniciarMapaParaNuevoActo() carga el array correspondiente.

const NODOS_POR_ACTO = {
    // ── ACTO 0: TUTORIAL (Mapa Simplificado) ─────────────────────────
    0: [
        { id: 0, x: 50, y: 150, tipo: "INICIO", ciudad: "Tu Casa", label: "INICIO", completado: true, disponible: false, conexiones: [1] },
        { id: 1, x: 115, y: 150, tipo: "COMBATE", ciudad: "Entrenamiento", label: "COMBATE", completado: false, disponible: true, conexiones: [2] },
        { id: 2, x: 185, y: 150, tipo: "TIENDA", ciudad: "Mercado", label: "TIENDA", completado: false, disponible: false, conexiones: [3, 4] },
        { id: 3, x: 265, y: 100, tipo: "CAMPAMENTO", ciudad: "Descanso", label: "CAMPAMENTO", completado: false, disponible: false, conexiones: [5] },
        { id: 4, x: 265, y: 200, tipo: "EVENTO", ciudad: "Bosque", label: "EVENTO", completado: false, disponible: false, conexiones: [5] },
        { id: 5, x: 380, y: 150, tipo: "JEFE", ciudad: "Prueba Final", label: "JEFE", completado: false, disponible: false, conexiones: [] }
    ],

    // ── ACTO 1: AMAZONÍA (Pando → Beni → Santa Cruz) ─────────────────────────
    1: [
        { id: 0, x: 98, y: 59, tipo: "INICIO", ciudad: "Cobija", label: "INICIO", completado: true, disponible: false, conexiones: [1, 5] },
        { id: 1, x: 167, y: 70, tipo: "COMBATE", ciudad: "Puerto Rico", label: "COMBATE", completado: false, disponible: true, conexiones: [2] },
        { id: 2, x: 247, y: 84, tipo: "CAMPAMENTO", ciudad: "Riberalta", label: "CAMPAMENTO", completado: false, disponible: false, conexiones: [3] },
        { id: 3, x: 278, y: 114, tipo: "EVENTO", ciudad: "Beni Norte", label: "EVENTO", completado: false, disponible: false, conexiones: [4] },
        { id: 4, x: 240, y: 143, tipo: "TIENDA", ciudad: "Trinidad", label: "TIENDA", completado: false, disponible: false, conexiones: [8] },
        { id: 5, x: 113, y: 131, tipo: "TIENDA", ciudad: "Guayaramerín", label: "TIENDA", completado: false, disponible: true, conexiones: [6] },
        { id: 6, x: 89, y: 190, tipo: "CAMPAMENTO", ciudad: "Bajo Guaya", label: "CAMPAMENTO", completado: false, disponible: false, conexiones: [7] },
        { id: 7, x: 177, y: 213, tipo: "EVENTO", ciudad: "Río Iténez", label: "EVENTO", completado: false, disponible: false, conexiones: [12] },
        { id: 8, x: 281, y: 178, tipo: "COMBATE", ciudad: "Loreto", label: "COMBATE", completado: false, disponible: false, conexiones: [10] },
        { id: 9, x: 313, y: 226, tipo: "CAMPAMENTO", ciudad: "Concepción", label: "CAMPAMENTO", completado: false, disponible: false, conexiones: [7] },
        { id: 10, x: 339, y: 187, tipo: "COMBATE", ciudad: "San Ignacio", label: "COMBATE", completado: false, disponible: false, conexiones: [11] },
        { id: 11, x: 399, y: 219, tipo: "EVENTO", ciudad: "Samaipata", label: "EVENTO", completado: false, disponible: false, conexiones: [9] },
        { id: 12, x: 53, y: 206, tipo: "JEFE", ciudad: "El Jichi", label: "JEFE", completado: false, disponible: false, conexiones: [] }
    ],

    // ── ACTO 2: VALLES Y MINAS DE POTOSÍ ─────────────────────────────────────
    // Ruta Norte (lenta/segura): Cochabamba → Tarata → Mizque → Aiquile → Sucre
    // Ruta Sur (rápida/peligrosa): Cochabamba → Quillacollo → Camargo → Tupiza
    // Convergencia: Potosí → El Tío de la Mina (Jefe)
    2: [
        { id: 0, x: 105, y: 55, tipo: "INICIO", ciudad: "Cochabamba", label: "INICIO", completado: true, disponible: false, conexiones: [1, 4] },
        { id: 1, x: 242, y: 50, tipo: "COMBATE", ciudad: "Camino Cbba", label: "COMBATE", completado: false, disponible: true, conexiones: [2] },
        { id: 2, x: 360, y: 40, tipo: "EVENTO", ciudad: "Entrada Mina", label: "EVENTO", completado: false, disponible: false, conexiones: [3] },
        { id: 3, x: 380, y: 90, tipo: "COMBATE", ciudad: "Salida Mina", label: "COMBATE", completado: false, disponible: false, conexiones: [5] },
        { id: 4, x: 160, y: 100, tipo: "COMBATE", ciudad: "Puente del Río", label: "COMBATE", completado: false, disponible: true, conexiones: [5] },
        { id: 5, x: 240, y: 135, tipo: "CAMPAMENTO", ciudad: "Chuquisaca", label: "CAMPAMENTO", completado: false, disponible: false, conexiones: [6] },
        { id: 6, x: 140, y: 195, tipo: "EVENTO", ciudad: "Cofre Abajo", label: "EVENTO", completado: false, disponible: false, conexiones: [7] },
        { id: 7, x: 200, y: 230, tipo: "COMBATE", ciudad: "Antes Potosí", label: "COMBATE", completado: false, disponible: false, conexiones: [8] },
        { id: 8, x: 270, y: 220, tipo: "TIENDA", ciudad: "Potosí", label: "TIENDA", completado: false, disponible: false, conexiones: [9] },
        { id: 9, x: 350, y: 185, tipo: "JEFE", ciudad: "Cerro Rico", label: "JEFE", completado: false, disponible: false, conexiones: [] }
    ],

    // ── ACTO 3: ALTIPLANO Y SALAR CÓSMICO ────────────────────────────────────
    // ── ACTO 3: SALAR CÓSMICO (Trayectoria de la línea azul) ────────────────────────────────────
    // Ruta lineal desde La Paz hacia el corazón del Salar Cósmico
    3: [
        { id: 0, x: 215, y: 70, tipo: "INICIO", ciudad: "La Paz", label: "INICIO", completado: true, disponible: false, conexiones: [1] },
        { id: 1, x: 250, y: 100, tipo: "COMBATE", ciudad: "Tiwanaku", label: "COMBATE", completado: false, disponible: true, conexiones: [2] },
        { id: 2, x: 245, y: 135, tipo: "EVENTO", ciudad: "Incahuasi", label: "EVENTO", completado: false, disponible: false, conexiones: [3] },
        { id: 3, x: 320, y: 140, tipo: "COMBATE", ciudad: "Oruro", label: "COMBATE", completado: false, disponible: false, conexiones: [4] },
        { id: 4, x: 355, y: 170, tipo: "CAMPAMENTO", ciudad: "Salar Norte", label: "CAMPAMENTO", completado: false, disponible: false, conexiones: [5] },
        { id: 5, x: 330, y: 230, tipo: "TIENDA", ciudad: "Refugio Salar", label: "TIENDA", completado: false, disponible: false, conexiones: [6] },
        { id: 6, x: 250, y: 195, tipo: "JEFE", ciudad: "Huiracocha", label: "JEFE", completado: false, disponible: false, conexiones: [] }
    ]

};
// nodosMapa es la lista activa del acto actual — se reasigna al cambiar de acto
let nodosMapa = JSON.parse(JSON.stringify(NODOS_POR_ACTO[1]));

// ==========================================
// ARTÍCULOS DE LA TIENDA DEL CALLAWAYA
// ==========================================
// ==========================================
// ARTÍCULOS DE LA TIENDA TEMÁTICOS POR ACTO Y PUNTO
// ==========================================
// ==========================================
// TIENDAS TEMÁTICAS POR NODO Y ACTO
// ==========================================
// Los ítems se identifican por su ID único (usado en usarItem()).
// Los nodos de tienda tienen diferentes IDs en cada acto, así que
// no hay colisión: Acto1→{4,5}, Acto2→{4,7}, Acto3→{3,7,10}.
// La función obtenerItemsTiendaActual() combina actoActual + nodoActualIndex
// para devolver los ítems correctos en cada pantalla de tienda.

const TIENDAS_POR_NODO = {
    // ── ACTO 1: AMAZONÍA ────────────────────────────────────────────────────
    "1_4": { // Trinidad: Mercado Beniense
        titulo: "Mercado de Trinidad",
        items: [
            { id: "majadito", nombre: "Majadito", costo: 15, x: 90, y: 80, desc: "+25 Vida", emoji: "🍛" },
            { id: "copaiba", nombre: "Bálsamo Copaiba", costo: 20, x: 260, y: 80, desc: "+15 Def.", emoji: "🧪" },
            { id: "cerbatana", nombre: "Cerbatana", costo: 30, x: 90, y: 145, desc: "35 Daño", emoji: "🏹" },
            { id: "unadegato", nombre: "Uña de Gato", costo: 25, x: 260, y: 145, desc: "Sana Males", emoji: "🌿" }
        ]
    },
    "1_5": { // Guayaramerín: Barraca del Maderero
        titulo: "Barraca del Maderero",
        items: [
            { id: "castana", nombre: "Castaña", costo: 12, x: 90, y: 80, desc: "+20 Vida", emoji: "🌰" },
            { id: "aceiteselva", nombre: "Aceite Almendra", costo: 18, x: 260, y: 80, desc: "+15 Def.", emoji: "💧" },
            { id: "machete", nombre: "Machete", costo: 32, x: 90, y: 145, desc: "38 Daño", emoji: "🗡️" },
            { id: "resinaselva", nombre: "Sangre de Grado", costo: 22, x: 260, y: 145, desc: "Sana Males", emoji: "🩸" }
        ]
    },

    // ── ACTO 2: VALLES Y MINAS ───────────────────────────────────────────────
    "2_8": { // Potosí
        titulo: "Mercado de Potosí",
        items: [
            { id: "chicha", nombre: "Chicha de Maíz", costo: 18, x: 90, y: 80, desc: "+30 Vida", emoji: "🍺" },
            { id: "cuero", nombre: "Escudo de Cuero", costo: 28, x: 260, y: 80, desc: "+18 Def.", emoji: "🛡️" },
            { id: "plata", nombre: "Plata del Cerro", costo: 35, x: 90, y: 145, desc: "+20 Def.", emoji: "⚙️" },
            { id: "menta", nombre: "Hierba Menta", costo: 22, x: 260, y: 145, desc: "Sana Males", emoji: "🌱" }
        ]
    },

    // ── ACTO 3: ALTIPLANO Y SALAR ────────────────────────────────────────────
    "3_3": { // La Paz: Feria de Alasitas
        titulo: "Feria de Alasitas",
        items: [
            { id: "lluchu", nombre: "Tunta", costo: 20, x: 90, y: 80, desc: "+35 Vida", emoji: "☁️" },
            { id: "hoja", nombre: "Hoja de Coca", costo: 30, x: 260, y: 80, desc: "+25 Def.", emoji: "🌿" },
            { id: "boleadora", nombre: "Boleadora", costo: 40, x: 90, y: 145, desc: "45 Daño", emoji: "⚡" },
            { id: "incienso", nombre: "Incienso del Cerro", costo: 25, x: 260, y: 145, desc: "Sana Males", emoji: "💨" }
        ]
    },
    "3_7": { // Yungas: Mercado de los Espíritus
        titulo: "Mercado de los Espíritus",
        items: [
            { id: "locoto", nombre: "Locoto Silvestre", costo: 18, x: 90, y: 80, desc: "+30 Vida", emoji: "🌶️" },
            { id: "aymara", nombre: "Amuleto Aymara", costo: 35, x: 260, y: 80, desc: "+22 Def.", emoji: "🪬" },
            { id: "suri", nombre: "Pluma de Suri", costo: 38, x: 90, y: 145, desc: "42 Daño", emoji: "🦤" },
            { id: "koa", nombre: "K'oa Sagrada", costo: 28, x: 260, y: 145, desc: "Sana Males", emoji: "🔥" }
        ]
    },
    "3_10": { // Uyuni: Puesto del Salar
        titulo: "Puesto del Salar",
        items: [
            { id: "quinua", nombre: "Quinua Real", costo: 22, x: 90, y: 80, desc: "+35 Vida", emoji: "🌾" },
            { id: "sal", nombre: "Escudo de Sal", costo: 32, x: 260, y: 80, desc: "+28 Def.", emoji: "🧂" },
            { id: "hacha", nombre: "Hacha de Obsidiana", costo: 45, x: 90, y: 145, desc: "50 Daño", emoji: "🪓" },
            { id: "palo", nombre: "Palo Santo", costo: 30, x: 260, y: 145, desc: "Sana Males", emoji: "🪵" }
        ]
    }
};

const TIENDA_FALLBACK = {
    titulo: "Mercado Andino",
    items: [
        { id: "saltena", nombre: "Salteña", costo: 15, x: 90, y: 80, desc: "+25 Vida", emoji: "🥟" },
        { id: "copaiba", nombre: "Bálsamo", costo: 20, x: 260, y: 80, desc: "+15 Def.", emoji: "🧪" },
        { id: "honda", nombre: "Honda", costo: 30, x: 90, y: 145, desc: "35 Daño", emoji: "🪨" },
        { id: "menta", nombre: "Hierba Menta", costo: 25, x: 260, y: 145, desc: "Sana Males", emoji: "🌱" }
    ]
};

// ── SISTEMA DE BUFFS POR NIVELES ───────────────────────────────────────
const BUFFS_NIVELES = [
    {
        id: 'vitalidad',
        nombre: 'Vitalidad Andina',
        icono: '❤️',
        color: '#e74c3c',
        colorOsc: 'rgba(100,20,15,0.45)',
        niveles: [
            { costo: 30, desc: '+20 HP Máx', efecto: 'hp_max', valor: 20 },
            { costo: 55, desc: '+35 HP Máx', efecto: 'hp_max', valor: 35 },
            { costo: 90, desc: '+50 HP Máx', efecto: 'hp_max', valor: 50 }
        ]
    },
    {
        id: 'energia',
        nombre: 'Energía del Cóndor',
        icono: '⚡',
        color: '#f1c40f',
        colorOsc: 'rgba(100,80,0,0.45)',
        niveles: [
            { costo: 60, desc: '+1 AP Máx', efecto: 'ap_max', valor: 1 },
            { costo: 100, desc: '+1 AP Máx', efecto: 'ap_max', valor: 1 }
        ]
    },
    {
        id: 'defensa',
        nombre: 'Piel del Jaguar',
        icono: '🛡️',
        color: '#3498db',
        colorOsc: 'rgba(10,40,80,0.45)',
        niveles: [
            { costo: 40, desc: '+8 Escudo Base', efecto: 'bloqueo_base', valor: 8 },
            { costo: 70, desc: '+12 Escudo Base', efecto: 'bloqueo_base', valor: 12 },
            { costo: 110, desc: '+18 Escudo Base', efecto: 'bloqueo_base', valor: 18 }
        ]
    },
    {
        id: 'fuerza',
        nombre: 'Filo del Minero',
        icono: '⚔️',
        color: '#e67e22',
        colorOsc: 'rgba(100,40,5,0.45)',
        niveles: [
            { costo: 45, desc: '+15 Daño Fijo', efecto: 'danio_bonus', valor: 15 },
            { costo: 80, desc: '+25 Daño Fijo', efecto: 'danio_bonus', valor: 25 },
            { costo: 120, desc: '+35 Daño Fijo', efecto: 'danio_bonus', valor: 35 }
        ]
    }
];

function generarItemsTienda(tipo) {
    let pool = [];
    if (tipo === 'objetos') pool = obtenerItemsTiendaActual();
    else if (tipo === 'mazo') pool = obtenerCartasTiendaActual();
    // Mezcla aleatoria y retorna hasta 4 items
    return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(4, pool.length));
}

function obtenerItemsTiendaActual() {
    // Primero intentamos la clave combinada acto+nodo para máxima especificidad
    const claveExacta = `${actoActual}_${nodoActualIndex}`;
    if (TIENDAS_POR_NODO[claveExacta]) return TIENDAS_POR_NODO[claveExacta].items;
    // Fallback genérico
    return TIENDA_FALLBACK.items;
}

function obtenerPasivasTiendaActual() {
    const pasivas = {
        1: [
            { id: "p1", nombre: "Amuleto Selva", costo: 30, desc: "+15 Vida Máx", efecto: "hp_max", valor: 15, x: 0, y: 0 },
            { id: "p2", nombre: "Piel de Caimán", costo: 35, desc: "+5 Def. Inicial", efecto: "escudo_ini", valor: 5, x: 0, y: 0 }
        ],
        2: [
            { id: "p3", nombre: "Pulmón Minero", costo: 40, desc: "+25 Vida Máx", efecto: "hp_max", valor: 25, x: 0, y: 0 },
            { id: "p4", nombre: "Pico de Plata", costo: 85, desc: "+1 E. Máx", efecto: "ap_max", valor: 1, x: 0, y: 0 }
        ],
        3: [
            { id: "p5", nombre: "Alma Cóndor", costo: 50, desc: "+35 Vida Máx", efecto: "hp_max", valor: 35, x: 0, y: 0 },
            { id: "p6", nombre: "Chakana Eterna", costo: 110, desc: "+2 E. Máx", efecto: "ap_max", valor: 2, x: 0, y: 0 }
        ]
    };
    const todas = pasivas[actoActual] || pasivas[1];
    return todas.filter(p => !jugador.reliquias.find(r => r.id === p.id));
}

const POOL_CARTAS_TIENDA = [
    // ─── Elementales ────────────────────────────────────────────────────────
    {
        id: "ce1", nombre: "Torrente Jichi", costo: 55, desc: "35 daño. Empapado", categoria: "elemental", emoji: "💧",
        tipo: "Elemental (Agua)",
        carta: { nombre: "Torrente Jichi", costoAP: 2, tipo: "Elemental (Agua)", categoria: "elemental", daño: 35, efecto: "EMPAPADO", valor: 0, cooldown: 2, descripcion: "35 daño. Aplica Empapado." }
    },
    {
        id: "ce2", nombre: "Llama del Ekeko", costo: 60, desc: "40 daño elemental", categoria: "elemental", emoji: "🔥",
        tipo: "Elemental (Fuego)",
        carta: { nombre: "Llama del Ekeko", costoAP: 2, tipo: "Elemental (Fuego)", categoria: "elemental", daño: 40, efecto: "QUEMADO", valor: 3, cooldown: 2, descripcion: "40 daño. Aplica Quemado." }
    },
    // ─── Mejoras ────────────────────────────────────────────────────────────
    {
        id: "cm1", nombre: "Coca Ancestral", costo: 45, desc: "+2 AP este turno", categoria: "mejora", emoji: "🌿",
        tipo: "Mejora",
        carta: { nombre: "Coca Ancestral", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "AP_BONUS", valor: 2, cooldown: 2, descripcion: "Energía andina. +2 AP este turno." }
    },
    {
        id: "cm2", nombre: "Brebaje Sabio", costo: 45, desc: "+2 AP este turno", categoria: "mejora", emoji: "🧪",
        tipo: "Mejora",
        carta: { nombre: "Brebaje Sabio", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "AP_BONUS", valor: 2, cooldown: 2, descripcion: "Suma +2 AP este turno." }
    },
    // ─── Nerfeo / Debilitar ─────────────────────────────────────────────────
    {
        id: "cn1", nombre: "Mal de Ojo", costo: 40, desc: "Debilita enemigo", categoria: "nerfeo", emoji: "👁️",
        tipo: "Nerfeo",
        carta: { nombre: "Mal de Ojo", costoAP: 1, tipo: "Nerfeo", categoria: "nerfeo", efecto: "DEBILITAR", valor: 0, cooldown: 2, descripcion: "Debilita: -5 ATK enemigo." }
    },
    {
        id: "cn2", nombre: "Susurro del Yatiri", costo: 40, desc: "Silencia 1 turno", categoria: "nerfeo", emoji: "🪬",
        tipo: "Nerfeo",
        carta: { nombre: "Susurro del Yatiri", costoAP: 1, tipo: "Nerfeo", categoria: "nerfeo", efecto: "DEBILITAR", valor: 5, cooldown: 2, descripcion: "Silencia al enemigo 1 turno." }
    },
    // ─── Mejoras ofensivas (upgrade del slot) ───────────────────────────────
    {
        id: "co2", nombre: "Golpe Certero", costo: 40, desc: "20 daño físico", categoria: "ofensiva", emoji: "⚔️",
        tipo: "Ofensiva",
        carta: { nombre: "Golpe Certero", costoAP: 1, tipo: "Ofensiva", categoria: "ofensiva", daño: 20, cooldown: 1, descripcion: "Golpe preciso. Daño 20." }
    },
    {
        id: "cd2", nombre: "Casco Minero", costo: 40, desc: "+35 Escudo", categoria: "defensiva", emoji: "🪖",
        tipo: "Defensiva",
        carta: { nombre: "Casco Minero", costoAP: 1, tipo: "Defensiva", categoria: "defensiva", bloqueo: 35, cooldown: 2, descripcion: "Bloqueo reforzado. +35 Escudo." }
    }
];

function obtenerCartasTiendaActual() {
    // Pool completo de cartas — se filtra según ranuras bloqueadas del jugador
    // Ranuras null = slot disponible para comprar
    const POOL_CARTAS = [
        // ─── Elementales ────────────────────────────────────────────────────────
        {
            id: "ce1", nombre: "Torrente Jichi", costo: 55, desc: "35 daño. Empapado", categoria: "elemental", emoji: "💧",
            tipo: "Elemental (Agua)",
            carta: { nombre: "Torrente Jichi", costoAP: 2, tipo: "Elemental (Agua)", categoria: "elemental", daño: 35, efecto: "EMPAPADO", valor: 0, cooldown: 2, descripcion: "35 daño. Aplica Empapado." }
        },
        {
            id: "ce2", nombre: "Llama del Ekeko", costo: 60, desc: "40 daño elemental", categoria: "elemental", emoji: "🔥",
            tipo: "Elemental (Fuego)",
            carta: { nombre: "Llama del Ekeko", costoAP: 2, tipo: "Elemental (Fuego)", categoria: "elemental", daño: 40, efecto: "QUEMADO", valor: 3, cooldown: 2, descripcion: "40 daño. Aplica Quemado." }
        },
        // ─── Mejoras ────────────────────────────────────────────────────────────
        {
            id: "cm1", nombre: "Coca Ancestral", costo: 45, desc: "+2 AP este turno", categoria: "mejora", emoji: "🌿",
            tipo: "Mejora",
            carta: { nombre: "Coca Ancestral", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "AP_BONUS", valor: 2, cooldown: 2, descripcion: "Energía andina. +2 AP este turno." }
        },
        {
            id: "cm2", nombre: "Brebaje Sabio", costo: 45, desc: "+2 AP este turno", categoria: "mejora", emoji: "🧪",
            tipo: "Mejora",
            carta: { nombre: "Brebaje Sabio", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "AP_BONUS", valor: 2, cooldown: 2, descripcion: "Suma +2 AP este turno." }
        },
        // ─── Nerfeo / Debilitar ─────────────────────────────────────────────────
        {
            id: "cn1", nombre: "Mal de Ojo", costo: 40, desc: "Debilita enemigo", categoria: "nerfeo", emoji: "👁️",
            tipo: "Nerfeo",
            carta: { nombre: "Mal de Ojo", costoAP: 1, tipo: "Nerfeo", categoria: "nerfeo", efecto: "DEBILITAR", valor: 0, cooldown: 2, descripcion: "Debilita: -5 ATK enemigo." }
        },
        {
            id: "cn2", nombre: "Susurro del Yatiri", costo: 40, desc: "Silencia 1 turno", categoria: "nerfeo", emoji: "🪬",
            tipo: "Nerfeo",
            carta: { nombre: "Susurro del Yatiri", costoAP: 1, tipo: "Nerfeo", categoria: "nerfeo", efecto: "DEBILITAR", valor: 5, cooldown: 2, descripcion: "Silencia al enemigo 1 turno." }
        },
        // ─── Mejoras ofensivas (upgrade del slot) ───────────────────────────────
        {
            id: "co2", nombre: "Golpe Certero", costo: 40, desc: "20 daño físico", categoria: "ofensiva", emoji: "⚔️",
            tipo: "Ofensiva",
            carta: { nombre: "Golpe Certero", costoAP: 1, tipo: "Ofensiva", categoria: "ofensiva", daño: 20, cooldown: 1, descripcion: "Golpe preciso. Daño 20." }
        },
        {
            id: "cd2", nombre: "Casco Minero", costo: 40, desc: "+35 Escudo", categoria: "defensiva", emoji: "🪖",
            tipo: "Defensiva",
            carta: { nombre: "Casco Minero", costoAP: 1, tipo: "Defensiva", categoria: "defensiva", bloqueo: 35, cooldown: 2, descripcion: "Bloqueo reforzado. +35 Escudo." }
        }
    ];
    // Solo retornar cartas cuyo slot (categoria) está bloqueado (null) en la mano
    return POOL_CARTAS_TIENDA.filter(c => jugador.mano[c.categoria] === null);

    // ── Legacy mapping (mantenido por si algo lo referencia) ──
    const cartas = {
        1: [
            { id: "c1", nombre: "Golpe Certero", costo: 40, desc: "Ataque 20", categoria: "ofensiva", carta: { nombre: "Golpe Certero", costoAP: 1, tipo: "Ofensiva", categoria: "ofensiva", daño: 20, cooldown: 1, descripcion: "Golpe preciso. Daño 20." }, x: 0, y: 0 },
            { id: "c2", nombre: "Brebaje Sabio", costo: 45, desc: "+2 Energía", categoria: "mejora", carta: { nombre: "Brebaje Sabio", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "AP_BONUS", valor: 2, cooldown: 2, descripcion: "Suma +2 AP este turno." }, x: 0, y: 0 }
        ],
        2: [
            { id: "c3", nombre: "Dinamita", costo: 50, desc: "Ataque 45", categoria: "ofensiva", carta: { nombre: "Dinamita", costoAP: 2, tipo: "Ofensiva", categoria: "ofensiva", daño: 45, cooldown: 2, descripcion: "Explosión masiva. Daño 45." }, x: 0, y: 0 },
            { id: "c4", nombre: "Casco Minero", costo: 40, desc: "+35 Defensa", categoria: "defensiva", carta: { nombre: "Casco Minero", costoAP: 1, tipo: "Defensiva", categoria: "defensiva", bloqueo: 35, cooldown: 2, descripcion: "Te proteges bien. +35 Escudo." }, x: 0, y: 0 }
        ],
        3: [
            { id: "c5", nombre: "Ira del Ekeko", costo: 75, desc: "Ataque Mag. 60", categoria: "elemental", carta: { nombre: "Ira del Ekeko", costoAP: 3, tipo: "Elemental", categoria: "elemental", daño: 60, cooldown: 3, descripcion: "Daño abrumador. Daño 60." }, x: 0, y: 0 },
            { id: "c6", nombre: "Rezo Sagrado", costo: 85, desc: "Cura 40 Vida", categoria: "mejora", carta: { nombre: "Rezo Sagrado", costoAP: 1, tipo: "Mejora", categoria: "mejora", efecto: "CURAR", valor: 40, cooldown: 2, descripcion: "Gran bendición. Cura 40 HP." }, x: 0, y: 0 }
        ]
    };
    return cartas[actoActual] || cartas[1];
}

// ==========================================
// DATOS DEL ENCUENTRO CON EL YATIRI
// ==========================================
// ==========================================
// EVENTOS TEMÁTICOS POR ACTO Y NODO
// ==========================================
// Clave: `${actoActual}_${nodoActualIndex}` para máxima especificidad.
// Si no existe, se usa EVENTO_YATIRI_FALLBACK.
const EVENTOS_POR_NODO = {

    // ── ACTO 1: AMAZONÍA ────────────────────────────────────────────────────
    "1_3": {
        titulo: "EL MAPINGUARI",
        descripcion: "Un estruendo sacude la selva. Ojos rojos entre las lianas...\nel Mapinguari te observa. El olor a muerte te rodea.\n¿Intentas domarlo o huyes en silencio?",
        opciones: [
            { id: 0, texto: "1. Domarlo (-30HP | +50G)", x: 27, y: 160 },
            { id: 1, texto: "2. Huir en silencio", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.hp -= 30; j.oro += 50; return { msg: "Domado con ferocidad", detalle: "-30 HP / +50 Oro", tipo: "especial" }; },
        efecto2: (j) => { return { msg: "Huiste en silencio", detalle: "Escapas sin daño", tipo: "compra" }; },
        valida1: (j) => j.hp > 30,
        msgError1: "Necesitas más de 30 HP para arriesgarte"
    },
    "1_7": {
        titulo: "EL BUFEO COLORADO",
        descripcion: "En el río Iténez emerge un delfín rosado que brilla\ncon magia ancestral. Te habla en sueños:\n'Bebe del río sagrado y recuperarás fuerzas...'",
        opciones: [
            { id: 0, texto: "1. Beber del río (+40 HP)", x: 27, y: 160 },
            { id: 1, texto: "2. Ofrendar tu oro (-15G | HP máx +5)", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.hp = Math.min(j.hpMax, j.hp + 40); return { msg: "Aguas sagradas", detalle: "+40 HP recuperados", tipo: "compra" }; },
        efecto2: (j) => { j.oro -= 15; j.hpMax += 5; j.hp += 5; return { msg: "Ofrenda al Bufeo", detalle: "-15G / HP máx +5", tipo: "especial" }; },
        valida1: (j) => true,
        valida2: (j) => j.oro >= 15,
        msgError2: "Necesitas 15G para ofrendar al Bufeo"
    },
    "1_11": {
        titulo: "RUINAS DE SAMAIPATA",
        descripcion: "El Cóndor Sagrado planea sobre el fuerte de piedra.\nUn espíritu guardián pide una ofrenda\nantes de dejarte pasar...",
        opciones: [
            { id: 0, texto: "1. Ofrenda de sangre (-20HP | +60G)", x: 27, y: 160 },
            { id: 1, texto: "2. Rezar en silencio (+20 HP)", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.hp -= 20; j.oro += 60; return { msg: "Ofrenda de sangre", detalle: "-20 HP / +60 Oro", tipo: "eventoMal" }; },
        efecto2: (j) => { j.hp = Math.min(j.hpMax, j.hp + 20); return { msg: "El Cóndor te bendice", detalle: "+20 HP recuperados", tipo: "compra" }; },
        valida1: (j) => j.hp > 20,
        msgError1: "Necesitas más de 20 HP para la ofrenda"
    },

    // ── ACTO 2: VALLES Y MINAS ───────────────────────────────────────────────
    "2_2": {
        titulo: "EL MINERO PERDIDO",
        descripcion: "Escuchas a un minero pidiendo ayuda bajo unos escombros\nen la oscuridad de la mina.\n¿Decides ayudarlo usando tus fuerzas?",
        opciones: [
            { id: 0, texto: "1. Ayudar con fuerza (-15HP | +60G)", x: 27, y: 160 },
            { id: 1, texto: "2. Ignorar y seguir (Sin costo)", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.hp -= 15; j.oro += 60; return { msg: "¡Minero Salvado!", detalle: "-15 HP / +60 Oro", tipo: "especial" }; },
        efecto2: (j) => { return { msg: "Sigues tu camino", detalle: "No pierdes nada", tipo: "compra" }; },
        valida1: (j) => j.hp > 15,
        msgError1: "Necesitas más de 15 HP para levantar los escombros"
    },
    "2_6": {
        titulo: "EL CARRUAJE ENCALLADO",
        descripcion: "Encuentras un viejo carruaje colonial espanol\nhundido en el barro del camino.\nParece abandonado pero con carga pesada.",
        opciones: [
            { id: 0, texto: "1. Fuerza bruta: sacar cofre (-10HP | +60G)", x: 27, y: 160 },
            { id: 1, texto: "2. Astucia: revisar bolsillos (+25G)", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.hp -= 10; j.oro += 60; return { msg: "Cofre Pesado Abierto", detalle: "-10 HP / +60 Oro", tipo: "especial" }; },
        efecto2: (j) => { j.oro += 25; return { msg: "Bolsillos Revisados", detalle: "+25 Oro", tipo: "compra" }; },
        valida1: (j) => j.hp > 10,
        msgError1: "Necesitas más de 10 HP para la fuerza bruta"
    },

    // ── ACTO 3: ALTIPLANO Y SALAR ────────────────────────────────────────────
    "3_4": {
        titulo: "ESPÍRITU DEL ILLIMANI",
        descripcion: "La nieve eterna del Illimani brilla en la distancia.\nUn espíritu de nieve se manifiesta ante ti.\n¿Ofreces coca o pides su bendición directa?",
        opciones: [
            { id: 0, texto: "1. Ofrecer coca (-15G | +50 HP)", x: 27, y: 160 },
            { id: 1, texto: "2. Desafiar al espíritu (-25HP | HP máx+15)", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.oro -= 15; j.hp = Math.min(j.hpMax, j.hp + 50); return { msg: "Bendición del Illimani", detalle: "-15G / +50 HP", tipo: "especial" }; },
        efecto2: (j) => { j.hp -= 25; j.hpMax += 15; return { msg: "Prueba superada", detalle: "-25 HP / HP máx +15", tipo: "eventoMal" }; },
        valida1: (j) => j.oro >= 15,
        valida2: (j) => j.hp > 25,
        msgError1: "Necesitas 15G para la ofrenda de coca",
        msgError2: "Necesitas más de 25 HP para el desafío"
    },
    "3_5": {
        titulo: "LAGO TITICACA SAGRADO",
        descripcion: "Las aguas del Titicaca brillan bajo la luna llena.\nLa isla del Sol emerge entre la niebla.\nUn anciano Tiwanakota te ofrece su sabiduría.",
        opciones: [
            { id: 0, texto: "1. Beber del lago (+50 HP)", x: 27, y: 160 },
            { id: 1, texto: "2. Donación sagrada (-20G | HP máx +20)", x: 27, y: 202 }
        ],
        efecto1: (j) => { j.hp = Math.min(j.hpMax, j.hp + 50); return { msg: "Agua sagrada del Titicaca", detalle: "+50 HP recuperados", tipo: "compra" }; },
        efecto2: (j) => { j.oro -= 20; j.hpMax += 20; j.hp += 20; return { msg: "Bendición de Viracocha", detalle: "-20G / HP máx +20", tipo: "especial" }; },
        valida1: (j) => true,
        valida2: (j) => j.oro >= 20,
        msgError2: "Necesitas 20G para la donación sagrada"
    }
};

// Fallback: Yatiri genérico para nodos de evento no mapeados
const EVENTO_YATIRI_FALLBACK = {
    titulo: "EL YATIRI DE LA SULPAYA",
    descripcion: "Encuentras a un anciano Yatiri meditando. Te mira fijamente:\n'El camino por las tierras de Bolivia es duro, joven Mamani.\nPuedo ayudarte, pero todo requiere un intercambio...'",
    opciones: [
        { id: 0, texto: "1. Recibir bendicion (Pagas 10G | +40 HP)", x: 27, y: 160 },
        { id: 1, texto: "2. Ofrenda a la Pachamama (-20 HP | +40G)", x: 27, y: 202 }
    ],
    efecto1: (j) => { j.oro -= 10; j.hp = Math.min(j.hpMax, j.hp + 40); return { msg: "Bendición del Yatiri", detalle: "+40 HP con humo de k'oa", tipo: "especial" }; },
    efecto2: (j) => { j.hp -= 20; j.oro += 40; return { msg: "Ofrenda a la Pachamama", detalle: "+40 Oro por tu sacrificio", tipo: "eventoMal" }; },
    valida1: (j) => j.oro >= 10,
    valida2: (j) => j.hp > 20,
    msgError1: "Necesitas 10G para el Yatiri",
    msgError2: "Necesitas más de 20 HP para la ofrenda"
};

// Rastrea en qué nodo está parado Mamani actualmente
let nodoActualIndex = 0;

// Estado de la Tienda
let pestanaTiendaActual = 'objetos';
let itemSeleccionadoTienda = null;

// Estructura receptora de imágenes Base64 procesadas
const imgDerrotaBase64 = "img/derrota.webp";
const imgElTioBase64 = "img/eltio.webp";
const imgHuiracochaBase64 = "img/huiracocha.webp";
const imgLoreCorrupcionBase64 = "img/lorecorrupcion.webp";
const imgLoreLlamadoBase64 = "img/lorellamado.webp";
// Cinem'atica de transicion Acto 2 -> 3 (Altiplano y Salar)
const imgCineActo3_1Base64 = "img/cine_acto3_1.webp";
const imgCineActo3_2Base64 = "img/cine_acto3_2.webp";
const imgLoreAcullicoBase64 = "img/loreacullico.webp";

const imgItemSaltenaBase64 = "img/itemsaltena.webp";
const imgItemBicarbonatoBase64 = "img/itembicarbonato.webp";
const imgItemDinamitaBase64 = "img/itemdinamita.webp";
const imgItemAlcoholBase64 = "img/itemalcohol.webp";

const imgApachetaBase64 = "img/apacheta.webp";
const imgYungasBase64 = "img/yungas.webp";
const imgKarikariBase64 = "img/karikari.webp?v=3";
const imgSupayBase64 = "img/supay.webp";
const imgMenuBase64 = "img/menu.webp";
const imgMapaBase64 = "img/mapa.webp";
const imgVictoriaBase64 = "img/victoria.webp";
const imgNgPlusBase64 = "img/ngplus.webp";
const imagenesCargadas = {};

/* ==========================================================================
   6. CONTENEDOR DE RECURSOS GRÁFICOS (BASE64)
   ========================================================================== */
// Iconos de categorías de ítems para el inventario y tiendas
const imgCategorias = {
    comida: new Image(),
    defensa: new Image(),
    ataque: new Image(),
    cura: new Image()
};
imgCategorias.comida.src = "img/cat_comida.webp";
imgCategorias.defensa.src = "img/cat_defensa.webp";
imgCategorias.ataque.src = "img/cat_ataque.webp";
imgCategorias.cura.src = "img/cat_cura.webp";

function obtenerCategoriaItem(itemId) {
    const comidas = ["saltena", "majadito", "chicha", "api", "lluchu", "locoto", "quinua", "castana", "chuño"];
    const defensas = ["bicarbonato", "copaiba", "aceiteselva", "plata", "cuero", "hoja", "aymara", "sal"];
    const ataques = ["cerbatana", "honda", "boleadora", "suri", "hacha", "machete", "dinamita"];
    const curas = ["alcohol", "unadegato", "resinaselva", "menta", "salvia", "incienso", "koa", "palo"];

    if (comidas.includes(itemId)) return "comida";
    if (defensas.includes(itemId)) return "defensa";
    if (ataques.includes(itemId)) return "ataque";
    if (curas.includes(itemId)) return "cura";

    return "comida"; // Fallback por defecto
}

const ASSETS = {
    // Fondos de los escenarios (Mockups del Salar, Amazonía, Minas...)
    fondos: {
        apacheta: imgApachetaBase64,
        yungas: imgYungasBase64,
        menu: imgMenuBase64,
        mapa: imgMapaBase64,  // Legacy fallback
        mapaActo1: "img/mapa_acto1.webp",   // Amazonía - Pando, Beni, Santa Cruz
        mapaActo2: "img/mapa_acto2.webp",   // Minas    - Cochabamba, Chuquisaca, Potosí
        mapaActo3: "img/mapa_acto3.webp",   // Salar    - La Paz, Oruro, Tarija
        derrota: imgDerrotaBase64,
        victoriaTotal: imgVictoriaBase64,
        victoriaLeyenda: imgNgPlusBase64,
        loreCorrupcion: imgLoreCorrupcionBase64,
        loreLlamado: imgLoreLlamadoBase64,
        loreAcullico: imgLoreAcullicoBase64,
        evento: "img/evento.webp",
        bgTiwanaku: "img/bg_tiwanaku.webp",
        bgOruro: "img/bg_oruro.webp?v=2",
        bgMinaInterior: "img/bg_mina_interior_v2.webp",
        bgQuirquincho: "img/bg_quirquincho.webp",
        bgViuda: "img/bg_viuda_v4.webp",
        bgJukumari: "img/bg_jukumari.webp",
        // Si tienes un fondo para el campamento, pégalo aquí. De lo contrario, usará la fogata animada por código.
        campamento: "img/campamento.webp",

        tienda: "img/tienda.webp",
        tiendaGuaya: "img/tienda_guaya.webp",
        amazonía: "img/a.webp",
        minas: "img/minas.webp",
        salarJuego: "img/salarjuego.webp",

        // Fondos temáticos y cinemáticas del Acto 1 generados
        cine_intro_1: "img/cine_intro_1.webp",
        cine_intro_2: "img/cine_intro_2.webp",
        cine_intro_3: "img/cine_intro_3.webp",
        evento_bg_3: "img/evento_bg_3.webp",
        evento_bg_7: "img/evento_bg_7.webp",
        evento_bg_11: "img/evento_bg_11.webp",
        camp_bg_2: "img/camp_bg_2.webp",
        camp_bg_6: "img/camp_bg_6.webp",
        camp_bg_9: "img/camp_bg_9.webp",
        // Fondos temáticos del Acto 2 generados
        evento_bg_2_2: "img/evento_bg_2_2.webp",
        camp_bg_2_5: "img/camp_bg_2_5.webp",
        evento_bg_2_6: "img/evento_bg_2_6.webp",
        tienda_bg_2_8: "img/tienda_bg_2_8.webp",

        // Cinemática de transición Acto 1 → 2 (Valles y Minas de Potosí)
        cine_acto2_1: imgCineActo2_1Base64,
        cine_acto2_2: imgCineActo2_2Base64,
        cine_acto2_3: imgCineActo2_3Base64,

        // Cinemática de transición Acto 2 → 3 (Altiplano y Salar de Uyuni)
        cine_acto3_1: imgCineActo3_1Base64,
        cine_acto3_2: imgCineActo3_2Base64
    },

    // Sprites de personajes y enemigos
    personajes: {
        // Mamani — sprites de animación
        yatiriPortrait: "img/yatiri_portrait.webp",
        mamani: "img/mamani.webp",
        mamaniOfensivo: "img/mamani_offensive.webp",
        mamaniDefensivo: "img/mamani_defensive.webp",
        mamaniHerido: "img/mamani_hurt.webp",
        mamaniBuff: "img/mamani_buff.webp",
        mamaniDebuff: "img/mamani_debuff.webp",
        mamaniElemental: "img/mamani_elemental.webp",
        // Quirquincho — sprites de animación
        quirquincho: "img/quirquincho.webp",
        quirquinchoAtaque: "img/quirquincho_attack.webp",
        quirquinchoDefensivo: "img/quirquincho_defensive.webp",
        quirquinchoHerido: "img/quirquincho_hurt.webp",
        quirquinchoOfensivo: "img/quirquincho_offensive.webp",
        quirquinchoEscudo: "img/quirquincho_shield.webp",
        // Mini-bosses Acto 3
        monolito: "img/monolito.webp",
        monolitoAtaque: "img/monolito_attack.webp",
        monolitoDefensa: "img/monolito_defense.webp",
        monolitoHerido: "img/monolito_hurt.webp",
        monolitoMuerte: "img/monolito_death.webp",
        arcangel: "img/arcangel.webp",
        arcangelAtaque: "img/arcangel_attack.webp",
        arcangelDefensa: "img/arcangel_defense.webp",
        arcangelHerido: "img/arcangel_hurt.webp",
        arcangelMuerte: "img/arcangel_death.webp",
        // Jefe Final Acto 3
        huiracocha: "img/huiracocha.webp?v=3",
        huiracochaAtaque: "img/huiracocha_attack.webp?v=3",
        huiracochaDefensa: "img/huiracocha_defense.webp?v=3",
        huiracochaHerido: "img/huiracocha_hurt.webp?v=3",
        huiracochaMuerte: "img/huiracocha_death.webp?v=3",
        // Otros enemigos
        jichi: "img/jichi_normal.webp",
        jichiAtaque: "img/jichi_ataque.webp",
        jichiHerido: "img/jichi_herido.webp",
        jichiDefensa: "img/jichi_defensa.webp",
        jichiMuerte: "img/jichi_muerte.webp",
        reliquiaJichi: "img/reliquia_jichi.webp",
        reliquiaTio: "img/reliquia_tio.webp",
        reliquiaHuiracocha: "img/reliquia_huiracocha.webp",
        // Mini-bosses Acto 1: Amazonia
        guajojo: "img/guajojo.webp?v=4",
        guajojoAtaque: "img/guajojo_attack.webp?v=4",
        guajojoHerido: "img/guajojo_hurt.webp?v=4",
        guajojoDefensa: "img/guajojo_defense.webp?v=4",
        guajojoMuerte: "img/guajojo_muerte.webp",
        mapinguari: "img/mapinguari.webp?v=4",
        mapinguariAtaque: "img/mapinguari_attack.webp?v=4",
        mapinguariHerido: "img/mapinguari_hurt.webp?v=4",
        mapinguariDefensa: "img/mapinguari_defense.webp?v=4",
        mapinguariMuerte: "img/mapinguari_muerte.webp",
        duende: "img/duende.webp?v=4",
        duendeAtaque: "img/duende_attack.webp?v=4",
        duendeHerido: "img/duende_hurt.webp?v=4",
        duendeDefensa: "img/duende_defense.webp?v=4",
        duendeMuerte: "img/duende_muerte.webp",
        tio: "img/tio_normal.webp?v=3",
        tioAtaque: "img/tio_ataque.webp?v=3",
        tioHerido: "img/tio_herido.webp?v=3",
        tioDefensa: "img/tio_defensa.webp?v=3",
        tioMuerte: "img/tio_muerte.webp?v=3",
        huiracocha: imgHuiracochaBase64,
        // Karikari — sprites de animación
        karikari: imgKarikariBase64,
        karikariAtaque: "img/karikari_attack.webp",
        karikariHerido: "img/karikari_hurt.webp",
        karikariDefensa: "img/karikari_defense.webp",
        karikariMuerte: "img/karikari_death.webp",
        // El Jukumari — sprites de animación
        jukumari: "img/jukumari.webp",
        jukumariAtaque: "img/jukumari_attack.webp",
        jukumariHerido: "img/jukumari_hurt.webp",
        jukumariDefensa: "img/jukumari_defense.webp",
        jukumariMuerte: "img/jukumari_death.webp",
        // La Viuda — sprites de animación
        viuda: "img/viuda.webp",
        viudaAtaque: "img/viuda_attack.webp",
        viudaHerida: "img/viuda_hurt.webp",
        viudaDefensa: "img/viuda_defense.webp",
        viudaMuerte: "img/viuda_death.webp",
        // Quirquincho muerte
        quirquinchoMuerte: "img/quirquincho_death.webp",
        supay: imgSupayBase64
    },

    // Iconos de las cartas por categoría
    cartas: {
        ataque: "img/cat_ataque.webp",
        defensa: "img/cat_defensa.webp",
        mejora: "img/cat_cura.webp",
        fuego: "img/fuego.webp",
        agua: "img/agua.webp",
        // Sprites únicos de cartas:
        "Machete Zafrero": "img/machete_zafrero.webp",
        "Escudo de Cuero": "img/escudo_cuero.webp",
        "Torrente Jichi": "img/torrente_jichi.webp",
        "Llama del Ekeko": "img/llama_ekeko.webp",
        "Coca Ancestral": "img/coca_ancestral.webp",
        "Brebaje Sabio": "img/brebaje_sabio.webp",
        "Mal de Ojo": "img/mal_de_ojo.webp",
        "Susurro del Yatiri": "img/susurro_yatiri.webp",
        "Golpe Certero": "img/golpe_certero.webp",
        "Casco Minero": "img/casco_minero.webp",
        "Escudo Titicaca": "img/escudo_titicaca.webp",
        "Fuerza del Jichi": "img/fuerza_jichi.webp",
        "Poder Pachamama": "img/poder_pachamama.webp",
        "Chakana Eterna": "img/chakana_eterna.webp",
        "Dinamita": "img/dinamita.webp",
        "Ira del Ekeko": "img/ira_ekeko.webp",
        "Rezo Sagrado": "img/rezo_sagrado.webp"
    },
    // Items de tienda
    items: {
        salteña: "",
        coca: "",
        machete: ""
    }
};



/* ==========================================================================
   7. PROCESO DE CARGA DE IMÁGENES
   ========================================================================== */
// Esta función toma tus Base64 y los convierte en objetos Image de JS para el Canvas
function cargarGraficos(callback) {
    let totalRecursos = 0;
    let recursosCargados = 0;

    // Contamos cuántas imágenes necesitamos cargar
    for (let categoria in ASSETS) {
        totalRecursos += Object.keys(ASSETS[categoria]).length;
    }

    // Si no hay imágenes Base64 cargadas todavía, iniciamos directo
    if (totalRecursos === 0) {
        callback();
        return;
    }

    // Cargamos cada imagen una por una
    for (let categoria in ASSETS) {
        imagenesCargadas[categoria] = {};
        for (let key in ASSETS[categoria]) {
            const src = ASSETS[categoria][key];

            if (src === "") {
                // Si el Base64 está vacío, simulamos que cargó para no romper el juego
                recursosCargados++;
                if (recursosCargados === totalRecursos) callback();
                continue;
            }

            const img = new Image();

            // Si la imagen falla, registramos el error pero sumamos al contador para no bloquear el inicio
            img.onerror = (err) => {
                console.error("Error al cargar el asset: " + key, err);
                recursosCargados++;
                if (recursosCargados === totalRecursos) {
                    callback();
                }
            };

            img.onload = () => {
                recursosCargados++;
                if (recursosCargados === totalRecursos) {
                    callback(); // Arranca el juego cuando todas estén listas
                }
            };

            img.src = src;
            imagenesCargadas[categoria][key] = img;
        }
    }
}
/* ==========================================================================
   8. BUCLE PRINCIPAL DE RENDERIZADO (GAME LOOP)
   ========================================================================== */

/* ==========================================================================
   CINEMATICA (LORE)
   ========================================================================== */


function gameLoop() {
    // Limpiamos el Canvas en cada fotograma
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Por defecto, asumimos cursor normal
    canvas.style.cursor = 'default';

    // DESACTIVAR SUAVIZADO (Pixel Art nítido)
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // ==========================================
    // CONTROL AUTOMÁTICO DE INTERFAZ HTML
    // ==========================================
    const hudElement = document.getElementById('hud-ui');
    const nodosUiElement = document.getElementById('nodos-ui');

    const menuPausaAbierto =
        (document.getElementById('pause-menu-ui') && document.getElementById('pause-menu-ui').style.display === 'flex') ||
        (document.getElementById('equipamiento-ui') && document.getElementById('equipamiento-ui').style.display === 'flex') ||
        (document.getElementById('mazo-ui') && document.getElementById('mazo-ui').style.display === 'flex') ||
        (document.getElementById('stats-ui') && document.getElementById('stats-ui').style.display === 'flex');

    let enDialogoTutorial = (actoActual === 0 && [0, 1, 3, 5, 6, 8].includes(mapaTutorialPaso));
    if (estadoActual === ESTADOS.MAPA && !menuPausaAbierto && !enDialogoTutorial) {
        // Solo en el mapa mostramos el HUD de progreso y las etiquetas de los nodos (si no hay menús abiertos)
        if (hudElement) hudElement.style.display = 'flex';
        if (nodosUiElement) nodosUiElement.style.display = 'block';
    } else {
        // En COMBATE, TIENDA, EVENTO, MENU, GAMEOVER, o MENÚS DE PAUSA ocultamos todo el HUD
        if (hudElement) hudElement.style.display = 'none';
        if (nodosUiElement) {
            nodosUiElement.style.display = 'none';
            nodosUiElement.innerHTML = ""; // Limpiamos los nodos para cuando regresemos
        }
    }

    // ── Sincronizar música con el estado actual ──────────────────────────
    sistemaAudio.reproducirMusica(estadoActual);

    // Evaluamos en qué pantalla estamos y dibujamos en consecuencia
    switch (estadoActual) {
        case ESTADOS.MENU:
            dibujarPantallaMenu();
            break;
        case ESTADOS.CUTSCENE:
            dibujarCutscene();
            break;
        case ESTADOS.TUTORIAL:
            dibujarTutorial();
            break;
        case ESTADOS.MAPA:
            dibujarPantallaMapa();
            break;
        case ESTADOS.COMBATE:
            dibujarPantallaCombate();
            break;
        case ESTADOS.TIENDA:
            dibujarPantallaTienda();
            break;
        case ESTADOS.RECOMPENSA:
            dibujarPantallaRecompensa();
            break;
        case ESTADOS.VICTORIA:
            dibujarPantallaVictoria();
            break;
        case ESTADOS.TUTORIAL_COMPLETO:
            dibujarTutorialCompleto();
            break;
        case ESTADOS.EVENTO:
            dibujarPantallaEvento();
            break;
        case ESTADOS.CAMPAMENTO:
            dibujarPantallaCampamento();
            break;
        case ESTADOS.GAMEOVER:
            dibujarPantallaGameOver();
            break;
        case ESTADOS.VICTORIA_TOTAL:
            dibujarPantallaVictoriaTotal();
            break;
    }

    // Dibuja el diálogo de confirmación por encima de todo (si hay uno activo)
    dibujarConfirmacion();

    // Dibuja el toast por encima de cualquier pantalla si hay uno activo
    dibujarToast();

    // Dibuja el botón de mute siempre visible (esquina inferior derecha)
    dibujarBotonMute();

    // Solicita al navegador renderizar el siguiente fotograma (60 FPS)
    requestAnimationFrame(gameLoop);
}

/* ==========================================================================
   9. FUNCIONES DE DIBUJO TEMPORALES (Sustituyen las imágenes vacías)
   ========================================================================== */
function dibujarPantallaMenu() {
    // De momento dibujamos un fondo gris oscuro provisional
    ctx.fillStyle = "#1e1e28";
    ctx.fillRect(0, 0, 480, 270);

    // Si ya pusiste tu Base64 en fondos.menu, lo dibujará automáticamente
    if (imagenesCargadas.fondos && imagenesCargadas.fondos.menu) {
        ctx.drawImage(imagenesCargadas.fondos.menu, 0, 0, 480, 270);
    }
}

/* ==========================================================================
   CUTSCENE — Pantalla de Historia Narrativa
   ========================================================================== */
function dibujarCutscene() {
    const ahora = performance.now();
    const delta = ahora - cutsceneUltimoTick;
    cutsceneUltimoTick = ahora;

    const slide = CUTSCENE_SLIDES[cutsceneSlideActual];

    // ── FONDO CON IMAGEN DE CINEMÁTICA / DEGRADADO FALLBACK ──────────────
    const imgCine = imagenesCargadas.fondos && imagenesCargadas.fondos[slide.imgKey];
    if (imgCine && imgCine.complete && imgCine.naturalWidth !== 0) {
        ctx.drawImage(imgCine, 0, 0, 480, 270);
    } else {
        const grad = ctx.createLinearGradient(0, 0, 480, 270);
        grad.addColorStop(0, slide.colorFondo1);
        grad.addColorStop(1, slide.colorFondo2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 480, 270);
    }

    // Partículas de fondo (estrellitas/polvo) — solo si no hay imagen activa
    ctx.fillStyle = imgCine && imgCine.complete && imgCine.naturalWidth !== 0
        ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)";
    const seed = cutsceneSlideActual * 137;
    for (let i = 0; i < 40; i++) {
        const px = ((seed + i * 73) % 480);
        const py = ((seed + i * 53) % 270);
        const pr = (i % 3 === 0) ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
    }

    // ── BARRA SUPERIOR E INFERIOR (Estilo cinemático) ──────────────────
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, 480, 45);      // Barra superior
    ctx.fillRect(0, 225, 480, 45);    // Barra inferior

    // ── NÚMERO DE SLIDE (esquina superior derecha) ──────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "4px 'Press Start 2P'";
    ctx.textAlign = "right";
    ctx.fillText((cutsceneSlideActual + 1) + " / " + CUTSCENE_SLIDES.length, 472, 12);
    ctx.textAlign = "left";

    // ── LÍNEA DECORATIVA COLOREADA ───────────────────────────────────────
    ctx.strokeStyle = slide.acento;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 44);
    ctx.lineTo(460, 44);
    ctx.stroke();

    // ── Sombra de texto para legibilidad sobre imágenes ──────────────────

    // ── TYPEWRITER: TÍTULO ──────────────────────────────────────────────
    if (cutsceneTituloIndex < slide.titulo.length) {
        cutsceneTimer += delta;
        if (cutsceneTimer >= TYPEWRITER_VELOCIDAD) {
            cutsceneTimer = 0;
            cutsceneTituloIndex++;
        }
    } else if (cutsceneCharIndex < slide.texto.length) {
        // Solo empezamos el texto cuando el título terminó
        cutsceneTimer += delta;
        if (cutsceneTimer >= TYPEWRITER_VELOCIDAD * 0.6) {
            cutsceneTimer = 0;
            cutsceneCharIndex++;
        }
    }

    const tituloVisible = slide.titulo.substring(0, cutsceneTituloIndex);
    ctx.fillStyle = slide.acento;
    ctx.font = "10px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText(tituloVisible, 240, 28);
    ctx.textAlign = "left";

    // ── TYPEWRITER: TEXTO NARRATIVO (con salto de línea automático y contorno) ─────
    const textoVisible = slide.texto.substring(0, cutsceneCharIndex);
    ctx.font = "5.5px 'Press Start 2P'";

    // Dividir en líneas de ~42 caracteres
    const palabras = textoVisible.split(" ");
    let lineas = [];
    let lineaActual = "";
    const maxCaracteresPorLinea = 38;
    palabras.forEach(palabra => {
        if ((lineaActual + " " + palabra).trim().length <= maxCaracteresPorLinea) {
            lineaActual = (lineaActual + " " + palabra).trim();
        } else {
            if (lineaActual) lineas.push(lineaActual);
            lineaActual = palabra;
        }
    });
    if (lineaActual) lineas.push(lineaActual);

    // Dibujar contorno negro grueso primero
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    lineas.forEach((linea, i) => {
        ctx.strokeText(linea, 24, 75 + (i * 18));
    });

    // Dibujar texto de relleno blanco brillante encima
    ctx.fillStyle = "#ffffff";
    lineas.forEach((linea, i) => {
        ctx.fillText(linea, 24, 75 + (i * 18));
    });

    // ── CURSOR PARPADEANTE (mientras escribe) ───────────────────────────
    if (cutsceneCharIndex < slide.texto.length) {
        const cursorVisible = Math.floor(ahora / 400) % 2 === 0;
        if (cursorVisible && lineas.length > 0) {
            const ultimaLinea = lineas[lineas.length - 1];
            const medidaTexto = ctx.measureText(ultimaLinea).width;
            ctx.fillStyle = slide.acento;
            ctx.fillRect(24 + medidaTexto + 2, 67 + (lineas.length - 1) * 18, 4, 7);
        }
    }

    // ── INDICADOR "TOCA PARA CONTINUAR" (solo cuando terminó el texto) ──
    if (cutsceneCharIndex >= slide.texto.length && cutsceneTituloIndex >= slide.titulo.length) {
        const parpadeo = Math.floor(ahora / 500) % 2 === 0;
        if (parpadeo) {
            ctx.fillStyle = slide.acento;
            ctx.font = "4.5px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText("▶  TOCA PARA CONTINUAR", 240, 240);
            ctx.textAlign = "left";
        }
    }

    // ── NOMBRE DEL JUEGO (esquina inferior izquierda) ─────────────────── // Restaurar sombra
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "3.5px 'Press Start 2P'";
    ctx.fillText("LA SENDA DE MAMANI", 20, 260);
}

/* ==========================================================================
   TUTORIAL COMPLETO — Pantalla de felicitación in-canvas
   ========================================================================== */
function dibujarTutorialCompleto() {
    // Fondo oscuro elegante
    const grad = ctx.createLinearGradient(0, 0, 0, 270);
    grad.addColorStop(0, "#0a1628");
    grad.addColorStop(1, "#1a0e2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);

    // Estrellas decorativas animadas
    const t = Date.now() / 800;
    const estrellas = [
        [60, 30], [140, 20], [240, 15], [350, 25], [430, 18], [80, 250], [200, 260], [320, 255], [420, 245],
        [30, 130], [460, 110], [120, 140], [390, 150]
    ];
    estrellas.forEach(function (s, i) {
        const brillo = 0.4 + 0.5 * Math.abs(Math.sin(t + i * 0.7));
        ctx.fillStyle = "rgba(255, 220, 80, " + brillo + ")";
        ctx.fillRect(s[0], s[1], 2, 2);
    });

    // Icono central: estrella grande
    ctx.save();
    ctx.fillStyle = "#f1c40f";
    ctx.font = "28px serif";
    ctx.textAlign = "center";
    ctx.fillText("★", 240, 70);
    ctx.restore();

    // Título principal
    ctx.fillStyle = "#ffcc00";
    ctx.font = "10px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("¡ENTRENAMIENTO COMPLETADO!", 240, 105);

    // Subttulo
    ctx.fillStyle = "#e0e0e0";
    ctx.font = "5.5px 'Press Start 2P'";
    ctx.fillText("Has aprendido lo básico, Mamani.", 240, 125);

    // Mensaje principal
    ctx.fillStyle = "#a8d8a8";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText("Aquí comienza tu verdadero viaje.", 240, 150);

    // Descripción del mapa
    ctx.fillStyle = "#888888";
    ctx.font = "4px 'Press Start 2P'";
    ctx.fillText("Tus cartas volverán al estado inicial.", 240, 175);
    ctx.fillText("¡Adéntrate en la Amazonía!", 240, 187);

    // Botón de continuar (parpadeo)
    const parpadeoContinuar = Math.floor(t * 2) % 2 === 0;
    if (parpadeoContinuar) {
        ctx.fillStyle = "#ffcc00";
        ctx.font = "5px 'Press Start 2P'";
        ctx.fillText("- Haz clic para continuar -", 240, 240);
    }

    ctx.textAlign = "left";
}

/* ==========================================================================
   TUTORIAL — Combate interactivo guiado
   ========================================================================== */
function dibujarTutorial() {
    // El tutorial usa la pantalla de combate como base
    dibujarPantallaCombate();

    const paso = TUTORIAL_PASOS[tutorialPasoActual];
    if (!paso) return;

    const ahora = performance.now();

    // ── OVERLAY SEMITRANSPARENTE Y SPOTLIGHT (Rendimiento optimizado) ─────
    let sp = null;
    let lineasVisuales = paso.lineas;

    if (paso.spotlight) {
        sp = { ...paso.spotlight };
        // Fase 2 de selección en el tutorial (carta levantada)
        if (paso.accion === "JUGAR_OFENSIVA" && cartaSeleccionadaIndex === 0) {
            sp.y -= 20; // Sube junto con la carta
            lineasVisuales = [
                "¡Bien! La carta esta seleccionada.",
                "TOCALA OTRA VEZ para confirmar",
                "y atacar al enemigo."
            ];
        } else if (paso.accion === "JUGAR_DEFENSIVA" && cartaSeleccionadaIndex === 1) {
            sp.y -= 20; // Sube junto con la carta
            lineasVisuales = [
                "¡Bien! La carta esta seleccionada.",
                "TOCALA OTRA VEZ para confirmar",
                "y activar tu escudo."
            ];
        }
    }

    if (paso.tipo !== "LIBRE") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.beginPath();
        ctx.rect(0, 0, 480, 270);
        if (sp) {
            // Recortamos el spotlight usando rect en dirección opuesta (o regla evenodd)
            ctx.rect(sp.x + sp.w, sp.y, -sp.w, sp.h);
        }
        ctx.fill("evenodd");
    }

    // ── EFECTOS VISUALES DEL SPOTLIGHT (Solo si existe) ───────────────────
    if (sp) {
        ctx.strokeStyle = paso.color || "#ffcc00";
        ctx.lineWidth = 2;
        ctx.strokeRect(sp.x, sp.y, sp.w, sp.h);

        // Flecha animada
        tutorialFlechaAnim += 0.08;
        const flechaX = sp.x + sp.w / 2;
        const flechaY = sp.y - 15 + Math.sin(tutorialFlechaAnim) * 5;

        ctx.fillStyle = paso.color || "#ffcc00";
        ctx.beginPath();
        ctx.moveTo(flechaX, flechaY + 10);
        ctx.lineTo(flechaX - 6, flechaY);
        ctx.lineTo(flechaX + 6, flechaY);
        ctx.closePath();
        ctx.fill();
    }

    // ── LÓGICA DE AUTO-AVANCE PARA INFO Y MISION ─────────────────────────
    // ── ELIMINADO: AUTO-AVANCE PARA INFO Y MISION ─────────────────────────
    // El usuario avanzará haciendo clic en su lugar.

    // ── DIBUJAR PANELES SEGÚN EL TIPO DE PASO ─────────────────────────────
    if (paso.tipo === "INFO" || paso.tipo === "MISION") {
        // Panel Central Grande
        const panelW = 340;
        const panelH = 100;
        const panelX = (480 - panelW) / 2;
        const panelY = (270 - panelH) / 2;

        ctx.fillStyle = "rgba(15, 15, 25, 0.95)";
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = paso.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = paso.color;
        ctx.font = paso.tipo === "MISION" ? "12px 'Press Start 2P'" : "8px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(paso.titulo, 240, panelY + 25);

        ctx.fillStyle = "#ffffff";
        ctx.font = "6px 'Press Start 2P'";
        lineasVisuales.forEach((linea, i) => {
            ctx.fillText(linea, 240, panelY + 45 + (i * 12));
        });

        ctx.textAlign = "left";

        // Barra de progreso (para saber cuánto falta para que avance)
        const tiempoTranscurrido = ahora - tutorialAutoStart;
        const progreso = Math.min(1, tiempoTranscurrido / paso.duracion);
        ctx.fillStyle = paso.color;
        ctx.fillRect(panelX, panelY + panelH - 2, panelW * progreso, 2);

    } else if (paso.tipo === "ACCION" || paso.tipo === "LIBRE") {
        // Calcular alpha para que el banner se desvanezca en el paso LIBRE
        let alpha = 1;
        if (paso.tipo === "LIBRE") {
            const tiempoTranscurrido = ahora - tutorialAutoStart;
            if (tiempoTranscurrido > 4000) {
                alpha = Math.max(0, 1 - (tiempoTranscurrido - 4000) / 1000);
            }
        }

        if (alpha > 0) {
            ctx.save();
            ctx.globalAlpha = alpha;

            // Panel Superior Pequeño
            const panelH = 50;
            ctx.fillStyle = "rgba(10, 10, 20, 0.92)";
            ctx.fillRect(0, 0, 480, panelH);
            ctx.strokeStyle = paso.color;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, panelH); ctx.lineTo(480, panelH); ctx.stroke();

            ctx.fillStyle = paso.color;
            ctx.font = "7px 'Press Start 2P'";
            ctx.fillText(paso.titulo, 20, 16);

            ctx.fillStyle = "#ffffff";
            ctx.font = "5px 'Press Start 2P'";
            lineasVisuales.forEach((linea, i) => {
                ctx.fillText(linea, 20, 30 + (i * 10));
            });

            ctx.restore();
        }

        // Progreso general del tutorial (puntos)
        for (let i = 0; i < TUTORIAL_PASOS.length; i++) {
            const px = 430 + i * 4;
            const py = 10;
            ctx.fillStyle = (i <= tutorialPasoActual) ? paso.color : "rgba(255,255,255,0.2)";
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
        }
    }
}

function dibujarPantallaMapa() {
    // Fondo del mapa: diferente por acto
    const f = imagenesCargadas.fondos;
    const mapasPorActo = { 1: f && f.mapaActo1, 2: f && f.mapaActo2, 3: f && f.mapaActo3 };
    const mapaFondo = mapasPorActo[actoActual] || (f && f.mapa);

    if (mapaFondo && mapaFondo.complete && mapaFondo.naturalWidth !== 0) {
        ctx.drawImage(mapaFondo, 0, 0, 480, 270);
        // Capa semi-transparente oscura para legibilidad de los nodos
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(0, 0, 480, 270);
    } else {
        // Fallback por acto si la imagen no cargó
        const coloresFallback = { 1: "#1a3320", 2: "#2a1a0e", 3: "#0d0d2b" };
        ctx.fillStyle = coloresFallback[actoActual] || "#121218";
        ctx.fillRect(0, 0, 480, 270);
    }

    // Dibujar líneas de conexión entre nodos (TEMPORALMENTE DESACTIVADO A PETICIÓN DE USUARIO)
    /*
    nodosMapa.forEach(nodo => {
        if (!nodo.conexiones) return;
        nodo.conexiones.forEach(destId => {
            const dest = nodosMapa[destId];
            if (!dest) return;

            const desbloqueada = nodo.completado || nodo.disponible;
            
            // Calcular el punto medio
            const midX = (nodo.x + dest.x) / 2;
            const midY = (nodo.y + dest.y) / 2;
            
            // Calcular el vector de dirección y su perpendicular para el offset de la curva
            const dx = dest.x - nodo.x;
            const dy = dest.y - nodo.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Curvatura suave: variamos el control point desplazándolo en perpendicular
            const factorCurva = 0.15;
            const cpX = midX - (dy / dist) * (dist * factorCurva);
            const cpY = midY + (dx / dist) * (dist * factorCurva);

            ctx.save();
            
            // Sombra / borde exterior del camino
            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(nodo.x, nodo.y);
            ctx.quadraticCurveTo(cpX, cpY, dest.x, dest.y);
            ctx.stroke();

            // Sendero interior
            ctx.strokeStyle = desbloqueada ? "#ffcc00" : "#555566";
            ctx.lineWidth = 1.5;
            ctx.setLineDash(desbloqueada ? [] : [3, 3]);
            ctx.beginPath();
            ctx.moveTo(nodo.x, nodo.y);
            ctx.quadraticCurveTo(cpX, cpY, dest.x, dest.y);
            ctx.stroke();
            
            ctx.restore();
        });
    });
    */

    // Dibujar cada uno de los nodos
    nodosMapa.forEach((nodo, index) => {
        // El tamaño del círculo del nodo (más pequeño para encajar sobre los puntos dorados)
        const radioNodo = 6;

        // Detectar si el cursor está sobre el nodo
        const dx = mouseX - nodo.x;
        const dy = mouseY - nodo.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hover = dist <= radioNodo;
        const esReintento = (index === nodoActualIndex && !nodo.completado);
        const interactuable = nodo.disponible || esReintento;

        let renderRadio = radioNodo;
        if (hover && interactuable) {
            canvas.style.cursor = "pointer";
            renderRadio = radioNodo + 2; // Crece al pasar el cursor
        }

        // Color del círculo según su estado
        if (nodo.completado) {
            ctx.fillStyle = "#2ecc71"; // Verde si ya pasaste por ahí
        } else if (interactuable) {
            ctx.fillStyle = hover ? "#fffb00" : "#ffcc00"; // Amarillo más brillante con hover
        } else {
            ctx.fillStyle = "#34495e"; // Gris si está bloqueado todavía
        }

        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, renderRadio, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hover && interactuable ? "#ff9f43" : "#ffffff";
        ctx.lineWidth = hover && interactuable ? 2 : 1;
        ctx.stroke();

        // Etiqueta tipo (encima del nodo)
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "4px 'Press Start 2P'";
        const labelTipo = nodo.label || nodo.tipo;
        ctx.fillText(labelTipo, nodo.x - (labelTipo.length * 2.3), nodo.y - renderRadio - 4);
        ctx.restore();
    });

    // Dibujar a Mamani (indicador visual) en su nodo actual
    const nodoActual = nodosMapa[nodoActualIndex];
    ctx.fillStyle = "#e6005c"; // Magenta llamativo para ubicar al jugador
    ctx.fillRect(nodoActual.x - 4, nodoActual.y - 4, 8, 8);

    // ==========================================
    // ACTUALIZACIÓN DINÁMICA DEL HUD HTML (LETRAS PERFECTAS)
    // ==========================================
    const hudTexto = document.getElementById('hud-texto');
    let nombreBioma = "";
    let colorBioma = "#2ecc71"; // Verde por defecto

    if (actoActual === 1) {
        nombreBioma = "ACTO 1: AMAZONÍA";
        colorBioma = "#2ecc71";
    } else if (actoActual === 2) {
        nombreBioma = "ACTO 2: VALLES Y MINAS DE POTOSÍ";
        colorBioma = "#e67e22";
    } else if (actoActual === 3) {
        nombreBioma = "ACTO 3: SALAR CÓSMICO";
        colorBioma = "#9b59b6";
    }

    // ── TUTORIAL DEL MAPA (ACTO 0) ────────────────────────────────────
    if (actoActual === 0) {
        if (nodosMapa[1] && !nodosMapa[1].completado) {
            if (mapaTutorialPaso < 0) mapaTutorialPaso = 0;
            if (mapaTutorialPaso === 0) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                ctx.fillRect(0, 0, 480, 270);
                dibujarDialogoRPG(null, "Yatiri", "BIENVENIDO A ESTA AVENTURA. TÚ ERES MAMANI Y DEBES RECORRER ESTE CAMINO.", true);
            } else if (mapaTutorialPaso === 1) {
                // Spotlight on combat node
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, 480, 270);
                const nodoCombate = nodosMapa[1];
                ctx.arc(nodoCombate.x, nodoCombate.y, 25, 0, Math.PI * 2, true);
                ctx.clip();
                ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                ctx.fillRect(0, 0, 480, 270);
                ctx.restore();

                // Yellow ring
                ctx.strokeStyle = "#f1c40f";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 2]);
                ctx.beginPath();
                ctx.arc(nodoCombate.x, nodoCombate.y, 25, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                dibujarDialogoRPG(null, "Yatiri", "EL COMBATE SIRVE PARA GANAR MONEDAS Y ES DE MUCHA AYUDA PARA PROBAR TUS HABILIDADES.", true);
            } else {
                // mapaTutorialPaso >= 2
                // Just an arrow pointing to it
                const nodoCombate = nodosMapa[1];
                ctx.fillStyle = "#f1c40f";
                ctx.font = "6px 'Press Start 2P'";
                ctx.fillText("▼", nodoCombate.x - 4, nodoCombate.y - 15);
            }
        } else if (nodosMapa[2] && !nodosMapa[2].completado) {
            // Tienda tutorial
            if (mapaTutorialPaso < 3) mapaTutorialPaso = 3;
            if (mapaTutorialPaso === 3) {
                // Spotlight on store node
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, 480, 270);
                const nodoTienda = nodosMapa[2];
                ctx.arc(nodoTienda.x, nodoTienda.y, 25, 0, Math.PI * 2, true);
                ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                ctx.fill();
                ctx.restore();

                // Yellow ring
                ctx.strokeStyle = "#f1c40f";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 2]);
                ctx.beginPath();
                ctx.arc(nodoTienda.x, nodoTienda.y, 25, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                dibujarDialogoRPG(null, "Yatiri", "¡BUEN TRABAJO! AHORA ENTRA A LA TIENDA PARA PREPARARTE.", true);
            } else if (mapaTutorialPaso === 4) {
                const nodoTienda = nodosMapa[2];
                ctx.fillStyle = "#f1c40f";
                ctx.font = "6px 'Press Start 2P'";
                ctx.fillText("▼", nodoTienda.x - 4, nodoTienda.y - 15);
            }
        } else if (nodosMapa[5] && !nodosMapa[5].completado) {
            if ((nodosMapa[3] && nodosMapa[3].completado) || (nodosMapa[4] && nodosMapa[4].completado)) {
                // Tutorial step 8 (Boss)
                if (mapaTutorialPaso < 8) mapaTutorialPaso = 8;
                if (mapaTutorialPaso === 8) {
                    // Spotlight Boss
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, 480, 270);
                    const nodoJefe = nodosMapa[5];
                    ctx.arc(nodoJefe.x, nodoJefe.y, 25, 0, Math.PI * 2, true);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.fill();
                    ctx.restore();

                    // Yellow ring around Boss
                    ctx.strokeStyle = "#f1c40f";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.beginPath();
                    ctx.arc(nodoJefe.x, nodoJefe.y, 25, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    dibujarDialogoRPG(null, "Yatiri", "AHORA BATALLA CONTRA EL JEFE Y EXPLORA EL MUNDO CON BATALLAS. USAR LA TIENDA Y LOS CAMPAMENTOS O EVENTOS ES TOTALMENTE TU ELECCION. ¡SUERTE!", true, false);
                } else {
                    // mapaTutorialPaso >= 9
                    const nodoJefe = nodosMapa[5];
                    ctx.fillStyle = "#f1c40f";
                    ctx.font = "6px 'Press Start 2P'";
                    ctx.fillText("▼", nodoJefe.x - 4, nodoJefe.y - 15);
                }
            } else {
                if (mapaTutorialPaso < 5) mapaTutorialPaso = 5;
                if (mapaTutorialPaso === 5) {
                    // Spotlight on Campamento
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, 480, 270);
                    const nodoCamp = nodosMapa[3];
                    ctx.arc(nodoCamp.x, nodoCamp.y, 25, 0, Math.PI * 2, true);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.fill();
                    ctx.restore();

                    // Yellow ring around Campamento
                    ctx.strokeStyle = "#f1c40f";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.beginPath();
                    ctx.arc(nodoCamp.x, nodoCamp.y, 25, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    dibujarDialogoRPG(null, "Yatiri", "ESTE ES EL CAMPAMENTO. AQUI PODRAS DESCANSAR PARA RECUPERAR SALUD O MEJORAR TUS CARTAS.", true, false);
                } else if (mapaTutorialPaso === 6) {
                    // Spotlight on Evento
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, 480, 270);
                    const nodoEvento = nodosMapa[4];
                    ctx.arc(nodoEvento.x, nodoEvento.y, 25, 0, Math.PI * 2, true);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.fill();
                    ctx.restore();

                    // Yellow ring around Evento
                    ctx.strokeStyle = "#f1c40f";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.beginPath();
                    ctx.arc(nodoEvento.x, nodoEvento.y, 25, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    dibujarDialogoRPG(null, "Yatiri", "Y ESTE ES UN EVENTO. PUEDEN HABER MISTERIOS O PELIGROS. ¡ELIGE BIEN TU RUTA!", true, true);
                } else {
                    // mapaTutorialPaso >= 7
                    const nodoCamp = nodosMapa[3];
                    const nodoEvento = nodosMapa[4];
                    ctx.fillStyle = "#f1c40f";
                    ctx.font = "6px 'Press Start 2P'";
                    ctx.fillText("▼", nodoCamp.x - 4, nodoCamp.y - 15);
                    ctx.fillText("▼", nodoEvento.x - 4, nodoEvento.y - 15);
                }
            }
        }
    }

    // Actualiza el contenedor HTML que flota encima del canvas
    hudTexto.innerHTML = `
        <span style="color: ${colorBioma};">${nombreBioma}</span><br>
        <span style="color: #ffffff;">MAMANI - HP: ${jugador.hp}/${jugador.hpMax} | ORO: ${jugador.oro}G</span><br>
        <span style="color: #ffcc00; font-size: 0.9vw;">Toca un nodo amarillo para avanzar</span>
    `;
}

function dibujarInventario() {
    // Dibujar panel de inventario en la parte inferior izquierda (vertical)
    let xStart = 5;
    let yStart = 140;
    let slotSize = 24;
    let gap = 6;

    // Fondo sutil vertical
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(xStart - 2, yStart - 5, slotSize + 10, (slotSize * 3) + (gap * 2) + 20);

    // Texto BOLSA pequeñito arriba de los slots
    ctx.fillStyle = "#ffcc00";
    ctx.font = "4px 'Press Start 2P'";
    ctx.fillText("BOLSA", xStart + 2, yStart + 2);

    for (let i = 0; i < 3; i++) {
        let x = xStart + 3;
        let y = yStart + 10 + (i * (slotSize + gap));

        // Fondo slot
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, slotSize, slotSize);
        ctx.strokeStyle = "#ffcc00";
        ctx.strokeRect(x, y, slotSize, slotSize);

        if (jugador.slotsCombate[i]) {
            let item = jugador.slotsCombate[i];
            let imgItem = null;

            if (item.id) {
                let cat = obtenerCategoriaItem(item.id);
                imgItem = imgCategorias[cat];
            }

            if (imgItem && imgItem.complete && imgItem.naturalWidth !== 0) {
                ctx.drawImage(imgItem, x + 2, y + 2, slotSize - 4, slotSize - 4);
            }

            // Hover and Tooltip
            if (esCursorSobreBoton(x, y, slotSize, slotSize)) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.fillRect(x, y, slotSize, slotSize);

                // Tooltip (sale hacia la derecha y un poco arriba)
                ctx.fillStyle = "rgba(0,0,0,0.9)";
                ctx.fillRect(x + slotSize + 5, y - 5, 115, 25);
                ctx.fillStyle = "#ffcc00";
                ctx.fillText(item.nombre, x + slotSize + 10, y + 5);
                ctx.fillStyle = "#ffffff";
                ctx.font = "4px 'Press Start 2P'";
                if (item.desc || item.descripcion) {
                    ctx.fillText(item.desc || item.descripcion, x + slotSize + 10, y + 15);
                }
            }
        }
    }
}

function dibujarPantallaCombate() {
    actualizarAnimaciones();

    // ==========================================
    // 1. CONFIGURACIÓN DE NITIDEZ (PIXEL ART)
    // ==========================================
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // ==========================================
    // 2. SELECCIÓN Y DIBUJO DEL FONDO (480x270)
    // ==========================================
    let fondoCargado = null;

    if (enemigo && enemigo.nombre && enemigo.nombre.includes("Quirquincho") && imagenesCargadas.fondos && imagenesCargadas.fondos.bgQuirquincho) {
        fondoCargado = imagenesCargadas.fondos.bgQuirquincho;
    } else if (enemigo && enemigo.nombre && enemigo.nombre.includes("Viuda") && imagenesCargadas.fondos && imagenesCargadas.fondos.bgViuda) {
        fondoCargado = imagenesCargadas.fondos.bgViuda;
    } else if (enemigo && enemigo.nombre && enemigo.nombre.includes("Jukumari") && imagenesCargadas.fondos && imagenesCargadas.fondos.bgJukumari) {
        fondoCargado = imagenesCargadas.fondos.bgJukumari;
    } else if (enemigo && enemigo.nombre && enemigo.nombre.includes("Monolito") && imagenesCargadas.fondos && imagenesCargadas.fondos.bgTiwanaku) {
        fondoCargado = imagenesCargadas.fondos.bgTiwanaku;
    } else if (enemigo && enemigo.nombre && enemigo.nombre.includes("Arcángel") && imagenesCargadas.fondos && imagenesCargadas.fondos.bgOruro) {
        fondoCargado = imagenesCargadas.fondos.bgOruro;
    } else if (enemigo && enemigo.nombre && enemigo.nombre.includes("El Tío") && imagenesCargadas.fondos && imagenesCargadas.fondos.bgMinaInterior) {
        fondoCargado = imagenesCargadas.fondos.bgMinaInterior;
    } else if (actoActual === 0 && imagenesCargadas.fondos && imagenesCargadas.fondos.amazonía) {
        fondoCargado = imagenesCargadas.fondos.amazonía;
    } else if (actoActual === 1 && imagenesCargadas.fondos && imagenesCargadas.fondos.amazonía) {
        fondoCargado = imagenesCargadas.fondos.amazonía;
    } else if (actoActual === 2 && imagenesCargadas.fondos && imagenesCargadas.fondos.minas) {
        fondoCargado = imagenesCargadas.fondos.minas;
    } else if (actoActual === 3 && imagenesCargadas.fondos && imagenesCargadas.fondos.salarJuego) {
        fondoCargado = imagenesCargadas.fondos.salarJuego;
    }

    if (fondoCargado && fondoCargado.complete && fondoCargado.naturalWidth !== 0) {
        ctx.drawImage(fondoCargado, 0, 0, 480, 270);
    } else {
        ctx.fillStyle = "#0c2317";
        ctx.fillRect(0, 0, 480, 270);
    }

    // ==========================================
    // 3. DIBUJAR SOMBRAS (Para que no floten)
    // ==========================================
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";

    // Sombra de Mamani (Bajo sus pies en Y = 182)
    ctx.beginPath();
    ctx.ellipse(80, 182, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sombra del Enemigo (Bajo sus pies en Y = 182)
    ctx.beginPath();
    ctx.ellipse(396, 182, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 4. DIBUJAR AL JUGADOR (MAMANI) - PISANDO EL SUELO
    // ==========================================
    const tiempoMs = Date.now();
    const vaivenMamani = Math.sin(tiempoMs / 300) * 2; // Animación suave de respiración

    // Selección dinámica del sprite de Mamani según estado de animación
    let spriteMamani;
    const p = imagenesCargadas.personajes;
    if (p) {
        const aj = animaciones.jugador;
        if (aj.hitShake > 0 || aj.pose === 'dano') {
            spriteMamani = p.mamaniHerido || p.mamani;
        } else if (aj.pose === 'ataque' || Math.abs(aj.atkOffset) > 0) {
            // Avanzando a atacar
            const cat = aj.cat || (jugador.cartasUsadasEsteTurno ? Object.keys(jugador.cartasUsadasEsteTurno).pop() : null);
            if (cat === 'defensiva') spriteMamani = p.mamaniDefensivo || p.mamani;
            else if (cat === 'elemental') spriteMamani = p.mamaniElemental || p.mamani;
            else spriteMamani = p.mamaniOfensivo || p.mamani;
        } else if (aj.pose === 'escudo' || aj.shieldFlash > 0) {
            spriteMamani = p.mamaniDefensivo || p.mamani;
        } else {
            spriteMamani = p.mamani;
        }
    }

    // Aplicar offsets de animación con transformación completa (tilt + escala)
    const aj = animaciones.jugador;
    const hitOffsetM = aj.hitShake > 0 ? (Math.random() * aj.hitShake - aj.hitShake / 2) : 0;
    const drawX_M = 45 + aj.atkOffset + hitOffsetM;
    const drawY_M = 97 + vaivenMamani;
    const spriteW_M = 70;
    const spriteH_M = 85;
    const pivotX_M = drawX_M + spriteW_M / 2;
    const pivotY_M = drawY_M + spriteH_M;

    ctx.save();
    ctx.translate(pivotX_M, pivotY_M);
    ctx.rotate(aj.inclinacion);
    ctx.scale(1, aj.escalaY);
    if (aj.hitShake > 0) ctx.filter = 'sepia(1) hue-rotate(-50deg) saturate(5) brightness(1.5)';
    else if (aj.shieldFlash > 0) ctx.filter = 'sepia(1) hue-rotate(180deg) saturate(4) brightness(1.2)';
    if (spriteMamani && spriteMamani.complete && spriteMamani.naturalWidth !== 0) {
        ctx.drawImage(spriteMamani, -spriteW_M / 2, -spriteH_M, spriteW_M, spriteH_M);
    } else {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(-spriteW_M / 2 + 9, -spriteH_M, spriteW_M - 20, spriteH_M);
    }
    ctx.filter = 'none';
    ctx.restore();

    // Barra de HP de Mamani (Diseño Premium)
    const barraAncho = 80;
    const barraAlto = 8;
    const xHp = 30;
    const yHp = 78;

    // 1. Contenedor/Borde de piedra oscuro
    ctx.fillStyle = "#2c3e50";
    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(xHp - 2, yHp - 2, barraAncho + 4, barraAlto + 4, 3);
    ctx.fill();
    ctx.stroke();

    // 2. Ranura vacía (fondo oscuro)
    ctx.fillStyle = "#110505";
    ctx.beginPath();
    ctx.roundRect(xHp, yHp, barraAncho, barraAlto, 2);
    ctx.fill();

    // 3. Relleno de vida con gradiente brillante
    const vidaPorcentaje = jugador.hp / jugador.hpMax;
    if (vidaPorcentaje > 0) {
        let gradMamani = ctx.createLinearGradient(xHp, yHp, xHp, yHp + barraAlto);
        gradMamani.addColorStop(0, "#2ecc71"); // Verde esmeralda brillante
        gradMamani.addColorStop(1, "#27ae60"); // Verde esmeralda oscuro
        ctx.fillStyle = gradMamani;
        ctx.beginPath();
        ctx.roundRect(xHp, yHp, barraAncho * vidaPorcentaje, barraAlto, 2);
        ctx.fill();

        // 4. Reflejo/Brillo en la parte superior
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(xHp, yHp, barraAncho * vidaPorcentaje, 1.5);
    }

    // 5. Texto de HP con sombra para legibilidad
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText(jugador.hp + "/" + jugador.hpMax + " HP", xHp + 4, yHp + 6);
    ctx.restore();

    // ==========================================
    // NUEVO: AP / ENERGÍA EN LA ESQUINA SUPERIOR DERECHA
    // ==========================================
    const xAp = 340; // Alineado al inicio de la barra de HP del enemigo
    const yAp = 20;  // Altura superior cómoda
    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText("ENERGÍA:", xAp, yAp - 6);

    for (let i = 0; i < jugador.apMax; i++) {
        ctx.fillStyle = (i < jugador.ap) ? "#ffcc00" : "#7f8c8d"; // Gema dorada de energía
        ctx.beginPath();
        ctx.arc(xAp + 6 + (i * 14), yAp, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    // ==========================================
    // ==========================================
    // 5. DIBUJAR AL ENEMIGO (DINÁMICO)
    // ==========================================
    const vaivenEnemigo = Math.cos(tiempoMs / 250) * 2; // Respiración

    let spriteEnemigo = null;
    let drawW = 100;
    let drawH = 60;
    let drawX = 340;
    let drawY = 135;

    if (enemigo.nombre.includes("El Jichi")) {
        drawW = 160; drawH = 100; drawX = 280; drawY = 95;
        const ae_j = animaciones.enemigo;
        const jp = imagenesCargadas.personajes;
        if (jp) {
            if (enemigo.muriendo) {
                spriteEnemigo = jp.jichiMuerte || jp.jichiHerido || jp.jichi;
                drawY += 30; // Bajar el sprite de muerte al suelo
            } else if (ae_j.hitShake > 0 || ae_j.pose === "dano") {
                spriteEnemigo = jp.jichiHerido || jp.jichi;
            } else if (ae_j.pose === "ataque" || Math.abs(ae_j.atkOffset) > 0) {
                spriteEnemigo = jp.jichiAtaque || jp.jichi;
            } else if (ae_j.pose === "escudo" || ae_j.shieldFlash > 0) {
                spriteEnemigo = jp.jichiDefensa || jp.jichi;
            } else {
                spriteEnemigo = jp.jichi;
            }
        }
    } else if (enemigo.nombre.includes("El Tío de la Mina")) {
        let pose = animaciones.enemigo.pose;
        if (animaciones.enemigo.hitShake > 0) {
            spriteEnemigo = imagenesCargadas.personajes && imagenesCargadas.personajes.tioHerido;
        } else if (enemigo.muriendo) {
            spriteEnemigo = imagenesCargadas.personajes && imagenesCargadas.personajes.tioMuerte;
        } else if (pose === 'ataque' || pose === 'ataque_magico' || Math.abs(animaciones.enemigo.atkOffset) > 0) {
            spriteEnemigo = imagenesCargadas.personajes && imagenesCargadas.personajes.tioAtaque;
        } else if (pose === 'escudo' || animaciones.enemigo.shieldFlash > 0) {
            spriteEnemigo = imagenesCargadas.personajes && imagenesCargadas.personajes.tioDefensa;
        } else {
            spriteEnemigo = imagenesCargadas.personajes && (imagenesCargadas.personajes.tioNormal || imagenesCargadas.personajes.tio);
        }
        drawW = 200; drawH = 150; drawX = 270; drawY = 45;
    } else if (enemigo.nombre.includes("Huiracocha")) {
        drawW = 170; drawH = 120; drawX = 290; drawY = 75;
        const ae_h = animaciones.enemigo;
        const hp_img = imagenesCargadas.personajes;
        if (hp_img) {
            if (ae_h.hitShake > 0 || ae_h.pose === "dano") {
                spriteEnemigo = hp_img.huiracochaHerido || hp_img.huiracocha;
            } else if (ae_h.pose === "muerte") {
                spriteEnemigo = hp_img.huiracochaMuerte || hp_img.huiracocha;
            } else if (ae_h.pose === "ataque" || Math.abs(ae_h.atkOffset) > 0) {
                spriteEnemigo = hp_img.huiracochaAtaque || hp_img.huiracocha;
            } else if (ae_h.pose === "escudo" || ae_h.shieldFlash > 0) {
                spriteEnemigo = hp_img.huiracochaDefensa || hp_img.huiracocha;
            } else {
                spriteEnemigo = hp_img.huiracocha;
            }
        }
    } else if (enemigo.nombre.includes("El Guajojo")) {
        // Guajojo: flota en el aire, sprite dinamico por pose
        drawW = 140; drawH = 100; drawX = 295; drawY = 90;
        const ae_g = animaciones.enemigo;
        const gp = imagenesCargadas.personajes;
        if (gp) {
            if (enemigo.muriendo) {
                spriteEnemigo = gp.guajojoMuerte || gp.guajojoHerido || gp.guajojo;
                drawY += 55; // Bajar el sprite al suelo al morir
            } else if (ae_g.hitShake > 0 || ae_g.pose === "dano") {
                spriteEnemigo = gp.guajojoHerido || gp.guajojo;
            } else if (ae_g.pose === "ataque" || Math.abs(ae_g.atkOffset) > 0) {
                spriteEnemigo = gp.guajojoAtaque || gp.guajojo;
            } else if (ae_g.pose === "escudo" || ae_g.shieldFlash > 0) {
                spriteEnemigo = gp.guajojoDefensa || gp.guajojo;
            } else {
                spriteEnemigo = gp.guajojo;
            }
        }
    } else if (enemigo.nombre.includes("El Mapinguari")) {
        // Mapinguari: gigante, ocupa mas espacio + sprite dinamico
        drawW = 165; drawH = 120; drawX = 265; drawY = 75;
        const ae_m = animaciones.enemigo;
        const mp = imagenesCargadas.personajes;
        if (mp) {
            if (enemigo.muriendo) {
                spriteEnemigo = mp.mapinguariMuerte || mp.mapinguariHerido || mp.mapinguari;
                drawY += 40; // Bajar el sprite al suelo al morir
            } else if (ae_m.hitShake > 0 || ae_m.pose === "dano") {
                spriteEnemigo = mp.mapinguariHerido || mp.mapinguari;
            } else if (ae_m.pose === "ataque" || Math.abs(ae_m.atkOffset) > 0) {
                spriteEnemigo = mp.mapinguariAtaque || mp.mapinguari;
            } else if (ae_m.pose === "escudo" || ae_m.shieldFlash > 0) {
                spriteEnemigo = mp.mapinguariDefensa || mp.mapinguari;
            } else {
                spriteEnemigo = mp.mapinguari;
            }
        }
    } else if (enemigo.nombre.includes("El Duende Oriental")) {
        // Duende: pequeno y travieso + sprite dinamico
        drawW = 110; drawH = 90; drawX = 320; drawY = 115;
        const ae_d = animaciones.enemigo;
        const dp = imagenesCargadas.personajes;
        if (dp) {
            if (enemigo.muriendo) {
                spriteEnemigo = dp.duendeMuerte || dp.duendeHerido || dp.duende;
                drawY += 35; // Bajar el sprite al suelo al morir
            } else if (ae_d.hitShake > 0 || ae_d.pose === "dano") {
                spriteEnemigo = dp.duendeHerido || dp.duende;
            } else if (ae_d.pose === "ataque" || Math.abs(ae_d.atkOffset) > 0) {
                spriteEnemigo = dp.duendeAtaque || dp.duende;
            } else if (ae_d.pose === "escudo" || ae_d.shieldFlash > 0) {
                spriteEnemigo = dp.duendeDefensa || dp.duende;
            } else {
                spriteEnemigo = dp.duende;
            }
        }
    } else if (enemigo.nombre.includes("Kari") || enemigo.nombre.includes("Kharisiri")) {
        // Karikari: mini-boss del Acto 2 + sprite dinamico por pose
        drawW = 130; drawH = 100; drawX = 305; drawY = 95;
        const ae_k = animaciones.enemigo;
        const kp = imagenesCargadas.personajes;
        if (kp) {
            if (ae_k.hitShake > 0 || ae_k.pose === "dano") {
                spriteEnemigo = kp.karikariHerido || kp.karikari;
            } else if (ae_k.pose === "muerte") {
                spriteEnemigo = kp.karikariMuerte || kp.karikari;
            } else if (ae_k.pose === "ataque" || Math.abs(ae_k.atkOffset) > 0) {
                spriteEnemigo = kp.karikariAtaque || kp.karikari;
            } else if (ae_k.pose === "escudo" || ae_k.shieldFlash > 0) {
                spriteEnemigo = kp.karikariDefensa || kp.karikari;
            } else {
                // Agrandar específicamente el sprite base
                drawW = 170; drawH = 130; drawX = 285; drawY = 70;
                spriteEnemigo = kp.karikari;
            }
        }
    } else if (enemigo.nombre.includes("El Jukumari") || enemigo.nombre.includes("Jukumari")) {
        // Jukumari: mini-boss del Acto 2 + sprite dinamico por pose
        drawW = 150; drawH = 110; drawX = 295; drawY = 85;
        const ae_j = animaciones.enemigo;
        const jp = imagenesCargadas.personajes;
        if (jp) {
            if (ae_j.hitShake > 0 || ae_j.pose === "dano") {
                spriteEnemigo = jp.jukumariHerido || jp.jukumari;
            } else if (ae_j.pose === "muerte") {
                spriteEnemigo = jp.jukumariMuerte || jp.jukumari;
            } else if (ae_j.pose === "ataque" || Math.abs(ae_j.atkOffset) > 0) {
                spriteEnemigo = jp.jukumariAtaque || jp.jukumari;
            } else if (ae_j.pose === "escudo" || ae_j.shieldFlash > 0) {
                spriteEnemigo = jp.jukumariDefensa || jp.jukumari;
            } else {
                spriteEnemigo = jp.jukumari;
            }
        }
    } else if (enemigo.nombre.includes("La Viuda")) {
        // La Viuda: enemiga especial con sprites completos por pose
        drawW = 120; drawH = 100; drawX = 310; drawY = 95;
        const ae_v = animaciones.enemigo;
        const vp = imagenesCargadas.personajes;
        if (vp) {
            if (ae_v.hitShake > 0 || ae_v.pose === "dano") {
                spriteEnemigo = vp.viudaHerida || vp.viuda;
            } else if (ae_v.pose === "muerte") {
                spriteEnemigo = vp.viudaMuerte || vp.viuda;
            } else if (ae_v.pose === "ataque" || Math.abs(ae_v.atkOffset) > 0) {
                spriteEnemigo = vp.viudaAtaque || vp.viuda;
            } else if (ae_v.pose === "escudo" || ae_v.shieldFlash > 0) {
                spriteEnemigo = vp.viudaDefensa || vp.viuda;
            } else {
                spriteEnemigo = vp.viuda;
            }
        }
    } else if (enemigo.nombre.includes("Monolito")) {
        drawW = 150; drawH = 130; drawX = 295; drawY = 70;
        const ae = animaciones.enemigo;
        const p = imagenesCargadas.personajes;
        if (p) {
            if (ae.hitShake > 0 || ae.pose === "dano") {
                spriteEnemigo = p.monolitoHerido || p.monolito;
            } else if (ae.pose === "muerte") {
                spriteEnemigo = p.monolitoMuerte || p.monolito;
            } else if (ae.pose === "ataque" || Math.abs(ae.atkOffset) > 0) {
                spriteEnemigo = p.monolitoAtaque || p.monolito;
            } else if (ae.pose === "escudo" || ae.shieldFlash > 0) {
                spriteEnemigo = p.monolitoDefensa || p.monolito;
            } else {
                spriteEnemigo = p.monolito;
            }
        }
    } else if (enemigo.nombre.includes("Arcángel")) {
        drawW = 130; drawH = 130; drawX = 305; drawY = 70;
        const ae = animaciones.enemigo;
        const p = imagenesCargadas.personajes;
        if (p) {
            if (ae.hitShake > 0 || ae.pose === "dano") {
                spriteEnemigo = p.arcangelHerido || p.arcangel;
            } else if (ae.pose === "muerte") {
                spriteEnemigo = p.arcangelMuerte || p.arcangel;
            } else if (ae.pose === "ataque" || Math.abs(ae.atkOffset) > 0) {
                spriteEnemigo = p.arcangelAtaque || p.arcangel;
            } else if (ae.pose === "escudo" || ae.shieldFlash > 0) {
                spriteEnemigo = p.arcangelDefensa || p.arcangel;
            } else {
                spriteEnemigo = p.arcangel;
            }
        }
    } else {
        // Quirquincho: sprite dinámico según estado de animación
        // Restauramos tamaño original por defecto
        drawW = 90; drawH = 65; drawX = 340; drawY = 135;
        const qp = imagenesCargadas.personajes;
        if (qp) {
            const ae = animaciones.enemigo;
            if (ae.hitShake > 0 || ae.pose === 'dano') {
                spriteEnemigo = qp.quirquinchoHerido || qp.quirquincho;
            } else if (ae.pose === 'muerte') {
                // Solo agrandar en muerte
                drawW = 120; drawH = 90; drawX = 310; drawY = 110;
                spriteEnemigo = qp.quirquinchoMuerte || qp.quirquincho;
            } else if (ae.pose === 'ataque' || Math.abs(ae.atkOffset) > 0) {
                // El Quirquincho avanza a atacar
                spriteEnemigo = qp.quirquinchoOfensivo || qp.quirquinchoAtaque || qp.quirquincho;
            } else if (ae.pose === 'escudo' || ae.shieldFlash > 0) {
                spriteEnemigo = qp.quirquinchoEscudo || qp.quirquinchoDefensivo || qp.quirquincho;
            } else {
                spriteEnemigo = qp.quirquincho;
            }
        }
    }

    // Aplicar offsets del enemigo con tilt + escala
    const ae = animaciones.enemigo;
    const hitOffsetE = ae.hitShake > 0 ? (Math.random() * ae.hitShake - ae.hitShake / 2) : 0;
    drawX += ae.atkOffset + hitOffsetE;
    const drawY_Final = drawY + vaivenEnemigo;

    const pivotX_E = drawX + drawW / 2;
    const pivotY_E = drawY_Final + drawH;

    ctx.save();
    ctx.translate(pivotX_E, pivotY_E);
    ctx.rotate(ae.inclinacion);
    ctx.scale(1, ae.escalaY);
    let baseFilter = 'none';
    if (enemigo.faseActual === 2) {
        if (enemigo.nombre.includes("Huiracocha")) {
            baseFilter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) brightness(1.3) contrast(1.3) saturate(1.5)';
        } else if (enemigo.nombre.includes("El Jichi")) {
            // Jichi Fase 2: Rojo intenso (Jichi original es verde/cian, el hue-rotate lo vuelve rojo)
            baseFilter = 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.9)) sepia(0.8) hue-rotate(280deg) saturate(6) brightness(0.9) contrast(1.5)';
        } else {
            // Tío de la Mina (Rojo infernal)
            baseFilter = 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.9)) sepia(0.5) hue-rotate(-40deg) saturate(4) brightness(0.9) contrast(1.5)';
        }
    }

    let usarCache = false;
    if (enemigo.faseActual === 2 && ae.hitShake === 0 && ae.shieldFlash === 0) {
        if (spriteEnemigo && spriteEnemigo.complete && spriteEnemigo.naturalWidth !== 0) {
            usarCache = true;
            if (!window.cacheEnemigoFase2 || window.lastFase2Sprite !== spriteEnemigo.src) {
                window.cacheEnemigoFase2 = document.createElement('canvas');
                window.cacheEnemigoFase2.width = drawW + 100;
                window.cacheEnemigoFase2.height = drawH + 100;
                const ctxOff = window.cacheEnemigoFase2.getContext('2d');
                ctxOff.filter = baseFilter;
                ctxOff.drawImage(spriteEnemigo, 50, 50, drawW, drawH);
                window.lastFase2Sprite = spriteEnemigo.src;
            }
        }
    }

    if (ae.hitShake > 0) {
        // Solo un filtro simple durante el golpe para evitar matar la GPU
        ctx.filter = 'brightness(2) contrast(1.5)';
    } else if (ae.shieldFlash > 0) {
        ctx.filter = 'brightness(1.5) contrast(1.2)';
    } else {
        ctx.filter = usarCache ? 'none' : baseFilter;
    }

    if (usarCache) {
        ctx.drawImage(window.cacheEnemigoFase2, -drawW / 2 - 50, -drawH - 50);
    } else if (spriteEnemigo && spriteEnemigo.complete && spriteEnemigo.naturalWidth !== 0) {
        ctx.drawImage(spriteEnemigo, -drawW / 2, -drawH, drawW, drawH);
    } else {
        // Quirquincho geométrico de respaldo
        ctx.fillStyle = '#d35400'; ctx.beginPath(); ctx.arc(0, -30, 22, Math.PI, 0, false); ctx.lineTo(0, -10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ba4a00'; ctx.lineWidth = 1.5;
        for (let offset = -16; offset <= 16; offset += 5) {
            ctx.beginPath(); ctx.arc(offset, -30, 19, Math.PI, 0, false); ctx.stroke();
        }
        ctx.fillStyle = '#e59866'; ctx.beginPath(); ctx.moveTo(-19, -26); ctx.lineTo(-42, -20); ctx.lineTo(-19, -13); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-26, -23, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ba4a00'; ctx.fillRect(-14, -5, 5, 6); ctx.fillRect(9, -5, 5, 6);
    }
    ctx.filter = 'none';
    ctx.restore();

    // ========== EFECTOS ESPECIALES (encima de sprites, debajo del HUD) ==========
    dibujarEfectosEspeciales();
    // Barra de vida del Enemigo (Diseño Premium)
    const xHpEnemigo = 340;
    let yHpEnemigo = 60;
    if (enemigo.nombre.includes("El Tío") || enemigo.nombre.includes("Huiracocha")) {
        yHpEnemigo = 48;
    }

    // 1. Contenedor/Borde de piedra oscuro
    ctx.fillStyle = "#2c3e50";
    ctx.strokeStyle = "#34495e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(xHpEnemigo - 2, yHpEnemigo - 2, barraAncho + 4, barraAlto + 4, 3);
    ctx.fill();
    ctx.stroke();

    // 2. Ranura vacía (fondo oscuro)
    ctx.fillStyle = "#110505";
    ctx.beginPath();
    ctx.roundRect(xHpEnemigo, yHpEnemigo, barraAncho, barraAlto, 2);
    ctx.fill();

    // 3. Relleno de vida con gradiente rojo brillante
    const vidaEnemigoPorcentaje = enemigo.hp / enemigo.hpMax;
    if (vidaEnemigoPorcentaje > 0) {
        let gradEnemigo = ctx.createLinearGradient(xHpEnemigo, yHpEnemigo, xHpEnemigo, yHpEnemigo + barraAlto);
        gradEnemigo.addColorStop(0, "#ff4d4d"); // Rojo carmesí brillante
        gradEnemigo.addColorStop(1, "#c0392b"); // Rojo oscuro
        ctx.fillStyle = gradEnemigo;
        ctx.beginPath();
        ctx.roundRect(xHpEnemigo, yHpEnemigo, barraAncho * vidaEnemigoPorcentaje, barraAlto, 2);
        ctx.fill();

        // 4. Reflejo/Brillo en la parte superior
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(xHpEnemigo, yHpEnemigo, barraAncho * vidaEnemigoPorcentaje, 1.5);
    }


    // 5. Nombre y HP con sombra
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText(enemigo.nombre, xHpEnemigo, yHpEnemigo - 8);
    ctx.fillText(enemigo.hp + "/" + enemigo.hpMax + " HP", xHpEnemigo + 4, yHpEnemigo + 6);
    ctx.restore();

    // Estado del Enemigo
    if (enemigo.estado === "EMPAPADO") {
        ctx.fillStyle = "#3498db";
        ctx.fillRect(xHpEnemigo, yHpEnemigo + barraAlto + 4, 65, 6);
        ctx.fillStyle = "#ffffff";
        ctx.font = "3.5px 'Press Start 2P'";
        ctx.fillText("EMPAPADO (+50% Daño Recibido)", xHpEnemigo + 4, yHpEnemigo + barraAlto + 9);
    } else if (enemigo.estado === "DEBILITADO") {
        ctx.fillStyle = "#9b59b6";
        ctx.fillRect(xHpEnemigo, yHpEnemigo + barraAlto + 4, 65, 6);
        ctx.fillStyle = "#ffffff";
        ctx.font = "3.5px 'Press Start 2P'";
        ctx.fillText("DEBILITADO (-5 ATK)", xHpEnemigo + 4, yHpEnemigo + barraAlto + 9);
    } else if (enemigo.estado === "QUEMADURA") {
        ctx.fillStyle = "#e67e22";
        ctx.fillRect(xHpEnemigo, yHpEnemigo + barraAlto + 4, 65, 6);
        ctx.fillStyle = "#ffffff";
        ctx.font = "3.5px 'Press Start 2P'";
        ctx.fillText("QUEMADURA (-5 HP)", xHpEnemigo + 4, yHpEnemigo + barraAlto + 9);
    }

    // Estado de Mamani (Bajo su barra de HP)
    if (jugador.estado === "sangrado") {
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(xHp, yHp + barraAlto + 4, 60, 6);
        ctx.fillStyle = "#ffffff";
        ctx.font = "3.5px 'Press Start 2P'";
        ctx.fillText("SANGRADO (-4 HP)", xHp + 4, yHp + barraAlto + 9);
    } else if (jugador.estado === "quemadura") {
        ctx.fillStyle = "#e67e22";
        ctx.fillRect(xHp, yHp + barraAlto + 4, 60, 6);
        ctx.fillStyle = "#ffffff";
        ctx.font = "3.5px 'Press Start 2P'";
        ctx.fillText("QUEMADURA (-6 HP)", xHp + 4, yHp + barraAlto + 9);
    }

    // ==========================================
    // 6. SISTEMA DE TELEGRAFÍA (Intenciones Premium)
    // ==========================================
    const xTele = xHpEnemigo + barraAncho + 8;
    const yTele = yHpEnemigo - 4;
    const wTele = 24;
    const hTele = 18;

    // Borde místico dorado
    ctx.fillStyle = "#2c3e50";
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(xTele, yTele, wTele, hTele, 2);
    ctx.fill();
    ctx.stroke();

    // Fondo interior degradado según intención
    let gradTele = ctx.createLinearGradient(xTele, yTele, xTele, yTele + hTele);
    let iconoIntencion = "";
    if (enemigo.intencion.tipo === "ATAQUE") {
        gradTele.addColorStop(0, "#e74c3c");
        gradTele.addColorStop(1, "#c0392b");
        iconoIntencion = "⚔️";
    } else if (enemigo.intencion.tipo === "DEFENSA") {
        gradTele.addColorStop(0, "#2ecc71");
        gradTele.addColorStop(1, "#27ae60");
        iconoIntencion = "🛡️";
    } else {
        gradTele.addColorStop(0, "#9b59b6");
        gradTele.addColorStop(1, "#8e44ad");
        iconoIntencion = "💀";
    }
    ctx.fillStyle = gradTele;
    ctx.beginPath();
    ctx.roundRect(xTele + 1, yTele + 1, wTele - 2, hTele - 2, 1);
    ctx.fill();

    // Reflejo
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(xTele + 1, yTele + 1, wTele - 2, 3);

    // Icono y Texto con sombra
    ctx.save();
    ctx.fillStyle = "#ffffff";

    ctx.font = "6px 'Press Start 2P'";
    ctx.fillText(iconoIntencion, xTele + 2, yTele + 11);

    ctx.font = "5px 'Press Start 2P'";
    if (enemigo.intencion.valor > 0) {
        ctx.fillText(enemigo.intencion.valor, xTele + 12, yTele + 11);
    } else {
        ctx.fillText("?", xTele + 14, yTele + 11);
    }
    ctx.restore();

    // ==========================================
    // 7. BOCADILLO DE DIÁLOGO INTERACTIVO (Tooltip al pasar el cursor)
    // ==========================================
    const hoverIntencion = esCursorSobreBoton(xTele, yTele, wTele, hTele);

    if (hoverIntencion) {
        canvas.style.cursor = "pointer";

        // Posicionamos el globo a la izquierda de la intención para no tapar nada
        const xBubble = xTele - 112;
        const yBubble = yTele + 2;
        const wBubble = 105;
        const hBubble = 14;

        // Borde marrón madera/tierra
        ctx.fillStyle = "#5c3d2e";
        ctx.beginPath();
        ctx.roundRect(xBubble - 1, yBubble - 1, wBubble + 2, hBubble + 2, 3);
        ctx.fill();

        // Fondo pergamino beige claro
        ctx.fillStyle = "#fdf2e9";
        ctx.beginPath();
        ctx.roundRect(xBubble, yBubble, wBubble, hBubble, 2);
        ctx.fill();

        // Flechita del globo de diálogo apuntando a la derecha (hacia el botón de intención)
        ctx.fillStyle = "#5c3d2e";
        ctx.beginPath();
        ctx.moveTo(xBubble + wBubble, yBubble + hBubble / 2 - 3);
        ctx.lineTo(xBubble + wBubble, yBubble + hBubble / 2 + 3);
        ctx.lineTo(xBubble + wBubble + 4, yBubble + hBubble / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#fdf2e9";
        ctx.beginPath();
        ctx.moveTo(xBubble + wBubble - 1, yBubble + hBubble / 2 - 2);
        ctx.lineTo(xBubble + wBubble - 1, yBubble + hBubble / 2 + 2);
        ctx.lineTo(xBubble + wBubble + 2, yBubble + hBubble / 2);
        ctx.closePath();
        ctx.fill();

        // Texto marrón rojizo centrado
        ctx.save();
        ctx.fillStyle = "#78281f";
        ctx.font = "3.2px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(enemigo.intencion.descripcion, xBubble + wBubble / 2, yBubble + 9);
        ctx.restore();
    }

    // ==========================================
    // 7. BOTONES REUBICADOS (Estilo Slay)
    // ==========================================
    // BOTÓN HUIR (Arriba a la izquierda, discreto)
    const btnHuir = UI_CONFIG.combate.huir;
    const esJefe = enemigo.nombre.includes("El Jichi") || enemigo.nombre.includes("El Tío") || enemigo.nombre.includes("Huiracocha") || enemigo.nombre.includes("Jefe");
    
    if (!esJefe) {
        const hoverHuir = esCursorSobreBoton(btnHuir.x, btnHuir.y, btnHuir.w, btnHuir.h);
        let hy = btnHuir.y;
        if (hoverHuir) {
            canvas.style.cursor = "pointer";
            hy -= 2;
        }

        ctx.fillStyle = hoverHuir ? "rgba(231, 76, 60, 0.95)" : "rgba(44, 62, 80, 0.8)";
        ctx.fillRect(btnHuir.x, hy, btnHuir.w, btnHuir.h);
        ctx.strokeStyle = hoverHuir ? "#ffcc00" : "#e74c3c";
        ctx.lineWidth = 1;
        ctx.strokeRect(btnHuir.x, hy, btnHuir.w, btnHuir.h);
        ctx.fillStyle = hoverHuir ? "#ffffff" : "#e74c3c";
        ctx.font = "4px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("HUIR", btnHuir.x + btnHuir.w / 2, hy + 8);
        ctx.fillText("(-15% HP)", btnHuir.x + btnHuir.w / 2, hy + 15);
        ctx.textAlign = "left";
    }

    // BOTÓN END TURN (Subido un poco para evitar pisar al enemigo y al suelo)
    const btnTerminar = UI_CONFIG.combate.terminarTurno;
    const hoverTerminar = esCursorSobreBoton(btnTerminar.x, btnTerminar.y, btnTerminar.w, btnTerminar.h);
    let ty = btnTerminar.y;
    if (hoverTerminar) {
        canvas.style.cursor = "pointer";
        ty -= 2;
    }

    ctx.fillStyle = hoverTerminar ? "rgba(243, 156, 18, 0.95)" : "#e67e22";
    ctx.fillRect(btnTerminar.x, ty, btnTerminar.w, btnTerminar.h);
    ctx.strokeStyle = hoverTerminar ? "#ffcc00" : "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(btnTerminar.x, ty, btnTerminar.w, btnTerminar.h);
    ctx.fillStyle = "#ffffff";
    ctx.font = "4px 'Press Start 2P'";
    ctx.fillText("TERMINAR", btnTerminar.x + 10, ty + 9);
    ctx.fillText("TURNO", btnTerminar.x + 16, ty + 17);

    // ==========================================
    // 8. MANO DE CARTAS — LAYOUT PLANO HORIZONTAL CENTRADO
    // ==========================================
    const categorias = ["ofensiva", "defensiva", "elemental", "mejora", "nerfeo"];
    const cfgMano = UI_CONFIG.mano;
    const cartaAncho = cfgMano.ancho;
    const cartaAlto = cfgMano.alto;
    const espacioEntreCartas = cfgMano.espacio;
    const manoXInicial = cfgMano.xInicial;
    const manoY = cfgMano.yBase;

    // Panel de fondo con padding cómodo para que las cartas no toquen el borde
    const PANEL_PAD_H = 10; // padding horizontal interno
    const PANEL_PAD_V = 6;  // padding vertical interno
    const panelW2 = categorias.length * (cartaAncho + espacioEntreCartas) - espacioEntreCartas + PANEL_PAD_H * 2;
    const panelX2 = manoXInicial - PANEL_PAD_H;
    const panelY2 = manoY - PANEL_PAD_V;
    const panelH2 = cartaAlto + PANEL_PAD_V * 2 + 18; // +18 para espacio de la carta levantada
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.roundRect(panelX2, panelY2, panelW2, panelH2, 8);
    ctx.fill();
    // Borde sutil del panel
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Momento actual para animaciones de selección
    const tiempoSeleccion = Date.now();
    // Pulso suave: oscila entre 0 y 1 cada ~600ms
    const pulsoSel = (Math.sin(tiempoSeleccion / 200) + 1) / 2;

    categorias.forEach((cat, index) => {
        const carta = jugador.mano[cat];
        const estaSeleccionada = (cartaSeleccionadaIndex === index);

        // Posición X fija
        const cx = manoXInicial + index * (cartaAncho + espacioEntreCartas);
        // Posición Y: solo sube si está seleccionada
        const cyBase = manoY;
        const cy = estaSeleccionada ? cyBase - 20 : cyBase;

        // Cursor pointer al pasar sobre carta válida
        if (carta !== null && mouseX >= cx && mouseX <= cx + cartaAncho && mouseY >= cyBase - 2 && mouseY <= cyBase + cartaAlto) {
            canvas.style.cursor = "pointer";
        }

        if (carta === null) {
            // ── Ranura bloqueada (estética premium) ──────────────────
            // Fondo muy oscuro con gradiente
            const gLocked = ctx.createLinearGradient(cx, cyBase, cx, cyBase + cartaAlto);
            gLocked.addColorStop(0, "rgba(12,8,3,0.88)");
            gLocked.addColorStop(1, "rgba(6,4,1,0.88)");
            ctx.fillStyle = gLocked;
            ctx.beginPath(); ctx.roundRect(cx, cyBase, cartaAncho, cartaAlto, 4); ctx.fill();

            // Borde punteado ámbar oscuro
            ctx.strokeStyle = "rgba(120,75,10,0.5)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.roundRect(cx, cyBase, cartaAncho, cartaAlto, 4); ctx.stroke();
            ctx.setLineDash([]);

            // Ícono de candado (emoji grande centrado)
            ctx.font = "16px serif";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.45;
            ctx.fillText("🔒", cx + cartaAncho / 2, cyBase + cartaAlto / 2 - 4);
            ctx.globalAlpha = 1;

            // Texto "TIENDA" pequeño debajo
            ctx.fillStyle = "rgba(160,100,20,0.7)";
            ctx.font = "2.8px 'Press Start 2P'";
            ctx.fillText("TIENDA", cx + cartaAncho / 2, cyBase + cartaAlto / 2 + 10);

            // Categoría en la parte superior
            const catLabel = cat === 'elemental' ? 'ELEME.' : cat === 'mejora' ? 'MEJORA' : cat.toUpperCase();
            ctx.fillStyle = "rgba(120,75,10,0.6)";
            ctx.font = "2.5px 'Press Start 2P'";
            ctx.fillText(catLabel, cx + cartaAncho / 2, cyBase + 8);
            ctx.textAlign = "left";
        } else {
            ctx.save();

            // Transparencia si ya fue usada
            if (jugador.cartasUsadasEsteTurno && jugador.cartasUsadasEsteTurno[cat]) {
                ctx.globalAlpha = 0.4;
            }

            // Colores por categoría
            let colorBorde = "#e74c3c";
            let colorFondo = "#2c1c1c";
            let colorTop = "#ff6b6b";
            if (cat === "defensiva") { colorBorde = "#3498db"; colorFondo = "#1c242c"; colorTop = "#5dade2"; }
            else if (cat === "elemental") { colorBorde = "#9b59b6"; colorFondo = "#241c2c"; colorTop = "#bb8fce"; }
            else if (cat === "mejora" || cat === "nerfeo") { colorBorde = "#2ecc71"; colorFondo = "#1c2c20"; colorTop = "#58d68d"; }

            // ===== CARTA SELECCIONADA: GLOW EXTERIOR SUTIL =====
            if (estaSeleccionada) {
                const gGlow = 0.5 + pulsoSel * 0.5;
                ctx.strokeStyle = `rgba(255, 204, 0, ${gGlow})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(cx - 1, cy - 1, cartaAncho + 2, cartaAlto + 2, 5);
                ctx.stroke();
            }

            // Base de la carta
            ctx.fillStyle = colorFondo;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cartaAncho, cartaAlto, 4);
            ctx.fill();

            // Borde interior (más grueso y dorado si está seleccionada)
            if (estaSeleccionada) {
                ctx.strokeStyle = "#ffcc00";
                ctx.lineWidth = 2.5;
            } else {
                ctx.strokeStyle = colorBorde;
                ctx.lineWidth = 1.5;
            }
            ctx.beginPath();
            ctx.roundRect(cx, cy, cartaAncho, cartaAlto, 4);
            ctx.stroke();

            // Barra de color superior (etiqueta de categoría)
            ctx.fillStyle = estaSeleccionada ? "#ffcc00" : colorBorde;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cartaAncho, 7, [4, 4, 0, 0]);
            ctx.fill();

            // Cooldown overlay
            if (jugador.cooldowns && jugador.cooldowns[carta.nombre] > 0) {
                ctx.globalAlpha = 0.65;
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.beginPath();
                ctx.roundRect(cx, cy, cartaAncho, cartaAlto, 4);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#e74c3c";
                ctx.font = "16px 'Press Start 2P'";
                ctx.textAlign = "center";
                ctx.fillText(jugador.cooldowns[carta.nombre], cx + cartaAncho / 2, cy + cartaAlto / 2 + 6);
                ctx.textAlign = "left";
            }

            // Ícono ilustrativo según categoría
            let iconKey = cat;
            if (cat === 'ofensiva') iconKey = 'ataque';
            if (cat === 'defensiva') iconKey = 'defensa';
            if (cat === 'mejora' || cat === 'nerfeo') iconKey = 'mejora';
            if (cat === 'elemental') {
                iconKey = carta.tipo.toLowerCase().includes('agua') || carta.tipo.toLowerCase().includes('hielo') ? 'agua' : 'fuego';
            }

            let iconImg = imagenesCargadas.cartas && imagenesCargadas.cartas[carta.nombre];
            if (!iconImg) {
                iconImg = imagenesCargadas.cartas && imagenesCargadas.cartas[iconKey];
            }

            const iconY = cy + 8;
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(cx + 3, iconY, cartaAncho - 6, 26);
            if (iconImg && iconImg.complete && iconImg.naturalWidth !== 0) {
                ctx.drawImage(iconImg, cx + 5, iconY + 2, cartaAncho - 10, 22);
            }

            // Nombre de la Carta
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            let fontSize = 3.2;
            if (carta.nombre.length > 14) fontSize = 2.4;
            else if (carta.nombre.length > 9) fontSize = 2.8;
            ctx.font = `${fontSize}px 'Press Start 2P'`;
            ctx.fillText(carta.nombre, cx + 3, cy + 42);

            // Tipo / Categoria
            ctx.fillStyle = colorTop;
            ctx.font = "2.5px 'Press Start 2P'";
            ctx.fillText(carta.tipo, cx + 3, cy + 51);

            // Costo AP (gema en esquina superior derecha)
            const gemaX = cx + cartaAncho - 7;
            const gemaY = cy + 6;
            ctx.fillStyle = "#e74c3c";
            ctx.beginPath();
            ctx.arc(gemaX, gemaY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#f1c40f";
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.font = "4px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText(carta.costoAP, gemaX, gemaY + 1.5);
            ctx.textAlign = "left";

            // Indicador "▼ JUGAR" encima de la carta seleccionada (pulso suave)
            if (estaSeleccionada) {
                const alfaLabel = 0.7 + pulsoSel * 0.3; // 0.7 a 1.0
                ctx.fillStyle = `rgba(255, 220, 0, ${alfaLabel})`;
                ctx.font = "3.5px 'Press Start 2P'";
                ctx.textAlign = "center";
                ctx.fillText("▼ JUGAR", cx + cartaAncho / 2, cy - 3);
                ctx.textAlign = "left";
            }

            ctx.restore();
        }
    });

    // Dibujar Escudo activo de Mamani si es mayor a 0 (Diseño Premium)
    if (jugador.escudo > 0) {
        const xEsc = xHp + barraAncho + 6;
        const yEsc = yHp - 1;
        const wEsc = 24;

        // Contenedor/Borde
        ctx.fillStyle = "#2c3e50";
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(xEsc, yEsc, wEsc, barraAlto + 2, 2);
        ctx.fill();
        ctx.stroke();

        // Fondo azul metálico
        let gradEsc = ctx.createLinearGradient(xEsc, yEsc, xEsc, yEsc + barraAlto + 2);
        gradEsc.addColorStop(0, "#3498db");
        gradEsc.addColorStop(1, "#2980b9");
        ctx.fillStyle = gradEsc;
        ctx.beginPath();
        ctx.roundRect(xEsc + 1, yEsc + 1, wEsc - 2, barraAlto, 1);
        ctx.fill();

        // Reflejo
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(xEsc + 1, yEsc + 1, wEsc - 2, 2);

        // Texto con sombra
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.font = "4px 'Press Start 2P'";
        ctx.fillText("🛡️+" + jugador.escudo, xEsc + 2, yEsc + 7);
        ctx.restore();
    }

    // (Textos flotantes y efectos son renderizados por dibujarEfectosEspeciales())

    // ==========================================
    // BANNER DE MISIÓN AL INICIAR COMBATE
    // ==========================================
    if (tiempoMisionCombate > 0 && !enModoTutorial) {
        const tiempoTranscurrido = Date.now() - tiempoMisionCombate;
        const duracionBanner = 4000;

        if (tiempoTranscurrido < duracionBanner) {
            let alphaBanner = 1;
            if (tiempoTranscurrido < 500) {
                alphaBanner = tiempoTranscurrido / 500; // Fade in
            } else if (tiempoTranscurrido > duracionBanner - 500) {
                alphaBanner = (duracionBanner - tiempoTranscurrido) / 500; // Fade out
            }

            ctx.save();
            ctx.globalAlpha = alphaBanner;

            const banW = 340;
            const banH = 70;
            const banX = (480 - banW) / 2;
            const banY = 80; // Centro de la pantalla

            // Fondo oscuro semitransparente
            ctx.fillStyle = "rgba(10, 10, 15, 0.9)";
            ctx.beginPath();
            ctx.roundRect(banX, banY, banW, banH, 6);
            ctx.fill();

            // Borde de color misión (rojo/naranja)
            ctx.strokeStyle = "#e74c3c";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Título principal
            ctx.fillStyle = "#ffcc00";
            ctx.font = "10px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText("¡NUEVA MISIÓN: COMBATE!", 240, banY + 25);

            // Texto descriptivo
            ctx.fillStyle = "#ffffff";
            ctx.font = "6px 'Press Start 2P'";
            ctx.fillText("Derrota a este enemigo para ganar monedas (OG)", 240, banY + 45);
            ctx.fillText("y poder mejorar tu mazo en la tienda.", 240, banY + 57);

            ctx.restore();
        }
    }

    // Dibujar inventario también en combate
    dibujarInventario();
}
function dibujarPantallaVictoria() {
    // ── Fondo ────────────────────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, 0, 270);
    grad.addColorStop(0, "#0d1f0d");
    grad.addColorStop(0.5, "#1a2e1a");
    grad.addColorStop(1, "#0a1628");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);

    // Partículas decorativas doradas
    const t = Date.now() / 600;
    const particulas = [
        [45, 25], [100, 18], [180, 10], [260, 22], [340, 14], [410, 28], [455, 20],
        [70, 240], [150, 252], [230, 245], [310, 258], [390, 248], [450, 238],
        [30, 100], [470, 130], [20, 180], [460, 170]
    ];
    particulas.forEach(function (p, i) {
        const b = 0.3 + 0.7 * Math.abs(Math.sin(t + i * 0.9));
        const size = (i % 3 === 0) ? 3 : 2;
        ctx.fillStyle = "rgba(255, 210, 0, " + b + ")";
        ctx.fillRect(p[0], p[1], size, size);
    });

    // ── Corona / Trofeo decorativo ────────────────────────────────────
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "30px serif";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("👑", 240, 68);
    ctx.restore();

    // ── Título ────────────────────────────────────────────────────────
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffdd00";
    ctx.font = "11px 'Press Start 2P'";
    ctx.fillText("¡VICTORIA!", 240, 100);

    // Línea decorativa
    ctx.strokeStyle = "rgba(255, 200, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 112);
    ctx.lineTo(380, 112);
    ctx.stroke();

    // ── Nombre del enemigo derrotado ──────────────────────────────────
    ctx.fillStyle = "#e0e0e0";
    ctx.font = "5.5px 'Press Start 2P'";
    ctx.fillText("Has derrotado a:", 240, 130);

    ctx.fillStyle = "#ff8c42";
    ctx.font = "7px 'Press Start 2P'";
    ctx.fillText(nombreEnemigoVencido, 240, 148);

    // ── Recompensas ───────────────────────────────────────────────────
    ctx.fillStyle = "#a8d8a8";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText("La Pachamama te recompensa...", 240, 175);

    ctx.fillStyle = "#888888";
    ctx.font = "4px 'Press Start 2P'";
    ctx.fillText("Podrás elegir una carta para tu mazo", 240, 190);

    // ── Botón continuar (parpadeo) ────────────────────────────────────
    if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = "#ffcc00";
        ctx.font = "5px 'Press Start 2P'";
        ctx.fillText("— Haz clic para continuar —", 240, 240);
    }

    ctx.textAlign = "left";
}
function dibujarPantallaRecompensa() {
    // Indicar si hay algún botón en hover para cambiar el cursor
    let hoverBotonGeneral = false;

    // ── Fondo ────────────────────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, 0, 270);
    grad.addColorStop(0, "#081c15"); // Verde profundo
    grad.addColorStop(0.5, "#1b4332"); // Verde bosque
    grad.addColorStop(1, "#0d1b2a"); // Azul noche
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);

    // Partículas decorativas animadas
    const t = Date.now() / 600;
    const particulas = [
        [30, 40], [80, 25], [140, 15], [200, 30], [280, 20], [360, 35], [420, 25],
        [60, 230], [120, 245], [190, 235], [260, 250], [330, 240], [400, 245], [450, 230],
        [15, 120], [460, 140], [25, 180], [455, 190]
    ];
    particulas.forEach(function (p, i) {
        const b = 0.2 + 0.8 * Math.abs(Math.sin(t + i * 0.7));
        const size = (i % 3 === 0) ? 3 : 2;
        ctx.fillStyle = (i % 2 === 0) ? "rgba(255, 215, 0, " + b + ")" : "rgba(46, 204, 113, " + b + ")";
        ctx.fillRect(p[0], p[1], size, size);
    });

    // 👑 Corona / Trofeo decorativo 👑
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "28px serif";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("👑", 240, 35);
    ctx.restore();

    // ── Título ────────────────────────────────────────────────────────
    ctx.textAlign = "center";
    ctx.fillStyle = esRecompensaJefe ? "#f1c40f" : "#ffdd00";
    ctx.font = "10px 'Press Start 2P'";
    ctx.fillText(esRecompensaJefe ? "¡VICTORIA ÉPICA!" : "¡VICTORIA!", 240, 55);

    // Línea decorativa
    ctx.strokeStyle = "rgba(255, 200, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 65);
    ctx.lineTo(380, 65);
    ctx.stroke();

    // ── Nombre del enemigo ──────────────────────────────────────────
    ctx.fillStyle = "#e0e0e0";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText("Has derrotado a:", 240, 80);

    ctx.fillStyle = "#ff8c42";
    ctx.font = "7px 'Press Start 2P'";
    ctx.fillText(nombreEnemigoVencido, 240, 93);

    // ── Recompensas ───────────────────────────────────────────────────
    ctx.fillStyle = "#f39c12";
    ctx.font = "6px 'Press Start 2P'";
    ctx.fillText("\uD83D\uDCB0 Oro obtenido: +" + oroRecompensa + "G", 240, 110);

    if (esRecompensaJefe && reliquiaJefeObtenida) {
        // ── Panel de reliquia de jefe ─────────
        const rx = 100, ry = 120, rw = 280, rh = 74;
        const gReliq = ctx.createLinearGradient(rx, ry, rx, ry + rh);
        gReliq.addColorStop(0, "rgba(80,50,0,0.95)");
        gReliq.addColorStop(1, "rgba(35,18,0,0.95)");
        ctx.fillStyle = gReliq;
        ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 8); ctx.fill();

        // Borde dorado pulsante
        const tGlow = 0.5 + 0.5 * Math.sin(Date.now() / 200);
        ctx.strokeStyle = "rgba(255,200,0," + (0.6 + tGlow * 0.4) + ")";
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 8); ctx.stroke();

        // Etiqueta
        ctx.fillStyle = "#f1c40f"; ctx.font = "4px 'Press Start 2P'"; ctx.textAlign = "center";
        ctx.fillText("\u2736 RELIQUIA DE JEFE \u2736", 240, ry + 16);

        // Sprite y textos de la reliquia
        if (imagenesCargadas.personajes && imagenesCargadas.personajes[reliquiaJefeObtenida.spriteKey]) {
            let img = imagenesCargadas.personajes[reliquiaJefeObtenida.spriteKey];
            ctx.drawImage(img, 240 - 12, ry + 20, 24, 24);
            
            ctx.fillStyle = "#ffffff"; ctx.font = "6px 'Press Start 2P'";
            ctx.fillText(reliquiaJefeObtenida.nombre, 240, ry + 56);
            
            ctx.fillStyle = "#c0a060"; ctx.font = "3.8px 'Press Start 2P'";
            ctx.fillText(reliquiaJefeObtenida.descripcion || "", 240, ry + 67);
        } else {
            ctx.fillStyle = "#ffffff"; ctx.font = "6px 'Press Start 2P'";
            ctx.fillText(reliquiaJefeObtenida.nombre, 240, ry + 35);
            
            ctx.fillStyle = "#c0a060"; ctx.font = "3.8px 'Press Start 2P'";
            ctx.fillText(reliquiaJefeObtenida.descripcion || "", 240, ry + 51);
        }
        ctx.textAlign = "left";
    } else {
        ctx.fillStyle = "#ffffff"; ctx.font = "4.5px 'Press Start 2P'"; ctx.textAlign = "center";
        ctx.fillText("\u00A1Visita la tienda para mejorar tu mazo!", 240, 135);
        ctx.textAlign = "left";
    }

    const cfgR = UI_CONFIG.recompensa;

    // ── Botón Continuar ──────────────────────────────────────────────────
    const btnOmitir = cfgR.omitir;
    btnOmitir.x = 240 - (btnOmitir.w / 2); // Centrar el botón
    btnOmitir.y = esRecompensaJefe ? 205 : 165; // Más abajo si hay reliquia
    const hoverOmitir = (mouseX >= btnOmitir.x && mouseX <= btnOmitir.x + btnOmitir.w &&
        mouseY >= btnOmitir.y && mouseY <= btnOmitir.y + btnOmitir.h);

    let by = btnOmitir.y;
    if (hoverOmitir) {
        hoverBotonGeneral = true;
        by -= 1; // Leve movimiento
    }

    ctx.save();
    ctx.fillStyle = hoverOmitir ? "#27ae60" : "#2c3e50";
    ctx.strokeStyle = hoverOmitir ? "#ffcc00" : "#7f8c8d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(btnOmitir.x, by, btnOmitir.w, btnOmitir.h, 5);
    else ctx.rect(btnOmitir.x, by, btnOmitir.w, btnOmitir.h);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("RECOLECTAR Y CONTINUAR", btnOmitir.x + btnOmitir.w / 2, by + 16);
    ctx.restore();

    // Actualizar cursor del canvas
    if (hoverBotonGeneral) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "default";
    }

    ctx.textAlign = "left";
}
function dibujarPantallaTienda() {
    let hoverBotonGeneral = false;

    // ── FONDO ──────────────────────────────────────────────────────────
    const nodoTienda = nodosMapa[nodoActualIndex];
    const datosTienda = {
        1: {
            4: { nombre: "MERCADO BENIENSE", bgKey: "tienda" },
            5: { nombre: "BARRACA DEL MADERERO", bgKey: "tiendaGuaya" }
        },
        2: { 8: { nombre: "MERCADO MINERO", bgKey: "tienda_bg_2_8" } }
    }[actoActual]?.[nodoTienda ? nodoTienda.id : -1] || { nombre: "TIENDA DEL CALLAWAYA", bgKey: "tienda" };

    const bg = imagenesCargadas && imagenesCargadas.fondos && imagenesCargadas.fondos[datosTienda.bgKey];
    if (bg && bg.complete && bg.naturalWidth !== 0) {
        ctx.drawImage(bg, 0, 0, 480, 270);
        ctx.fillStyle = "rgba(4, 2, 0, 0.70)";
        ctx.fillRect(0, 0, 480, 270);
    } else {
        const gBg = ctx.createLinearGradient(0, 0, 0, 270);
        gBg.addColorStop(0, "#100800"); gBg.addColorStop(0.5, "#1c0e02"); gBg.addColorStop(1, "#0a0500");
        ctx.fillStyle = gBg; ctx.fillRect(0, 0, 480, 270);
    }

    // Partículas de polvo de mercado
    const tP = Date.now() / 900;
    [[28, 18], [85, 9], [155, 22], [225, 6], [305, 19], [385, 11], [450, 23],
    [50, 254], [140, 247], [215, 258], [300, 251], [395, 256], [455, 249]].forEach(([sx, sy], si) => {
        const br = 0.25 + 0.6 * Math.abs(Math.sin(tP + si * 1.1));
        ctx.fillStyle = `rgba(255,200,80,${br * 0.4})`;
        ctx.beginPath(); ctx.arc(sx, sy, si % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2); ctx.fill();
    });

    // ── TOP: ORO | TÍTULO | SALIR ───────────────────────────────────────
    ctx.fillStyle = "#f1c40f"; ctx.font = "5px 'Press Start 2P'"; ctx.textAlign = "left";
    ctx.fillText("\uD83D\uDCB0 " + jugador.oro + "G", 8, 13);

    ctx.fillStyle = "#ffcc00"; ctx.font = "6px 'Press Start 2P'"; ctx.textAlign = "center";
    ctx.fillText(datosTienda.nombre, 240, 13);

    const btnV = UI_CONFIG.tienda.volverMapa;
    const hovV = esCursorSobreBoton(btnV.x, btnV.y, btnV.w, btnV.h);
    if (hovV) hoverBotonGeneral = true;
    ctx.fillStyle = hovV ? "rgba(220,60,40,0.95)" : "rgba(160,25,15,0.88)";
    ctx.strokeStyle = hovV ? "#ffcc00" : "#e74c3c"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(btnV.x, btnV.y, btnV.w, btnV.h, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "5px 'Press Start 2P'"; ctx.textAlign = "center";
    ctx.fillText("SALIR", btnV.x + btnV.w / 2, btnV.y + 12);

    // ── PESTAÑAS ────────────────────────────────────────────────────────
    ctx.textAlign = "left";
    UI_CONFIG.tienda.tabs.forEach(tab => {
        const isSel = (pestanaTiendaActual === tab.id);
        const hov = esCursorSobreBoton(tab.x, tab.y, tab.w, tab.h);
        if (hov) hoverBotonGeneral = true;
        // Fondo de pestaña
        ctx.fillStyle = isSel ? "#f1c40f" : (hov ? "rgba(80,50,10,0.92)" : "rgba(20,10,2,0.88)");
        ctx.strokeStyle = isSel ? "#ffcc00" : (hov ? "#c07020" : "#4a2a08");
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(tab.x, tab.y, tab.w, tab.h, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isSel ? "#0a0500" : (hov ? "#ffe0a0" : "#a07030");
        ctx.font = "5px 'Press Start 2P'"; ctx.textAlign = "center";
        ctx.fillText(tab.texto, tab.x + tab.w / 2, tab.y + 13);
    });
    ctx.textAlign = "left";

    // ── CONTENIDO: PASIVAS (2x2 grid de buffs por niveles) ──────────────
    if (pestanaTiendaActual === 'pasivas') {
        const BL = [{ x: 12, y: 48 }, { x: 250, y: 48 }, { x: 12, y: 132 }, { x: 250, y: 132 }];
        const BW = 210, BH = 74;

        BUFFS_NIVELES.forEach((buff, bi) => {
            if (bi >= BL.length) return;
            const { x: bx, y: by } = BL[bi];
            const nv = jugador.pasivas[buff.id] || 0;
            const maxNv = buff.niveles.length;
            const isMax = nv >= maxNv;
            const nextDat = isMax ? null : buff.niveles[nv];
            const isSel = (itemSeleccionadoTienda && itemSeleccionadoTienda.buffId === buff.id);
            const hov = esCursorSobreBoton(bx, by, BW, BH);
            if (hov && !isMax) hoverBotonGeneral = true;

            // Fondo
            ctx.fillStyle = isSel ? buff.colorOsc : (isMax ? "rgba(40,30,5,0.6)" : (hov ? "rgba(30,18,4,0.95)" : "rgba(14,8,2,0.90)"));
            ctx.strokeStyle = isSel ? buff.color : (isMax ? "#f1c40f" : (hov ? "#c07020" : "#3a2208"));
            ctx.lineWidth = isSel ? 2.5 : 1.5;
            ctx.beginPath(); ctx.roundRect(bx, by, BW, BH, 7); ctx.fill(); ctx.stroke();
            if (isSel) { ctx.stroke(); }

            // Icono
            ctx.font = "16px serif"; ctx.textAlign = "left"; ctx.fillText(buff.icono, bx + 7, by + 22);

            // Nombre
            ctx.fillStyle = isMax ? "#f1c40f" : "#ffe0a0"; ctx.font = "4.5px 'Press Start 2P'";
            ctx.fillText(buff.nombre, bx + 30, by + 17);

            // Estrellas de nivel
            for (let s = 0; s < maxNv; s++) {
                ctx.fillStyle = s < nv ? buff.color : "#2a1808"; ctx.font = "11px serif";
                ctx.fillText("★", bx + 30 + s * 15, by + 33);
            }
            // Nivel texto
            ctx.fillStyle = "#a07030"; ctx.font = "3.5px 'Press Start 2P'";
            ctx.fillText("Nv." + nv + "/" + maxNv, bx + 30 + maxNv * 15 + 4, by + 31);

            // Separador
            ctx.strokeStyle = "rgba(255,200,80,0.12)"; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(bx + 8, by + 42); ctx.lineTo(bx + BW - 8, by + 42); ctx.stroke();

            // Estado / siguiente nivel
            if (isMax) {
                ctx.fillStyle = "#f1c40f"; ctx.font = "4px 'Press Start 2P'"; ctx.textAlign = "center";
                ctx.fillText("\u2605 NIVEL M\u00C1XIMO \u2605", bx + BW / 2, by + 60);
                ctx.textAlign = "left";
            } else {
                ctx.fillStyle = "#907040"; ctx.font = "3.5px 'Press Start 2P'";
                ctx.fillText("Siguiente: " + nextDat.desc, bx + 8, by + 55);
                ctx.fillStyle = "#f1c40f"; ctx.font = "4px 'Press Start 2P'";
                ctx.fillText(nextDat.costo + "G", bx + BW - 40, by + 55);
                ctx.fillStyle = "#604020"; ctx.font = "3px 'Press Start 2P'";
                ctx.fillText("para subir", bx + BW - 40, by + 65);
            }
        });

    } else {
        // ── CONTENIDO: OBJETOS / MAZO (4 cartas estilo Andino) ──────────
        const items = itemsTiendaActuales[pestanaTiendaActual] || [];
        const CW = 100, CH = 148, GAP = 12;
        const startX = Math.floor((480 - (4 * CW + 3 * GAP)) / 2);  // = 22
        const startY = 45;

        if (items.length === 0) {
            ctx.fillStyle = "#a07030"; ctx.font = "5px 'Press Start 2P'"; ctx.textAlign = "center";
            ctx.fillText("Sin art\u00EDculos disponibles", 240, 130);
            ctx.textAlign = "left";
        } else {
            items.forEach((item, idx) => {
                const cx = startX + idx * (CW + GAP);
                const cy = startY;
                const isSel = (itemSeleccionadoTienda && itemSeleccionadoTienda.id === item.id);
                const hov = esCursorSobreBoton(cx, cy, CW, CH);
                if (hov) hoverBotonGeneral = true;

                // Color de acento por tipo/categoría
                let acent = "#e67e22", acentDark = "rgba(90,35,5,0.50)";
                const cat = item.categoria || "";
                if (cat.includes('defen') || (item.desc || '').includes('Def')) { acent = "#3498db"; acentDark = "rgba(8,28,70,0.50)"; }
                else if (cat.includes('eleme')) { acent = "#9b59b6"; acentDark = "rgba(35,8,70,0.50)"; }
                else if (cat.includes('mejora') || (item.desc || '').includes('Vida')) { acent = "#2ecc71"; acentDark = "rgba(8,60,25,0.50)"; }
                else if (cat.includes('nerfeo')) { acent = "#8e44ad"; acentDark = "rgba(40,5,60,0.50)"; }
                else if (cat.includes('ofens')) { acent = "#e74c3c"; acentDark = "rgba(80,10,10,0.50)"; }

                // Fondo de carta (gradiente cálido oscuro)
                const gCard = ctx.createLinearGradient(cx, cy, cx, cy + CH);
                if (isSel) {
                    gCard.addColorStop(0, "#201205");
                    gCard.addColorStop(1, "#100800");
                } else {
                    gCard.addColorStop(0, "#130900");
                    gCard.addColorStop(1, "#0a0500");
                }
                ctx.fillStyle = gCard;
                ctx.beginPath(); ctx.roundRect(cx, cy, CW, CH, 7); ctx.fill();

                // Borde (glow dorado si seleccionado)
                if (isSel) { }
                ctx.strokeStyle = isSel ? "#f1c40f" : (hov ? acent : "#3a2208");
                ctx.lineWidth = isSel ? 2.5 : 1.5;
                ctx.beginPath(); ctx.roundRect(cx, cy, CW, CH, 7); ctx.stroke();

                // Línea de acento superior (color de tipo)
                ctx.strokeStyle = acent; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx + 10, cy + 1.5); ctx.lineTo(cx + CW - 10, cy + 1.5); ctx.stroke();

                // Área de icono (panel interior oscuro con tinte de color)
                ctx.fillStyle = acentDark;
                ctx.beginPath(); ctx.roundRect(cx + 3, cy + 4, CW - 6, 60, 4); ctx.fill();

                // Emoji icon o nueva imagen
                let imgItem = null;
                if (pestanaTiendaActual === 'objetos') {
                    let cat = obtenerCategoriaItem(item.id);
                    imgItem = imgCategorias[cat];
                } else if (pestanaTiendaActual === 'mazo' || item.carta) {
                    let cardName = item.nombre || (item.carta && item.carta.nombre);
                    imgItem = imagenesCargadas.cartas && imagenesCargadas.cartas[cardName];
                    if (!imgItem) {
                        let catIcon = item.categoria || (item.carta && item.carta.categoria) || "";
                        let iconKey = catIcon;
                        if (catIcon === 'ofensiva') iconKey = 'ataque';
                        if (catIcon === 'defensiva') iconKey = 'defensa';
                        if (catIcon === 'mejora' || catIcon === 'nerfeo') iconKey = 'mejora';
                        if (catIcon === 'elemental') iconKey = 'fuego';
                        imgItem = imagenesCargadas.cartas && imagenesCargadas.cartas[iconKey];
                    }
                }

                // Centrar texto para los nombres de abajo
                ctx.textAlign = "center";

                if (imgItem && imgItem.complete && imgItem.naturalWidth !== 0) {
                    ctx.drawImage(imgItem, cx + CW / 2 - 28, cy + 6, 56, 56);
                } else {
                    ctx.font = "24px serif";
                    ctx.fillText(item.emoji || (item.carta ? "🃏" : "✨"), cx + CW / 2, cy + 37);
                }

                // Nombre de la carta
                ctx.fillStyle = isSel ? "#ffcc00" : "#ffe0a0";
                ctx.font = "3.8px 'Press Start 2P'";
                const nm = (item.nombre || (item.carta && item.carta.nombre) || "?");
                ctx.fillText(nm, cx + CW / 2, cy + 76);

                // Descripción
                ctx.fillStyle = "#907040"; ctx.font = "3.2px 'Press Start 2P'";
                const ds = (item.desc || (item.carta && item.carta.descripcion) || "");
                ctx.fillText(ds, cx + CW / 2, cy + 89);

                // Separador
                ctx.strokeStyle = "rgba(255,180,50,0.12)"; ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(cx + 8, cy + 100); ctx.lineTo(cx + CW - 8, cy + 100); ctx.stroke();

                // Costo (dorado)
                ctx.fillStyle = "#f1c40f"; ctx.font = "4.5px 'Press Start 2P'";
                ctx.fillText("\uD83D\uDCB0 " + item.costo + "G", cx + CW / 2, cy + 116);

                // Tag de tipo (pequeño, color de acento)
                ctx.fillStyle = acent + "cc"; ctx.font = "3px 'Press Start 2P'";
                const tipoTag = item.tipo || (item.carta && item.carta.tipo) || "";
                ctx.fillText(tipoTag, cx + CW / 2, cy + 130);

                ctx.textAlign = "left";
            });
        }
    }

    // ── BOTONES INFERIORES ────────────────────────────────────────────────

    // CAMBIAR (solo objetos y mazo)
    if (pestanaTiendaActual !== 'pasivas') {
        const bC = { x: 20, y: 204, w: 158, h: 24 };
        const hovC = esCursorSobreBoton(bC.x, bC.y, bC.w, bC.h);
        if (hovC) hoverBotonGeneral = true;
        const puedeCambiar = jugador.oro >= costoReemplazar;
        ctx.fillStyle = !puedeCambiar ? "rgba(15,8,2,0.85)" : (hovC ? "rgba(60,40,8,0.95)" : "rgba(25,14,3,0.88)");
        ctx.strokeStyle = !puedeCambiar ? "#2a1808" : (hovC ? "#c07020" : "#6a3a0a");
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(bC.x, bC.y, bC.w, bC.h, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = !puedeCambiar ? "#4a2808" : (hovC ? "#ffcc00" : "#c09040");
        ctx.font = "4.5px 'Press Start 2P'"; ctx.textAlign = "center";
        ctx.fillText("\u21BA CAMBIAR (" + costoReemplazar + "G)", bC.x + bC.w / 2, bC.y + 16);
    }

    // COMPRAR (siempre visible, activo si hay selección y oro suficiente)
    const haySel = !!itemSeleccionadoTienda;
    let costoSel = 0;
    if (haySel) {
        if (pestanaTiendaActual === 'pasivas' && itemSeleccionadoTienda.buffId) {
            const bf = BUFFS_NIVELES.find(b => b.id === itemSeleccionadoTienda.buffId);
            const nv = jugador.pasivas[itemSeleccionadoTienda.buffId] || 0;
            if (bf && nv < bf.niveles.length) costoSel = bf.niveles[nv].costo;
        } else {
            costoSel = itemSeleccionadoTienda.costo || 0;
        }
    }
    const bComprar = { x: 302, y: 204, w: 158, h: 24 };
    const hovComp = esCursorSobreBoton(bComprar.x, bComprar.y, bComprar.w, bComprar.h);
    if (hovComp && haySel) hoverBotonGeneral = true;
    const puedeComp = haySel && costoSel > 0 && jugador.oro >= costoSel;
    ctx.fillStyle = !haySel ? "rgba(15,8,2,0.85)" : (!puedeComp ? "rgba(25,5,5,0.88)" : (hovComp ? "rgba(20,100,40,0.95)" : "rgba(10,60,20,0.88)"));
    ctx.strokeStyle = !haySel ? "#2a1808" : (!puedeComp ? "#8e0000" : (hovComp ? "#27ae60" : "#1e6e3a"));
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bComprar.x, bComprar.y, bComprar.w, bComprar.h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = !haySel ? "#4a2808" : (!puedeComp ? "#e74c3c" : "#ffffff");
    ctx.font = "4.5px 'Press Start 2P'"; ctx.textAlign = "center";
    const lblComp = !haySel ? "COMPRAR" : (!puedeComp ? "ORO INSUF." : "\u2713 COMPRAR (" + costoSel + "G)");
    ctx.fillText(lblComp, bComprar.x + bComprar.w / 2, bComprar.y + 16);
    ctx.textAlign = "left";

    // ── TUTORIAL DE LA TIENDA (ACTO 0) ──
    if (actoActual === 0 && !tiendaTutorialCompletado) {
        if (tiendaTutorialPaso === 0 || tiendaTutorialPaso === 4) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(0, 0, 480, 270);
        } else if (tiendaTutorialPaso === 1) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, 480, 270);
            ctx.rect(15, 199, 168, 34); // CAMBIAR aproximado con margen
            ctx.rect(297, 199, 168, 34); // COMPRAR aproximado con margen
            ctx.clip("evenodd");
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, 480, 270);
            ctx.restore();
            ctx.strokeStyle = "#f1c40f"; ctx.lineWidth = 2; ctx.setLineDash([4, 2]);
            ctx.strokeRect(15, 199, 168, 34);
            ctx.strokeRect(297, 199, 168, 34);
            ctx.setLineDash([]);
        } else if (tiendaTutorialPaso === 2) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, 480, 270);
            ctx.rect(119, 17, 118, 28); // PASIVAS tab con margen
            ctx.clip("evenodd");
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, 480, 270);
            ctx.restore();
            ctx.strokeStyle = "#f1c40f"; ctx.lineWidth = 2; ctx.setLineDash([4, 2]);
            ctx.strokeRect(119, 17, 118, 28);
            ctx.setLineDash([]);
        } else if (tiendaTutorialPaso === 3) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, 480, 270);
            ctx.rect(235, 17, 118, 28); // MAZO tab con margen
            ctx.rect(14, 40, 112, 155); // Primer slot (aprox) para la descripcion
            ctx.clip("evenodd");
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, 480, 270);
            ctx.restore();
            ctx.strokeStyle = "#f1c40f"; ctx.lineWidth = 2; ctx.setLineDash([4, 2]);
            ctx.strokeRect(235, 17, 118, 28);
            ctx.strokeRect(14, 40, 112, 155);
            ctx.setLineDash([]);
        }

        if (tiendaTutorialPaso === 0) {
            dibujarDialogoRPG(null, "Yatiri", "LA TIENDA SIRVE PARA COMPRAR OBJETOS Y CARTAS Y, MUY IMPORTANTE, SUBIR STATS. LOS OBJETOS LOS USAS EN COMBATE; SOLO LLEVAS 3 EN BOLSA, EL RESTO AL INVENTARIO.", true);
        } else if (tiendaTutorialPaso === 1) {
            dibujarDialogoRPG(null, "Yatiri", "PUEDES 'CAMBIAR' LAS CARTAS PARA QUE APAREZCAN OTRAS Y CON EL BOTÓN 'COMPRAR' ADQUIERES LO QUE ELIJAS.", true, true);
        } else if (tiendaTutorialPaso === 2) {
            dibujarDialogoRPG(null, "Yatiri", "EN LA PESTAÑA 'PASIVAS' SUBES TUS ESTADÍSTICAS PARA QUE SEA MÁS FÁCIL PASAR LOS ACTOS Y DERROTAR ENEMIGOS.", true);
        } else if (tiendaTutorialPaso === 3) {
            dibujarDialogoRPG(null, "Yatiri", "EN 'MAZO' COMPRAS CARTAS. PUEDES LEER QUÉ HACEN EN SU DESCRIPCIÓN. ¡SIRVEN PARA QUE TODO SEA MÁS FLUIDO Y MEJOR!", true);
        } else if (tiendaTutorialPaso === 4) {
            dibujarDialogoRPG(null, "Yatiri", "AHORA ES TU DECISIÓN SI QUIERES COMPRAR ALGO O SALIR PARA COMPRAR EN OTRO MOMENTO. ¡ES TOTALMENTE TU ELECCIÓN!", true);
        }
    }

    if (hoverBotonGeneral && (!actoActual || tiendaTutorialCompletado || actoActual !== 0)) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "default";
    }
}

// Partículas del humo de la k'oa (incienso andino) para el evento
let particulasKoa = [];

function dibujarPantallaEvento() {
    let hoverBotonGeneral = false;
    const ahora = performance.now();

    // ── 1. Fondo Místico Andino (Dinámico según el nodo del Acto 1) ──
    const claveFondoActo = `evento_bg_${actoActual}_${nodoActualIndex}`;
    const claveFondoOriginal = `evento_bg_${nodoActualIndex}`;
    const fondoEvento = imagenesCargadas.fondos && (imagenesCargadas.fondos[claveFondoActo] || imagenesCargadas.fondos[claveFondoOriginal] || imagenesCargadas.fondos.evento);
    const tieneFondoImagen = (fondoEvento && fondoEvento.complete && fondoEvento.naturalWidth !== 0);

    if (tieneFondoImagen) {
        ctx.drawImage(fondoEvento, 0, 0, 480, 270);
    } else {
        const gradiente = ctx.createLinearGradient(0, 0, 0, 270);
        gradiente.addColorStop(0, "#08060c"); // Negro-púrpura muy oscuro
        gradiente.addColorStop(0.5, "#180e29"); // Púrpura místico
        gradiente.addColorStop(1, "#0a1128"); // Azul noche profundo
        ctx.fillStyle = gradiente;
        ctx.fillRect(0, 0, 480, 270);
    }

    // Resplandor espiritual del Yatiri (solo si no hay fondo de imagen, para no tapar el pixel art)
    if (!tieneFondoImagen) {
        const pulsoResplandor = 60 + Math.sin(ahora * 0.002) * 10;
        const resplandor = ctx.createRadialGradient(370, 110, 10, 370, 110, pulsoResplandor);
        resplandor.addColorStop(0, "rgba(155, 89, 182, 0.3)"); // Púrpura brillante
        resplandor.addColorStop(1, "rgba(8, 6, 12, 0)");
        ctx.fillStyle = resplandor;
        ctx.beginPath();
        ctx.arc(370, 110, pulsoResplandor, 0, Math.PI * 2);
        ctx.fill();
    }

    // Generar partículas de humo de k'oa (brasas rituales, se elevan desde el sahumerio en código o desde la fogata del pixel art)
    const origenX = tieneFondoImagen ? 240 : 370; // en el centro para el pixel art, a la derecha para la silueta
    const origenY = tieneFondoImagen ? 200 : 137;

    if (Math.random() < 0.1) {
        particulasKoa.push({
            x: origenX + (Math.random() - 0.5) * 20,
            y: origenY,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(Math.random() * 0.5 + 0.3),
            size: Math.random() * 2 + 1.5,
            life: 1.0,
            decay: Math.random() * 0.01 + 0.005
        });
    }

    // Dibujar y actualizar partículas
    particulasKoa.forEach((p, idx) => {
        p.x += p.vx + Math.sin(ahora * 0.005 + idx) * 0.1; // vaivén
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
            particulasKoa.splice(idx, 1);
        } else {
            ctx.fillStyle = "rgba(164, 180, 210, " + (p.life * 0.4) + ")";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // ── 2. Dibujo Artístico del Yatiri / Sahumerio (SOLO si NO hay fondo de imagen activo) ──
    if (!tieneFondoImagen) {
        // Mesa de ofrenda (sahumerio)
        ctx.fillStyle = "#3e2723"; // Madera marrón
        ctx.fillRect(350, 140, 40, 6);
        ctx.fillStyle = "#271510";
        ctx.fillRect(355, 146, 30, 20); // Soporte

        // Sahumerio (k'oa encendida)
        ctx.fillStyle = "#cfd8dc";
        ctx.beginPath();
        ctx.arc(370, 137, 4, 0, Math.PI * 2);
        ctx.fill();
        // Ascuas encendidas
        const pulsoFuego = 0.5 + 0.5 * Math.abs(Math.sin(ahora * 0.01));
        ctx.fillStyle = "rgba(230, 126, 34, " + pulsoFuego + ")";
        ctx.fillRect(368, 136, 4, 2);

        // Silueta del Yatiri en meditación (Lado derecho, x=370, y=110)
        // Túnica
        ctx.fillStyle = "#4a148c"; // Púrpura oscuro
        ctx.beginPath();
        ctx.moveTo(350, 135);
        ctx.lineTo(390, 135);
        ctx.lineTo(380, 95);
        ctx.lineTo(360, 95);
        ctx.closePath();
        ctx.fill();

        // Poncho ceremonial (decorado)
        ctx.fillStyle = "#ff6f00"; // Naranja
        ctx.beginPath();
        ctx.moveTo(355, 135);
        ctx.lineTo(385, 135);
        ctx.lineTo(370, 105);
        ctx.closePath();
        ctx.fill();

        // Cabeza / Chullo
        ctx.fillStyle = "#d7ccc8"; // Rostro
        ctx.beginPath();
        ctx.arc(370, 88, 6, 0, Math.PI * 2);
        ctx.fill();
        // Chullo (gorro andino)
        ctx.fillStyle = "#0d47a1"; // Azul
        ctx.beginPath();
        ctx.moveTo(363, 85);
        ctx.lineTo(377, 85);
        ctx.lineTo(370, 72);
        ctx.closePath();
        ctx.fill();
        // Borla del chullo
        ctx.fillStyle = "#e53935"; // Rojo
        ctx.beginPath();
        ctx.arc(370, 71, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ── 3. Obtener datos del evento según nodo actual ──────────────────
    const claveEvento = `${actoActual}_${nodoActualIndex}`;
    const eventoActual = EVENTOS_POR_NODO[claveEvento] || EVENTO_YATIRI_FALLBACK;

    // ── 4. Panel de Narrativa en el lateral izquierdo ───────────────────
    // Deja el lateral derecho (x > 225) totalmente libre para ver el fondo pixel art completo
    const px = 15, py = 15;
    const pw = 210, ph = 240;

    // Fondo translúcido del panel
    ctx.fillStyle = "rgba(8, 6, 15, 0.65)";
    ctx.strokeStyle = "#9b59b6"; // Borde principal púrpura
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 8);
    else ctx.rect(px, py, pw, ph);
    ctx.fill();
    ctx.stroke();

    // Sub-borde dorado interno
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px + 4, py + 4, pw - 8, ph - 8, 6);
    else ctx.rect(px + 4, py + 4, pw - 8, ph - 8);
    ctx.stroke();

    // Título con contorno
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.font = "7px 'Press Start 2P'";
    ctx.strokeText(eventoActual.titulo, px + 12, py + 20);
    ctx.fillStyle = "#f1c40f"; // Dorado
    ctx.fillText(eventoActual.titulo, px + 12, py + 20);

    // Separador sutil
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(px + 12, py + 28);
    ctx.lineTo(px + pw - 12, py + 28);
    ctx.stroke();

    // Word-wrap para la descripción
    function wrapText(text, maxChars) {
        const words = text.replace(/\n/g, " \n ").split(" ");
        let lines = [];
        let currentLine = "";
        words.forEach(word => {
            if (word === "\n") {
                if (currentLine) lines.push(currentLine);
                lines.push("");
                currentLine = "";
            } else if ((currentLine + " " + word).trim().length <= maxChars) {
                currentLine = (currentLine + " " + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    // Dibujar descripción
    ctx.font = "4px 'Press Start 2P'";
    const descLines = wrapText(eventoActual.descripcion, 32);
    descLines.forEach((linea, index) => {
        ctx.strokeText(linea, px + 12, py + 42 + (index * 9));
        ctx.fillStyle = "#fef3c7"; // Blanco pergamino
        ctx.fillText(linea, px + 12, py + 42 + (index * 9));
    });

    // Línea decorativa intermedia sobre las opciones
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(px + 12, 146);
    ctx.lineTo(px + pw - 12, 146);
    ctx.stroke();

    // ── 5. Botones de Opciones apilados en el panel izquierdo ──────────────
    const w = UI_CONFIG.evento.opcionAncho;
    const h = UI_CONFIG.evento.opcionAlto;
    eventoActual.opciones.forEach((opcion, idx) => {
        const hover = esCursorSobreBoton(opcion.x, opcion.y, w, h);
        let oy = opcion.y;
        if (hover) {
            hoverBotonGeneral = true;
            oy -= 2; // Elevación
        }

        // Sombra de elevación en hover
        ctx.save();
        if (hover) {
        }

        // Caja del botón
        ctx.fillStyle = hover ? "rgba(45, 30, 60, 0.96)" : "rgba(18, 12, 28, 0.90)";
        ctx.strokeStyle = hover ? "#f1c40f" : "#9b59b6";
        ctx.lineWidth = hover ? 1.75 : 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(opcion.x, oy, w, h, 6);
        else ctx.rect(opcion.x, oy, w, h);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Icono contextual según opción
        let icono = "🌿";
        const txtLower = opcion.texto.toLowerCase();
        if (txtLower.includes("huir")) icono = "🏃";
        else if (txtLower.includes("domar")) icono = "🐯";
        else if (txtLower.includes("beber")) icono = "💧";
        else if (txtLower.includes("ofrenda")) icono = "🪙";
        else if (txtLower.includes("rezar")) icono = "🙏";
        else if (idx === 1) icono = "⛰️";

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px serif";
        ctx.fillText(icono, opcion.x + 8, oy + 21);

        // Texto del botón (con centrado vertical y auto wrap de dos líneas si es muy largo)
        const optLines = wrapText(opcion.texto, 25);
        ctx.font = "4px 'Press Start 2P'";

        // Centrado vertical exacto
        const totalTextH = optLines.length * 9;
        const startY = oy + (h - totalTextH) / 2 + 5.5;

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";

        optLines.forEach((line, lineIdx) => {
            ctx.strokeText(line, opcion.x + 26, startY + (lineIdx * 9));
            ctx.fillStyle = hover ? "#f1c40f" : "#ffffff";
            ctx.fillText(line, opcion.x + 26, startY + (lineIdx * 9));
        });
    });

    // Actualizar cursor del canvas
    if (hoverBotonGeneral) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "default";
    }
}
function dibujarPantallaGameOver() {
    // Fondo de derrota (imagen o negro)
    const imgDerrota = imagenesCargadas.fondos && imagenesCargadas.fondos.derrota;
    if (imgDerrota && imgDerrota.complete && imgDerrota.naturalWidth !== 0) {
        ctx.drawImage(imgDerrota, 0, 0, 480, 270);
    } else {
        ctx.fillStyle = "#0c0505";
        ctx.fillRect(0, 0, 480, 270);
    }

    // Capa oscura para dar contraste
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 480, 270);

    // Texto de "FIN DEL JUEGO"
    ctx.save();
    ctx.fillStyle = "#ff4d4d"; // Rojo sangre brillante
    ctx.font = "14px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("FIN DEL JUEGO", 240, 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "6px 'Press Start 2P'";
    ctx.fillText("Mamani ha caido en su travesia...", 240, 130);

    ctx.fillStyle = "#cccccc";
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText("Pero el espiritu andino nunca se rinde.", 240, 150);
    ctx.restore();

    // Botón para reintentar
    const btn = UI_CONFIG.gameOver.reintentar;
    const hover = esCursorSobreBoton(btn.x, btn.y, btn.w, btn.h);
    let by = btn.y;
    if (hover) {
        canvas.style.cursor = "pointer";
        by -= 2; // Desplazar ligeramente hacia arriba
    }

    ctx.fillStyle = hover ? "rgba(220, 50, 50, 0.95)" : "#c0392b";
    ctx.fillRect(btn.x, by, btn.w, btn.h);

    ctx.strokeStyle = hover ? "#ffcc00" : "#ffffff";
    ctx.strokeRect(btn.x, by, btn.w, btn.h);

    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("VOLVER A INTENTAR", btn.x + btn.w / 2, by + 18);
    ctx.textAlign = "left"; // Restaurar
}

function dibujarPantallaVictoriaTotal() {
    // Dibujar fondo de la victoria total (imgVictoriaBase64 cargado en victoriaTotal)
    // Usar imagen diferente para modo leyenda vs victoria normal
    const imgFondoVic = modoLeyenda
        ? (imagenesCargadas.fondos && imagenesCargadas.fondos.victoriaLeyenda)
        : (imagenesCargadas.fondos && imagenesCargadas.fondos.victoriaTotal);
    if (imgFondoVic && imgFondoVic.complete && imgFondoVic.naturalWidth !== 0) {
        ctx.drawImage(imgFondoVic, 0, 0, 480, 270);
    } else {
        ctx.fillStyle = "#030310";
        ctx.fillRect(0, 0, 480, 270);
    }

    // Capa oscura semi-transparente para la narrativa
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, 480, 270);



    // Título de la pantalla
    ctx.save();
    ctx.fillStyle = "#ffcc00"; // Oro
    ctx.font = "10px 'Press Start 2P'";
    ctx.textAlign = "center";

    const tituloText = modoLeyenda ? "SENDA DE LEYENDA COMPLETADA" : "VICTORIA TOTAL";
    ctx.fillText(tituloText, 240, 35);
    ctx.restore();

    // Texto narrativo progresivo (Efecto máquina de escribir)
    const textoCompleto = modoLeyenda ? TEXTO_VICTORIA_LEYENDA : TEXTO_VICTORIA_NORMAL;
    const ahora = Date.now();
    if (ahora - ultimoTickTextoVictoria > 30) { // 30ms por caracter
        if (textoVictoriaIndex < textoCompleto.length) {
            textoVictoriaIndex++;
            ultimoTickTextoVictoria = ahora;
            // Sonar un pequeño click al escribir ocasionalmente
            if (textoVictoriaIndex % 3 === 0) {
                sistemaAudio.sfx('hover');
            }
        }
    }

    const textoMostrado = textoCompleto.substring(0, textoVictoriaIndex);

    ctx.fillStyle = "#ffffff";
    ctx.font = "5px 'Press Start 2P'";
    ctx.textAlign = "center"; // Centrar el texto en lugar de dejarlo al costado

    // Envoltura o ajuste de texto (word-wrap) para el canvas con ancho máximo de 420px
    const lineasParrafos = textoMostrado.split("\n");
    let yCursor = 55; // Inicio del texto narrativo tras el título
    const maxAnchoTexto = 420;

    lineasParrafos.forEach(parrafo => {
        if (parrafo.trim() === "") {
            yCursor += 6; // Espacio entre párrafos vacíos
            return;
        }
        // Ajustamos la línea si excede maxAnchoTexto
        const palabras = parrafo.split(" ");
        let lineaActual = "";

        palabras.forEach(palabra => {
            let lineaPrueba = lineaActual + (lineaActual === "" ? "" : " ") + palabra;
            let anchoPrueba = ctx.measureText(lineaPrueba).width;
            if (anchoPrueba > maxAnchoTexto && lineaActual !== "") {
                ctx.fillText(lineaActual, 240, yCursor);
                lineaActual = palabra;
                yCursor += 10;
            } else {
                lineaActual = lineaPrueba;
            }
        });
        if (lineaActual !== "") {
            ctx.fillText(lineaActual, 240, yCursor);
            yCursor += 12;
        }
    });

    // Botón de Volver al Menú Principal (solo si ya se terminó de escribir el texto)
    if (textoVictoriaIndex >= textoCompleto.length) {
        const btn = { x: 165, y: 250, w: 150, h: 22 };
        const hover = esCursorSobreBoton(btn.x, btn.y, btn.w, btn.h);
        let by = btn.y;
        if (hover) {
            canvas.style.cursor = "pointer";
            by -= 1;
        }

        ctx.fillStyle = hover ? "rgba(46, 204, 113, 0.95)" : "#2ecc71";
        ctx.fillRect(btn.x, by, btn.w, btn.h);

        ctx.strokeStyle = hover ? "#ffcc00" : "#ffffff";
        ctx.strokeRect(btn.x, by, btn.w, btn.h);

        ctx.fillStyle = hover ? "#121218" : "#ffffff";
        ctx.font = "5px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("VOLVER AL MENU", btn.x + btn.w / 2, by + 13);
        ctx.textAlign = "left"; // Restaurar
    }
}

/* ==========================================================================
    10. INTERACCIONES Y TRANSICIONES
    ========================================================================== */
// Activa el HUD al iniciar el viaje
function iniciarViaje() {
    partidaIniciada = true;
    document.getElementById("menu-ui").style.display = "none";

    // Solicitar pantalla completa en móviles (oculta barras del navegador temporalmente)
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen().catch(err => console.log("Pantalla completa no permitida aún."));
    } else if (docElm.webkitRequestFullscreen) { /* Safari */
        docElm.webkitRequestFullscreen();
    }

    // Ocultamos el menú y mostramos el canvas
    menuUi.style.display = 'none';
    canvas.style.display = 'block';

    // Resetear stats del jugador para la nueva partida
    jugador.hp = jugador.hpMax;
    jugador.ap = jugador.apMax;
    jugador.escudo = 0;

    if (tutorialCompletado) {
        // Ya vio el tutorial en esta sesión → saltar directo al Acto 1
        document.getElementById('hud-ui').style.display = 'flex';
        actoActual = 1;
        reiniciarMapaParaNuevoActo();
        estadoActual = ESTADOS.MAPA;
    } else {
        // Primera vez en esta sesión → cutscene de intro → tutorial (Acto 0)
        document.getElementById('hud-ui').style.display = 'none';
        iniciarCinematicaTransicion(CUTSCENE_SLIDES, function () {
            iniciarTutorial();
            document.getElementById('hud-ui').style.display = 'flex';
        });
    }

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            aplicarEscalaCanvas();
        });
    });
}

function avanzarCutscene() {
    // Si el texto no terminó de escribirse, lo mostramos completo de golpe
    const slide = CUTSCENE_SLIDES[cutsceneSlideActual];
    const textoCompleto = slide.texto;
    if (cutsceneCharIndex < textoCompleto.length || cutsceneTituloIndex < slide.titulo.length) {
        cutsceneCharIndex = textoCompleto.length;
        cutsceneTituloIndex = slide.titulo.length;
        return;
    }

    // Avanzar al siguiente slide
    cutsceneSlideActual++;
    cutsceneCharIndex = 0;
    cutsceneTituloIndex = 0;

    if (cutsceneSlideActual >= CUTSCENE_SLIDES.length) {
        if (cutsceneOnEnd) {
            // Cinemática de transición entre actos
            const cb = cutsceneOnEnd;
            cutsceneOnEnd = null;
            cb();
        } else if (tutorialCompletado) {
            estadoActual = ESTADOS.MAPA;
            document.getElementById('hud-ui').style.display = 'flex';
        } else {
            iniciarTutorial();
        }
    }
}

function iniciarCampamento() {
    campamentoAccionRealizada = false;
    estrellasCampamento = [];
    for (let i = 0; i < 40; i++) {
        estrellasCampamento.push({
            x: Math.random() * 480,
            y: Math.random() * 120, // en la mitad superior del cielo
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.02 + 0.01
        });
    }
    estadoActual = ESTADOS.CAMPAMENTO;
}

// Partículas de la fogata (chispas)
let chispasCampamento = [];

function dibujarPantallaCampamento() {
    // 1. Cielo de fondo (Gradiente oscuro de noche andina)
    const gradiente = ctx.createLinearGradient(0, 0, 0, 270);
    gradiente.addColorStop(0, "#080710"); // Negro-azul muy oscuro
    gradiente.addColorStop(0.6, "#0f1126"); // Azul noche
    gradiente.addColorStop(1, "#1c1e36"); // Azul morado
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, 480, 270);

    // Dibujar imagen de fondo si está disponible (Dinámico según el nodo)
    const claveFondoCamp = `camp_bg_${actoActual}_${nodoActualIndex}`;
    const claveFondoOriginal = `camp_bg_${nodoActualIndex}`;
    const fondoCampamento = imagenesCargadas.fondos && (imagenesCargadas.fondos[claveFondoCamp] || imagenesCargadas.fondos[claveFondoOriginal] || imagenesCargadas.fondos.campamento);
    if (fondoCampamento && fondoCampamento.complete && fondoCampamento.naturalWidth !== 0) {
        ctx.drawImage(fondoCampamento, 0, 0, 480, 270);
    }

    // 2. Dibujar y animar estrellas
    estrellasCampamento.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
            star.speed = -star.speed;
        }
        ctx.fillStyle = "rgba(255, 255, 255, " + Math.max(0.2, Math.min(1, star.alpha)) + ")";
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // 3. Dibujar silueta de montañas lejanas y suelo SOLO si no hay una imagen de fondo activa
    if (!fondoCampamento || !fondoCampamento.complete || fondoCampamento.naturalWidth === 0) {
        ctx.fillStyle = "#0c0d17";
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.lineTo(80, 140);
        ctx.lineTo(160, 180);
        ctx.lineTo(240, 150);
        ctx.lineTo(320, 180);
        ctx.lineTo(400, 130);
        ctx.lineTo(480, 180);
        ctx.lineTo(480, 270);
        ctx.lineTo(0, 270);
        ctx.closePath();
        ctx.fill();

        // Dibujar suelo (La Pascana)
        ctx.fillStyle = "#121424";
        ctx.fillRect(0, 180, 480, 90);
    }

    // 4. Dibujar la fogata animada (Lado derecho x = 380, y = 180)
    const fx = 270;
    const fy = 200;
    const ahora = performance.now();

    // Sombra/Luz de la fogata parpadeando en el suelo
    const pulsoLuz = 35 + Math.sin(ahora * 0.008) * 4;
    const gradLuz = ctx.createRadialGradient(fx, fy, 5, fx, fy, pulsoLuz);
    gradLuz.addColorStop(0, "rgba(230, 90, 10, 0.4)");
    gradLuz.addColorStop(1, "rgba(18, 20, 36, 0)");
    ctx.fillStyle = gradLuz;
    ctx.beginPath();
    ctx.ellipse(fx, fy + 5, pulsoLuz, pulsoLuz * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Troncos de madera (Solo si no hay fondo de imagen)
    if (!fondoCampamento || !fondoCampamento.complete || fondoCampamento.naturalWidth === 0) {
        ctx.fillStyle = "#4a2a14";
        ctx.fillRect(fx - 15, fy + 2, 30, 5);
        ctx.fillRect(fx - 10, fy - 2, 20, 5);
    }

    // Dibujar llamas de la fogata (Triángulos/Elipses dinámicas) (Solo si no hay fondo de imagen)
    if (!fondoCampamento || !fondoCampamento.complete || fondoCampamento.naturalWidth === 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Llama roja externa
        ctx.fillStyle = "#c0392b";
        const altoLlamaRoja = 30 + Math.sin(ahora * 0.012) * 5;
        ctx.beginPath();
        ctx.moveTo(fx - 12, fy + 2);
        ctx.quadraticCurveTo(fx, fy - altoLlamaRoja, fx + 12, fy + 2);
        ctx.closePath();
        ctx.fill();

        // Llama naranja intermedia
        ctx.fillStyle = "#e67e22";
        const altoLlamaNaranja = 22 + Math.sin(ahora * 0.015) * 4;
        ctx.beginPath();
        ctx.moveTo(fx - 8, fy + 2);
        ctx.quadraticCurveTo(fx, fy - altoLlamaNaranja, fx + 8, fy + 2);
        ctx.closePath();
        ctx.fill();

        // Llama amarilla/blanca caliente interna
        ctx.fillStyle = "#f1c40f";
        const altoLlamaAmarilla = 14 + Math.cos(ahora * 0.02) * 3;
        ctx.beginPath();
        ctx.moveTo(fx - 4, fy + 2);
        ctx.quadraticCurveTo(fx, fy - altoLlamaAmarilla, fx + 4, fy + 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Generar chispas que flotan hacia arriba
    if (Math.random() < 0.15) {
        chispasCampamento.push({
            x: fx + (Math.random() - 0.5) * 16,
            y: fy - 5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.8 + 0.4),
            life: 1.0, // alfa inicial
            decay: Math.random() * 0.02 + 0.015
        });
    }

    // Actualizar y dibujar chispas
    chispasCampamento.forEach((chispa, idx) => {
        chispa.x += chispa.vx;
        chispa.y += chispa.vy;
        chispa.life -= chispa.decay;

        if (chispa.life <= 0) {
            chispasCampamento.splice(idx, 1);
        } else {
            ctx.fillStyle = "rgba(243, 156, 18, " + chispa.life + ")";
            ctx.fillRect(chispa.x, chispa.y, 2, 2);
        }
    });

    // 5. Dibujar a Mamani al lado de la fogata (x = 320, y = 175) (Solo si no hay fondo de imagen)
    if (!fondoCampamento || !fondoCampamento.complete || fondoCampamento.naturalWidth === 0) {
        // Usamos el sprite si está cargado
        const spriteMamani = imagenesCargadas.personajes && imagenesCargadas.personajes.mamani;
        if (spriteMamani && spriteMamani.complete && spriteMamani.naturalWidth !== 0) {
            // Sentado o de pie al lado de la fogata, con un ligero vaivén de respiración
            const vaivenY = Math.sin(ahora * 0.003) * 1.5;
            ctx.drawImage(spriteMamani, 310, 115 + vaivenY, 50, 60);
        } else {
            // Silueta placeholder de Mamani descansando
            const vaivenY = Math.sin(ahora * 0.003) * 1.5;
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(320, 125 + vaivenY, 25, 50);

            // Cabeza
            ctx.fillStyle = "#d2b48c";
            ctx.beginPath();
            ctx.arc(332, 115 + vaivenY, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sombra de Mamani
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(332, 180, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 6. DATOS TEMÁTICOS DEL CAMPAMENTO según nodo
    const nodoCamp = nodosMapa[nodoActualIndex];
    const datosCampBase = {
        1: {
            2: {
                titulo: "PASCANA CASTANERA",
                subtitulo: "Bajo la sombra de los castanos a orillas del Beni.",
                op1titulo: "1. DESCANSAR AL CALOR",
                op1desc: "Recuperas 35% HP junto a la fogata.",
                op2titulo: "2. ACULLICO DE HOJA",
                op2desc: "Aumenta +10 a tu HP Maximo."
            },
            6: {
                titulo: "CAMPAMENTO EN LA POZA",
                subtitulo: "Un claro en el pantano, rodeado de lianas y el kuré.",
                op1titulo: "1. DORMIR EN LA HAMACA",
                op1desc: "Recuperas 35% HP en la hamaca.",
                op2titulo: "2. MEDICINA YURA",
                op2desc: "Preparas cura del monte. +10 HP Max."
            },
            9: {
                titulo: "REFUGIO MISIONAL",
                subtitulo: "La mision jesuitica te da cobijo. La campana tane...",
                op1titulo: "1. REZAR EN LA CAPILLA",
                op1desc: "El rezo te sana. Recuperas 35% HP.",
                op2titulo: "2. LEER EL LIBRO SAGRADO",
                op2desc: "La sabiduria fortalece. +10 HP Max."
            }
        },
        2: {
            5: {
                titulo: "LA CIUDAD BLANCA",
                subtitulo: "Universidad San Francisco Xavier de Chuquisaca.",
                op1titulo: "1. CHOCOLATES SUCRENSES",
                op1desc: "Recuperas 40% HP de tu vida maxima.",
                op2titulo: "2. ESTUDIAR LA HISTORIA",
                op2desc: "Entiendes las tacticas. +10 HP Maximo."
            }
        }
    };

    const datosCamp = (datosCampBase[actoActual] && datosCampBase[actoActual][nodoCamp ? nodoCamp.id : -1]) || {
        titulo: "LA PASCANA",
        subtitulo: "Lugar seguro para recuperar fuerzas en la senda.",
        op1titulo: "1. DESCANSAR EN LA FOGATA",
        op1desc: "Recuperas 35% HP de tu vida maxima.",
        op2titulo: "2. MEDITAR CON COCA",
        op2desc: "Aumenta +10 a tu HP Maximo."
    };

    // Panel oscuro detrás de textos si hay imagen de fondo
    const tieneBgCamp = fondoCampamento && fondoCampamento.complete && fondoCampamento.naturalWidth !== 0;
    if (tieneBgCamp) {
        ctx.fillStyle = "rgba(5, 5, 15, 0.72)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(14, 26, 300, 70, 6);
        else ctx.rect(14, 26, 300, 70);
        ctx.fill();
    }

    // Título del campamento (con contorno)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";

    ctx.font = "11px 'Press Start 2P'";
    ctx.strokeText(datosCamp.titulo, 22, 48);
    ctx.fillStyle = "#e67e22";
    ctx.fillText(datosCamp.titulo, 22, 48);

    ctx.font = "5px 'Press Start 2P'";
    ctx.lineWidth = 2;
    ctx.strokeText(datosCamp.subtitulo, 22, 66);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(datosCamp.subtitulo, 22, 66);

    // HP actual de Mamani
    ctx.font = "6px 'Press Start 2P'";
    ctx.lineWidth = 2;
    ctx.strokeText("VIDA: " + jugador.hp + " / " + jugador.hpMax + " HP", 22, 84);
    ctx.fillStyle = "#2ecc71";
    ctx.fillText("VIDA: " + jugador.hp + " / " + jugador.hpMax + " HP", 22, 84);

    // 7. BOTONES E INTERFAZ DE OPCIONES
    const opt = UI_CONFIG.campamento;

    // Opción 1: Descansar
    dibujarOpcionCampamento(
        opt.opcion1.x, opt.opcion1.y, opt.opcionAncho, opt.opcionAlto,
        datosCamp.op1titulo, datosCamp.op1desc,
        campamentoAccionRealizada
    );

    // Opción 2: Meditar
    dibujarOpcionCampamento(
        opt.opcion2.x, opt.opcion2.y, opt.opcionAncho, opt.opcionAlto,
        datosCamp.op2titulo, datosCamp.op2desc,
        campamentoAccionRealizada
    );

    // Opción 3: Volver al Mapa (Siempre disponible)
    const volver = opt.volverMapa;
    const hoverVolver = esCursorSobreBoton(volver.x, volver.y, volver.w, volver.h);
    let vy = volver.y;
    if (hoverVolver) {
        canvas.style.cursor = "pointer";
        vy -= 2;
    }

    ctx.strokeStyle = hoverVolver ? "#ffcc00" : "#e67e22";
    ctx.lineWidth = 1.5;
    ctx.fillStyle = hoverVolver ? "rgba(30, 20, 10, 0.95)" : "rgba(10, 10, 20, 0.9)";
    ctx.beginPath();
    ctx.roundRect(volver.x, vy, volver.w, volver.h, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hoverVolver ? "#ffcc00" : "#e67e22";
    ctx.font = "8px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("VOLVER AL MAPA", volver.x + volver.w / 2, vy + volver.h / 2 + 3);
    ctx.textAlign = "left"; // Restaurar
}


// Helper para dibujar las opciones del campamento
function dibujarOpcionCampamento(x, y, w, h, titulo, desc, deshabilitado) {
    ctx.save();
    if (deshabilitado) {
        ctx.globalAlpha = 0.5;
    }

    const hover = !deshabilitado && esCursorSobreBoton(x, y, w, h);
    if (hover) {
        canvas.style.cursor = "pointer";
        y -= 2; // Desplazar ligeramente hacia arriba
    }

    ctx.strokeStyle = deshabilitado ? "#666666" : (hover ? "#ffcc00" : "#2ecc71");
    ctx.lineWidth = 1.5;
    ctx.fillStyle = hover ? "rgba(20, 20, 40, 0.95)" : "rgba(10, 10, 20, 0.9)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 4);
    else ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    // Textos
    ctx.fillStyle = deshabilitado ? "#888888" : (hover ? "#ffcc00" : "#ffffff");
    ctx.font = "7px 'Press Start 2P'";
    ctx.fillText(titulo, x + 10, y + 12);

    ctx.fillStyle = deshabilitado ? "#555555" : (hover ? "#ffffff" : "#a9a9a9");
    ctx.font = "5px 'Press Start 2P'";
    ctx.fillText(desc, x + 10, y + 22);

    ctx.restore();
}

function iniciarTutorial() {
    tutorialPasoActual = 0;
    tutorialCompletado = false;
    enModoTutorial = true;
    tutorialFlechaAnim = 0;
    tutorialPasoMapaActual = 0; // Para los globos de texto del mapa

    // Configurar el acto a 0 (Tutorial)
    actoActual = 0;
    reiniciarMapaParaNuevoActo();

    // Restaurar AP y escudo del jugador
    jugador.hp = jugador.hpMax;
    jugador.ap = jugador.apMax;
    jugador.escudo = 0;

    estadoActual = ESTADOS.MAPA;

    if (TUTORIAL_PASOS[0].tipo === "INFO" || TUTORIAL_PASOS[0].tipo === "MISION") {
        tutorialAutoStart = performance.now();
    }
}

function avanzarTutorial() {
    tutorialPasoActual++;
    tutorialAutoStart = performance.now();
    if (tutorialPasoActual >= TUTORIAL_PASOS.length) {
        // Tutorial de combate completado => regresar al mapa del tutorial (Acto 0)
        jugador.hp = jugador.hpMax;
        jugador.ap = jugador.apMax;
        jugador.escudo = 0;

        nodosMapa[1].completado = true;
        nodosMapa[1].disponible = false;
        actualizarRutasDisponibles(1);

        // Ir al mapa y mostrar el HUD
        estadoActual = ESTADOS.MAPA;
        document.getElementById('hud-ui').style.display = 'flex';
    }
}

// ---------------------------------------------------
// Escala el canvas al tamaño físico real de la pantalla
// (sin depender de image-rendering, que no funciona
//  de forma consistente en todos los navegadores móviles)
// ---------------------------------------------------
function aplicarEscalaCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const cont = document.getElementById('game-container');
    const cssW = cont.clientWidth;
    const cssH = cont.clientHeight;

    if (!cssW || !cssH) return; // todavía no hay dimensiones

    const phW = Math.round(cssW * dpr);
    const phH = Math.round(cssH * dpr);

    // Solo redibujamos si algo cambio (evita reset innecesario)
    if (canvas.width === phW && canvas.height === phH) return;

    // Asignar tamaño físico al canvas
    canvas.width = phW;
    canvas.height = phH;

    // Escalar el contexto para que el código de dibujo
    // siga usando las coordenadas lógicas 480×270
    ctx.scale(phW / 480, phH / 270);

    // Desactivar suavizado bilineal
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
}

function abrirMenuPausa() {
    sistemaAudio.sfx('click');
    document.getElementById('pause-menu-ui').style.display = 'flex';
    document.getElementById('hud-ui').style.display = 'none'; // Oculta los textos y el botón "MENÚ" de fondo

    // Deshabilitar botones de Bolsa y Mazos durante el combate
    const btnBolsa = document.getElementById('btn-pause-bolsa');
    const btnMazo = document.getElementById('btn-pause-mazo');

    if (estadoActual === ESTADOS.COMBATE) {
        btnBolsa.style.opacity = '0.5';
        btnBolsa.style.pointerEvents = 'none';
        btnMazo.style.opacity = '0.5';
        btnMazo.style.pointerEvents = 'none';
    } else {
        btnBolsa.style.opacity = '1';
        btnBolsa.style.pointerEvents = 'auto';
        btnMazo.style.opacity = '1';
        btnMazo.style.pointerEvents = 'auto';
    }
}

function cerrarMenuPausa() {
    sistemaAudio.sfx('retroceder');
    document.getElementById('pause-menu-ui').style.display = 'none';
    document.getElementById('hud-ui').style.display = 'flex'; // Vuelve a mostrar el HUD
}

function abrirStats() {
    sistemaAudio.sfx('click');
    document.getElementById('pause-menu-ui').style.display = 'none';
    document.getElementById('stats-ui').style.display = 'flex';

    const container = document.getElementById('stats-container');
    container.innerHTML = `
                <div><span style="color:#e74c3c">❤ Vitalidad:</span> Nivel ${jugador.pasivas.vitalidad}</div>
                <div><span style="color:#f1c40f">⚡ Energía:</span> Nivel ${jugador.pasivas.energia}</div>
                <div><span style="color:#3498db">🛡️ Defensa:</span> Nivel ${jugador.pasivas.defensa}</div>
                <div><span style="color:#e67e22">⚔️ Fuerza:</span> Nivel ${jugador.pasivas.fuerza}</div>
            `;
}

function cerrarStats() {
    sistemaAudio.sfx('retroceder');
    document.getElementById('stats-ui').style.display = 'none';
    document.getElementById('pause-menu-ui').style.display = 'flex';
}

function abrirMazo() {
    sistemaAudio.sfx('click');
    document.getElementById('pause-menu-ui').style.display = 'none';
    document.getElementById('mazo-ui').style.display = 'flex';

    renderizarMazoUi();
}

let dragDataMazo = null;

function dragMazo(ev, idx) {
    dragDataMazo = { index: idx, carta: jugador.coleccionCartas[idx] };
    ev.dataTransfer.setData("text", idx);
}

function allowDropMazo(ev) {
    ev.preventDefault();
}

function dragEnterMazo(ev, catSlot) {
    ev.preventDefault();
    if (dragDataMazo) {
        if (dragDataMazo.carta.categoria === catSlot) {
            ev.currentTarget.style.borderColor = '#2ecc71';
            ev.currentTarget.style.boxShadow = '0 0 10px #2ecc71';
        } else {
            ev.currentTarget.style.borderColor = '#e74c3c';
            ev.currentTarget.style.boxShadow = '0 0 10px #e74c3c';
        }
    }
}

function dragLeaveMazo(ev, baseColor) {
    ev.currentTarget.style.borderColor = baseColor;
    ev.currentTarget.style.boxShadow = 'none';
}

function dropMazo(ev, catSlot) {
    ev.preventDefault();
    if (dragDataMazo && dragDataMazo.carta.categoria === catSlot) {
        sistemaAudio.sfx('click');
        jugador.mano[catSlot] = { ...dragDataMazo.carta };
    } else {
        sistemaAudio.sfx('error');
    }
    dragDataMazo = null;
    renderizarMazoUi();
}

function renderizarMazoUi() {
    const containerActivos = document.getElementById('mazo-activos-container');
    const containerColeccion = document.getElementById('mazo-coleccion-container');
    containerActivos.innerHTML = '';
    containerColeccion.innerHTML = '';

    const cats = [
        { id: 'ofensiva', nombre: 'Ofensiva', color: '#e74c3c' },
        { id: 'defensiva', nombre: 'Defensiva', color: '#3498db' },
        { id: 'elemental', nombre: 'Elemental', color: '#2ecc71' },
        { id: 'mejora', nombre: 'Mejora', color: '#f1c40f' },
        { id: 'nerfeo', nombre: 'Nerfeo', color: '#9b59b6' }
    ];

    cats.forEach(catInfo => {
        const item = jugador.mano[catInfo.id];
        let inner = `<div style="font-size: 0.8vw; color: ${catInfo.color}; margin-bottom: 1vw;">${catInfo.nombre}</div>`;
        if (item) {
            let imgSrc = ASSETS.cartas[item.nombre];
            if (!imgSrc) {
                let cat = item.categoria || '';
                let iconKey = cat;
                if (cat === 'ofensiva') iconKey = 'ataque';
                if (cat === 'defensiva') iconKey = 'defensa';
                if (cat === 'mejora' || cat === 'nerfeo') iconKey = 'mejora';
                if (cat === 'elemental') iconKey = 'fuego';
                imgSrc = ASSETS.cartas[iconKey];
            }
            let imgHtml = imgSrc ? `<img src="${imgSrc}" style="width: 2.5vw; height: 2.5vw; image-rendering: pixelated; margin-bottom: 0.5vw;">` : `<div style="font-size: 2.5vw; margin-bottom: 1vw;">${item.icono || '🃏'}</div>`;

            inner += `
                        ${imgHtml}
                        <div style="font-size: 0.7vw; color: #fff; text-align: center; margin-bottom: 0.5vw;">${item.nombre}</div>
                        <div style="font-size: 0.55vw; color: #aaa; text-align: center;">${item.descripcion}</div>
                    `;
        } else {
            inner += `<div style="color: #666; font-size: 0.8vw; text-align: center; margin-top: 3vw;">(Vacío)</div>`;
        }

        containerActivos.innerHTML += `
                    <div ondragover="allowDropMazo(event)" ondragenter="dragEnterMazo(event, '${catInfo.id}')" ondragleave="dragLeaveMazo(event, '${catInfo.color}')" ondrop="dropMazo(event, '${catInfo.id}')"
                         style="width: 10vw; height: 14vw; background: rgba(0,0,0,0.8); border: 2px dashed ${catInfo.color}; border-radius: 0.5vw; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 1vw; box-sizing: border-box; transition: 0.2s;">
                        ${inner}
                    </div>
                `;
    });

    if (!jugador.coleccionCartas || jugador.coleccionCartas.length === 0) {
        containerColeccion.innerHTML = '<div style="color: #999; font-size: 1vw;">No tienes cartas en tu colección.</div>';
    } else {
        jugador.coleccionCartas.forEach((carta, idx) => {
            const cInfo = cats.find(c => c.id === carta.categoria);
            const colorCat = cInfo ? cInfo.color : '#fff';

            let imgSrcC = ASSETS.cartas[carta.nombre];
            if (!imgSrcC) {
                let cat = carta.categoria || '';
                let iconKey = cat;
                if (cat === 'ofensiva') iconKey = 'ataque';
                if (cat === 'defensiva') iconKey = 'defensa';
                if (cat === 'mejora' || cat === 'nerfeo') iconKey = 'mejora';
                if (cat === 'elemental') iconKey = 'fuego';
                imgSrcC = ASSETS.cartas[iconKey];
            }
            let imgHtmlC = imgSrcC ? `<img src="${imgSrcC}" style="width: 2vw; height: 2vw; image-rendering: pixelated; margin-bottom: 0.5vw;">` : `<div style="font-size: 1.8vw; margin-bottom: 0.5vw;">${carta.icono || '🃏'}</div>`;

            containerColeccion.innerHTML += `
                        <div draggable="true" ondragstart="dragMazo(event, ${idx})"
                             style="width: 8vw; height: 11.2vw; background: rgba(0,0,0,0.8); border: 1px solid ${colorCat}; border-radius: 0.4vw; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0.8vw; box-sizing: border-box; cursor: grab;">
                            <div style="font-size: 0.6vw; color: ${colorCat}; margin-bottom: 0.5vw;">${cInfo ? cInfo.nombre : ''}</div>
                            ${imgHtmlC}
                            <div style="font-size: 0.55vw; color: #fff; text-align: center; margin-bottom: 0.3vw;">${carta.nombre}</div>
                            <div style="font-size: 0.45vw; color: #aaa; text-align: center; line-height: 1.2;">${carta.descripcion}</div>
                        </div>
                    `;
        });
    }
}

function cerrarMazo() {
    sistemaAudio.sfx('retroceder');
    document.getElementById('mazo-ui').style.display = 'none';
    document.getElementById('pause-menu-ui').style.display = 'flex';
}

function abrirEquipoDesdePausa() {
    sistemaAudio.sfx('click');
    document.getElementById('pause-menu-ui').style.display = 'none';
    abrirEquipo();
}

function abrirEquipo() {
    document.getElementById('equipamiento-ui').style.display = 'flex';
    renderizarEquipoUI();
}

function cerrarEquipo() {
    document.getElementById('equipamiento-ui').style.display = 'none';
    document.getElementById('pause-menu-ui').style.display = 'flex';
}

function renderizarEquipoUI() {
    const slotsContainer = document.getElementById('equipo-slots');
    slotsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const item = jugador.slotsCombate[i];
        if (item) {
            slotsContainer.innerHTML += `
                        <div onclick="desequiparItem(${i})" style="width: 8vw; height: 10vw; background: rgba(255,255,255,0.1); border: 2px solid #e67e22; border-radius: 0.5vw; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; text-align: center;">
                            <img src="img/cat_${obtenerCategoriaItem(item.id)}.webp" style="width: 60%; height: auto; image-rendering: pixelated; margin-top: 10%;" />
                            <div style="font-size: 0.7vw; color: #fff; margin-top: auto; margin-bottom: 5%;">${item.nombre || ''}</div>
                        </div>
                    `;
        } else {
            slotsContainer.innerHTML += `
                        <div style="width: 8vw; height: 10vw; background: rgba(255,255,255,0.05); border: 2px dashed #666; border-radius: 0.5vw; display: flex; align-items: center; justify-content: center; color: #666; font-size: 0.8vw;">
                            Vacío
                        </div>
                    `;
        }
    }

    const invContainer = document.getElementById('equipo-inventario');
    invContainer.innerHTML = '';
    if (jugador.inventario.length === 0) {
        invContainer.innerHTML = '<div style="color: #999; font-size: 1vw;">Tu mochila está vacía.</div>';
    } else {
        jugador.inventario.forEach((item, index) => {
            invContainer.innerHTML += `
                        <div onclick="equiparItem(${index})" style="width: 6vw; height: 8vw; background: rgba(0,0,0,0.5); border: 1px solid #ffcc00; border-radius: 0.5vw; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; text-align: center; margin-bottom: 1vw;">
                            <img src="img/cat_${obtenerCategoriaItem(item.id)}.webp" style="width: 60%; height: auto; image-rendering: pixelated; margin-top: 10%;" />
                            <div style="font-size: 0.6vw; color: #ccc; margin-top: auto; margin-bottom: 5%;">${item.nombre || ''}</div>
                        </div>
                    `;
        });
    }
}

function equiparItem(index) {
    const emptySlotIndex = jugador.slotsCombate.indexOf(null);
    if (emptySlotIndex !== -1) {
        const item = jugador.inventario.splice(index, 1)[0];
        jugador.slotsCombate[emptySlotIndex] = item;
        sistemaAudio.sfx('hover');
        renderizarEquipoUI();
    } else {
        sistemaAudio.sfx('error');
        mostrarToast("¡Slots Llenos!", "Desequipa un objeto primero", "error");
    }
}

function desequiparItem(slotIndex) {
    const item = jugador.slotsCombate[slotIndex];
    if (item) {
        jugador.slotsCombate[slotIndex] = null;
        jugador.inventario.push(item);
        sistemaAudio.sfx('retroceder');
        renderizarEquipoUI();
    }
}

// Detecta orientación del dispositivo y muestra la pantalla de rotación si está en vertical
function verificarOrientacion() {
    const enVertical = window.innerHeight > window.innerWidth;
    const pantalla = document.getElementById('rotate-screen');
    if (pantalla) pantalla.style.display = enVertical ? 'flex' : 'none';
}
window.addEventListener('resize', () => {
    verificarOrientacion();
    if (estadoActual !== ESTADOS.MENU) {
        aplicarEscalaCanvas();
    }
});
window.addEventListener('orientationchange', function () {
    // Pequeño delay porque iOS tarda en actualizar innerWidth/Height
    setTimeout(function () {
        verificarOrientacion();
        // Redibujar canvas con las nuevas dimensiones al girar
        if (estadoActual !== ESTADOS.MENU) aplicarEscalaCanvas();
    }, 300);
});
verificarOrientacion(); // Comprobación inicial al cargar

// Permite al jugador abandonar el combate y volver al mapa
function volverAlMapa() {
    mostrarConfirmacion(
        "¿Huir del combate?",
        "Perderás 15% de tu HP máximo. El enemigo se curará.",
        function () {
            let penalizacion = Math.floor(jugador.hpMax * 0.15);
            jugador.hp = Math.max(1, jugador.hp - penalizacion);
            
            jugador.ap = jugador.apMax;
            jugador.escudo = 0;
            jugador.estado = null;
            
            enemigo.escudo = 0;
            enemigo.estado = null;
            enemigo.muriendo = false;
            enemigo.faseActual = 1;
            enemigo.hp = enemigo.hpMax;
            
            animaciones.proyectiles.length = 0;
            
            estadoActual = ESTADOS.MAPA;
            mostrarToast("¡Huida táctica!", `Perdiste ${penalizacion} HP al escapar.`, "error");
        }
    );
}
// ==========================================
// FUNCIONES DE MENÚ PRINCIPAL (BOTONES EXTRAS)
// ==========================================

// Muestra la pantalla de Créditos
function mostrarCreditos() {
    // Usamos la variable global menuUi (ya declarada arriba) en lugar de redeclararla
    const creditosUi = document.getElementById('creditos-ui');

    if (menuUi) menuUi.style.display = 'none';
    if (creditosUi) creditosUi.style.display = 'flex';
}

// Cierra los créditos y vuelve al menú principal
function cerrarCreditos() {
    const menuUi = document.getElementById('menu-ui');
    const creditosUi = document.getElementById('creditos-ui');

    if (creditosUi) creditosUi.style.display = 'none';
    if (menuUi) menuUi.style.display = 'flex';
}

// Nota: El HUD se actualiza dinámicamente dentro de dibujarPantallaMapa() en cada frame.

// Eventos de teclado temporales para que pruebes las transiciones en tu PC
window.addEventListener('keydown', (e) => {
    if (estadoActual === ESTADOS.MAPA && e.key.toLowerCase() === 'c') {
        estadoActual = ESTADOS.COMBATE; // Cambia a combate
        tiempoMisionCombate = Date.now();
    }
    else if (estadoActual === ESTADOS.COMBATE && e.key.toLowerCase() === 'm') {
        estadoActual = ESTADOS.MAPA; // Regresa al mapa
    }
});

/* ==========================================================================
10.5. LÓGICA DE INTERACCIÓN CON CARTAS (NUEVO)
========================================================================== */

// Dimensiones y posiciones idénticas a las que usamos para dibujar las cartas
const CARTA_W = 55;
const CARTA_H = 75;
const CARTA_Y = 180;
const MANO_X = 105;
const ESPACIO_CARTA = 10;



function usarItem(index) {
    if (enemigo.muriendo) return;
    let item = jugador.slotsCombate[index];
    sistemaAudio.sfx('curacion'); // Sonido genérico

    // Pequeña animación visual del jugador al usar ítem
    activarAnimacion('jugador', 'ataque', { cat: 'mejora' });

    // ── CURACIÓN DE VIDA ──────────────────────────────────────────────────
    if (["saltena", "majadito", "chicha", "api", "lluchu", "locoto", "quinua"].includes(item.id)) {
        const cura = { saltena: 25, majadito: 25, chicha: 30, api: 25, lluchu: 35, locoto: 30, quinua: 35 }[item.id] || 25;
        jugador.hp = Math.min(jugador.hpMax, jugador.hp + cura);
        animaciones.textosFlotantes.push({ x: 80, y: 100, texto: `+${cura} HP`, color: "#2ecc71", vida: 60, maxVida: 60 });

    } else if (["castana", "chuño"].includes(item.id)) {
        const cura = { castana: 20, chuño: 20 }[item.id] || 20;
        jugador.hp = Math.min(jugador.hpMax, jugador.hp + cura);
        animaciones.textosFlotantes.push({ x: 80, y: 100, texto: `+${cura} HP`, color: "#2ecc71", vida: 60, maxVida: 60 });

        // ── ESCUDO ────────────────────────────────────────────────────────────
    } else if (["bicarbonato", "copaiba", "aceiteselva", "plata", "cuero", "hoja", "aymara", "sal"].includes(item.id)) {
        const escudoVal = { bicarbonato: 15, copaiba: 15, aceiteselva: 15, plata: 20, cuero: 18, hoja: 25, aymara: 22, sal: 28 }[item.id] || 15;
        jugador.escudo += escudoVal;
        animaciones.textosFlotantes.push({ x: 80, y: 100, texto: `+${escudoVal} Escudo`, color: "#3498db", vida: 60, maxVida: 60 });

        // ── DAÑO AL ENEMIGO ───────────────────────────────────────────────────
    } else if (["cerbatana", "honda", "boleadora", "suri", "hacha"].includes(item.id)) {
        sistemaAudio.sfx('danoEnemigo');
        const danoVal = { cerbatana: 35, honda: 40, boleadora: 45, suri: 42, hacha: 50 }[item.id] || 35;
        enemigo.hp = Math.max(0, enemigo.hp - danoVal);
        activarAnimacion('enemigo', 'dano', { texto: '-' + danoVal });

    } else if (item.id === "machete") {
        sistemaAudio.sfx('danoEnemigo');
        enemigo.hp = Math.max(0, enemigo.hp - 38);
        activarAnimacion('enemigo', 'dano', { texto: '-38' });

        // ── CURA DE ESTADOS ───────────────────────────────────────────────────
    } else if (["alcohol", "unadegato", "resinaselva", "menta", "salvia", "incienso", "koa", "palo"].includes(item.id)) {
        jugador.estado = null;
        animaciones.textosFlotantes.push({ x: 80, y: 100, texto: "Purificado", color: "#1abc9c", vida: 60, maxVida: 60 });
    }

    jugador.slotsCombate[index] = null;
    if (enemigo.hp <= 0 && !enemigo.muriendo) {
        enemigo.muriendo = true;
        animaciones.enemigo.pose = "muerte";
        animaciones.enemigo.poseTimer = 9999;
        setTimeout(() => {
            enemigo.muriendo = false;
            regresarAlMapaTrasCombate();
        }, 1500);
    }
}

function jugarCarta(categoria) {
    if (enemigo.muriendo) return;
    const carta = jugador.mano[categoria];

    if (!carta) {
        console.log("Esta ranura de mazo está bloqueada.");
        return;
    }
    if (jugador.cartasUsadasEsteTurno && jugador.cartasUsadasEsteTurno[categoria]) {
        animaciones.textosFlotantes.push({ x: 180, y: 150, texto: "YA USADA ESTE TURNO", color: "#e74c3c", vida: 60, maxVida: 60 });
        return;
    }
    if (jugador.cooldowns && jugador.cooldowns[carta.nombre] > 0) {
        animaciones.textosFlotantes.push({ x: 180, y: 150, texto: "EN ENFRIAMIENTO (" + jugador.cooldowns[carta.nombre] + ")", color: "#e74c3c", vida: 60, maxVida: 60 });
        return;
    }
    if (jugador.ap < carta.costoAP) {
        console.log("¡No tienes suficiente AP para esta carta!");
        return;
    }

    // Aplicamos efectos según la categoría
    if (categoria === "ofensiva") {
        let defensaEfectiva = enemigo.defensa;
        let multiplicadorDano = 1.0;

        if (enemigo.estado === "EMPAPADO") {
            multiplicadorDano = 1.5;
            enemigo.estado = null; // Se consume el efecto
            animaciones.textosFlotantes.push({ x: 360, y: 100, texto: "¡EMPAPADO! (+50% Daño)", color: "#3498db", vida: 60, maxVida: 60 });
        }

        // Daño físico después de aplicar su reducción por coraza y multiplicador
        // Bonus de daño fijo del buff "Filo del Minero"
        const danioBase = (carta.daño || 0) + (jugador.danioBonus || 0);
        let dañoNeto = Math.round(danioBase * (1 - defensaEfectiva) * multiplicadorDano);

        // NUEVO: Absorción de tu ataque por parte del escudo del enemigo
        if (enemigo.escudo > 0) {
            if (enemigo.escudo >= dañoNeto) {
                enemigo.escudo -= dañoNeto;
                console.log("¡El enemigo bloqueó tu ataque con su escudo! Escudo restante: " + enemigo.escudo);
                dañoNeto = 0;
            } else {
                dañoNeto -= enemigo.escudo;
                console.log("¡Rompiste el escudo del enemigo! Escudo absorbido: " + enemigo.escudo);
                enemigo.escudo = 0;
            }
        }

        if (dañoNeto > 0) {
            enemigo.hp = Math.max(0, enemigo.hp - dañoNeto);
            console.log("¡Mamani ataca! Hace " + dañoNeto + " de daño directo.");
            sistemaAudio.sfx('ataque');
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            activarAnimacion('enemigo', 'dano', { texto: '-' + dañoNeto });
        } else {
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            activarAnimacion('enemigo', 'dano', { texto: 'Bloqueado' });
        }
    }
    else if (categoria === "defensiva") {
        jugador.escudo += carta.bloqueo;
        console.log("¡Mamani gana " + carta.bloqueo + " de Bloqueo!");
        sistemaAudio.sfx('escudo');
        activarAnimacion('jugador', 'escudo', { texto: '+' + carta.bloqueo });
    }
    // NUEVO: Procesar carta elemental (Torrente del Jichi u otras elementales)
    else if (categoria === "elemental") {
        if (carta.efecto === "EMPAPADO") {
            // Carta de agua: penetra coraza y aplica empapado
            const dañoNeto = Math.round(carta.daño * (1 - 0.20));
            enemigo.hp = Math.max(0, enemigo.hp - dañoNeto);
            enemigo.estado = "EMPAPADO";
            console.log("¡Magia Acuática! " + enemigo.nombre + " recibe " + dañoNeto + " de daño y queda EMPAPADO.");
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            activarAnimacion('enemigo', 'dano', { texto: '-' + dañoNeto });
        } else if (carta.daño > 0) {
            // Cartas elementales de fuego/tierra sin estado especial
            let multiplicadorDano = 1.0;
            if (enemigo.estado === "EMPAPADO") {
                multiplicadorDano = 1.5;
                enemigo.estado = null; // Se consume el efecto
                animaciones.textosFlotantes.push({ x: 360, y: 100, texto: "¡EMPAPADO! (+50% Daño)", color: "#3498db", vida: 60, maxVida: 60 });
            }
            const dañoNeto = Math.round(carta.daño * (1 - 0.10) * multiplicadorDano);
            enemigo.hp = Math.max(0, enemigo.hp - dañoNeto);
            console.log("¡Magia Elemental! " + enemigo.nombre + " recibe " + dañoNeto + " de daño.");
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            activarAnimacion('enemigo', 'dano', { texto: '-' + dañoNeto });
        }
    }
    // Cartas de Mejora (Hoja de Coca, Chicha Sagrada, Bendición Yatiri)
    else if (categoria === "nerfeo") {
        if (carta.efecto === "DEBILITAR") {
            enemigo.estado = "DEBILITADO";
            animaciones.textosFlotantes.push({ x: 360, y: 100, texto: "DEBILITADO (-5 ATK)", color: "#9b59b6", vida: 60, maxVida: 60 });
            sistemaAudio.sfx('escudo');
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            activarAnimacion('enemigo', 'dano', { texto: 'Maldito!' });
        }
    }
    else if (categoria === "mejora") {
        if (carta.efecto === "CURAR") {
            jugador.hp = Math.min(jugador.hpMax, jugador.hp + carta.valor);
            console.log("¡Mamani se cura " + carta.valor + " HP!");
            sistemaAudio.sfx('curacion');
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            activarAnimacion('jugador', 'escudo', { texto: '+' + carta.valor + 'HP' });
        } else if (carta.efecto === "AP_BONUS") {
            jugador.ap = Math.min(jugador.apMax + carta.valor, jugador.ap + carta.valor);
            console.log("¡Mamani gana " + carta.valor + " AP extra!");
            sistemaAudio.sfx('curacion');
            // Animacion: la hoja de coca vuela a la boca de Mamani + aura verde
            activarAnimacion('jugador', 'ataque', { cat: categoria });
            animaciones.textosFlotantes.push({
                x: 30, y: 115,
                texto: '+' + carta.valor + ' AP',
                color: '#f1c40f',
                vida: 80, maxVida: 80, escala: 1.3
            });
        }
    }

    jugador.ap -= carta.costoAP;
    if (!jugador.cartasUsadasEsteTurno) {
        jugador.cartasUsadasEsteTurno = {};
    }
    jugador.cartasUsadasEsteTurno[categoria] = true;
    if (carta.cooldown) {
        if (!jugador.cooldowns) jugador.cooldowns = {};
        jugador.cooldowns[carta.nombre] = carta.cooldown;
    }

    // ── AVANCE DEL TUTORIAL ────────────────────────────────────────────────
    if (enModoTutorial) {
        const paso = TUTORIAL_PASOS[tutorialPasoActual];
        if (paso && paso.accion === "JUGAR_OFENSIVA" && categoria === "ofensiva") {
            avanzarTutorial();
        } else if (paso && paso.accion === "JUGAR_DEFENSIVA" && categoria === "defensiva") {
            avanzarTutorial();
        }
    }

    // CONDICIÓN DE VICTORIA
    if (enemigo.hp <= 0 && !enemigo.muriendo) {
        enemigo.muriendo = true;
        guardarLogro('monstruo'); // Sumar estadística de logros
        animaciones.enemigo.pose = "muerte";
        animaciones.enemigo.poseTimer = 9999;
        // En tutorial la victoria del primer combate guiado te devuelve al mapa
        if (enModoTutorial) {
            setTimeout(() => {
                enemigo.muriendo = false;
                enModoTutorial = false;
                tutorialCompletado = true;
                localStorage.setItem('sendaMamani_tutorial', 'true');
                jugador.hp = jugador.hpMax;
                jugador.ap = jugador.apMax;
                jugador.escudo = 0;
                // Volvemos al mapa del tutorial
                estadoActual = ESTADOS.MAPA;
                document.getElementById('hud-ui').style.display = 'flex';
                // Marcar el nodo de combate como completado
                if (nodosMapa[1]) {
                    nodosMapa[1].completado = true;
                    nodosMapa[1].disponible = false;
                }
            }, 1500);
            return;
        }
        // Combate normal: primero muestra pantalla de victoria, luego recompensas
        const nodoActual = nodosMapa[nodoActualIndex];

        // NUEVO: SEGUNDA FASE PARA JEFES
        if (nodoActual.tipo === "JEFE" && enemigo.faseActual === 1) {
            enemigo.muriendo = false;
            enemigo.faseActual = 2;
            enemigo.hpMax = Math.round(enemigo.hpMax * 1.8); // Fase 2: +80% HP
            enemigo.hp = enemigo.hpMax;
            enemigo.estado = null;
            enemigo.escudo = 0;
            enemigo.nombre = enemigo.nombre + " (Desatado)";

            console.log("¡El jefe entra en Fase 2!");
            sistemaAudio.sfx('entrarCombate');

            // Efecto visual de entrada a Fase 2
            animaciones.flashPantalla = 15;
            animaciones.flashColor = 'rgba(255,0,0,'; // Flash rojo
            animaciones.ondaChoque = { x: 350, y: 140, radio: 10, maxRadio: 200, vida: 40, maxVida: 40, color: '#e74c3c' };

            animaciones.textosFlotantes.push({
                x: 240, y: 90,
                texto: "¡¡SEGUNDA FORMA!!",
                color: "#ff0000",
                vida: 150, maxVida: 150, escala: 1.8
            });
            animaciones.textosFlotantes.push({
                x: 240, y: 120,
                texto: "EL JICHI SE DESATA",
                color: "#ff6600",
                vida: 120, maxVida: 120, escala: 1.2
            });

            // Volver a definir el siguiente movimiento de Fase 2
            enemigo.definirSiguienteMovimiento();

            estadoActual = ESTADOS.COMBATE; // Continúa el combate en Fase 2
            return;
        }

        if (nodoActual.tipo === "JEFE") {
            // Si es el Jefe del Tutorial, saltamos a la pantalla de reset final
            if (actoActual === 0) {
                setTimeout(() => {
                    enemigo.muriendo = false;
                    estadoActual = ESTADOS.TUTORIAL_COMPLETO;
                }, 1500);
                return;
            }
            esRecompensaJefe = true;
            nombreEnemigoVencido = enemigo.nombre;
        } else {
            esRecompensaJefe = false;
            nombreEnemigoVencido = enemigo.nombre;
        }
        // Saltar pantalla de victoria e ir directo a recompensas
        sistemaAudio.sfx('confirmar'); // Opcional: Sonido de victoria
        setTimeout(() => {
            enemigo.muriendo = false;
            regresarAlMapaTrasCombate();
        }, 1500);
    }
}


function regresarAlMapaTrasCombate() {
    // Reseteamos estado del combate (sin curar al jugador: la tienda y el campamento tienen valor)
    enemigo.hp = enemigo.hpMax;
    enemigo.escudo = 0;
    enemigo.estado = null;
    jugador.estado = null;
    jugador.ap = jugador.apMax;
    jugador.escudo = 0;
    jugador.cooldowns = {};
    jugador.cartasUsadasEsteTurno = {};

    // Efecto Reliquia Jichi
    if (jugador.reliquias && jugador.reliquias.includes("Escama del Jichi")) {
        jugador.hp = Math.min(jugador.hpMax, jugador.hp + 8);
        console.log("¡La Escama del Jichi te cura 8 HP!");
    }

    if (esRecompensaJefe) {
        // Oro de jefe: entre 60G y 100G (más generoso)
        oroRecompensa = Math.floor(Math.random() * 41) + 60;

        // ── Reliquia de Jefe ─────────────────────
        let reliquia = actoActual === 1 ? RELIQUIAS_JEFE.acto1
                     : actoActual === 2 ? RELIQUIAS_JEFE.acto2
                     : RELIQUIAS_JEFE.acto3;
                     
        if (!jugador.reliquias.includes(reliquia.nombre)) {
            jugador.reliquias.push(reliquia.nombre);
            guardarLogro('reliquia', reliquia.nombre);
        }
        reliquiaJefeObtenida = reliquia; 
    } else {
        // Generar recompensa de oro (entre 20G y 40G)
        oroRecompensa = Math.floor(Math.random() * 21) + 20;

        // Seleccionar 3 cartas aleatorias del pool apto para el acto actual
        const poolApto = POOL_CARTAS_RECOMPENSA.filter(c =>
            c.categoria !== 'elemental' || actoActual >= 2
        );
        // Barajamos y tomamos 3 únicas
        const barajado = poolApto.sort(() => Math.random() - 0.5);
        opcionesCartasRecompensa = barajado.slice(0, 3);
    }

    estadoActual = ESTADOS.RECOMPENSA;
}

// Lanza una cinemática de transición entre actos.
// slides: array de diapositivas a mostrar.
// onEnd: función a ejecutar cuando terminen las diapositivas.
function iniciarCinematicaTransicion(slides, onEnd) {
    CUTSCENE_SLIDES = slides;
    cutsceneSlideActual = 0;
    cutsceneCharIndex = 0;
    cutsceneTituloIndex = 0;
    cutsceneTimer = 0;
    cutsceneUltimoTick = performance.now();
    cutsceneOnEnd = onEnd || null;
    estadoActual = ESTADOS.CUTSCENE;
}

// Reinicia el mapa y gestiona la transición entre los 3 Actos de tu GDD
function avanzarSiguienteActo() {
    if (actoActual === 3) {
        // Victoria definitiva tras vencer al Jefe Final (Huiracocha)
        if (!modoLeyenda) {
            viajesCompletados++;
            localStorage.setItem('sendaMamani_viajesCompletados', viajesCompletados);
        } else {
            // Si es Modo Leyenda, guardamos una bandera de victoria leyenda si queremos,
            // pero no incrementamos viajesCompletados normales
            localStorage.setItem('sendaMamani_victoriaLeyenda', 'true');
        }

        // Inicializar variables de la pantalla de victoria
        textoVictoriaIndex = 0;
        ultimoTickTextoVictoria = Date.now();

        // Detener cualquier música y pasar al estado de victoria total
        sistemaAudio._detenerMusica(0.5);
        sistemaAudio.sfx('confirmarEpico');
        estadoActual = ESTADOS.VICTORIA_TOTAL;
        return;
    }

    actoActual++;

    if (actoActual === 1) {
        // Termina el tutorial del mapa
        tutorialCompletado = true;
        localStorage.setItem('sendaMamani_tutorial', 'true');
        enModoTutorial = false;

        // Reiniciar para Acto 1 real
        jugador.hp = jugador.hpMax;
        jugador.ap = jugador.apMax;
        reiniciarMapaParaNuevoActo();
        return;
    }

    if (actoActual === 2) {
        // Mostrar cinemática de transición Acto 1 → 2 (Valles y Minas)
        iniciarCinematicaTransicion(CUTSCENE_SLIDES_ACTO2, function () {
            reiniciarMapaParaNuevoActo();
        });
        return;
    }

    if (actoActual === 3) {
        // Cinemática de transición Acto 2 → 3 (Altiplano y Salar de Uyuni)
        iniciarCinematicaTransicion(CUTSCENE_SLIDES_ACTO3, function () {
            reiniciarMapaParaNuevoActo();
        });
        return;
    }
}

// Carga el mapa fresco del acto indicado y desbloquea los nodos iniciales
function reiniciarMapaParaNuevoActo() {
    // Cargar los nodos del nuevo acto (copia profunda para no mutar la definición base)
    const plantillaNuevoActo = NODOS_POR_ACTO[actoActual];
    if (plantillaNuevoActo) {
        nodosMapa = JSON.parse(JSON.stringify(plantillaNuevoActo));
    } else {
        console.warn("No hay nodos definidos para el acto " + actoActual);
    }

    nodoActualIndex = 0;
    // El nodo de inicio ya viene con completado:true en la plantilla,
    // pero lo forzamos por seguridad
    nodosMapa[0].completado = true;
    nodosMapa[0].disponible = false;

    // Desbloquear los primeros nodos según las conexiones del nodo de inicio
    if (nodosMapa[0].conexiones && nodosMapa[0].conexiones.length > 0) {
        nodosMapa[0].conexiones.forEach(id => {
            if (nodosMapa[id]) nodosMapa[id].disponible = true;
        });
    } else {
        if (nodosMapa[1]) nodosMapa[1].disponible = true;
        if (nodosMapa[2]) nodosMapa[2].disponible = true;
    }

    estadoActual = ESTADOS.MAPA;
}


// Ejecuta la acción del enemigo y reinicia el turno de Mamani
function terminarTurno() {
    console.log("--- TURNO DEL ENEMIGO ---");

    // ── AVANCE DEL TUTORIAL (paso 3: terminar turno) ────────────────────
    if (enModoTutorial) {
        const paso = TUTORIAL_PASOS[tutorialPasoActual];
        if (paso && paso.accion === "TERMINAR_TURNO") {
            // Ejecutar el turno del enemigo de prueba y luego avanzar
            let danoEnemigo = enemigo.intencion.valor;
            if (jugador.escudo > 0) {
                if (jugador.escudo >= danoEnemigo) {
                    jugador.escudo -= danoEnemigo;
                    danoEnemigo = 0;
                } else {
                    danoEnemigo -= jugador.escudo;
                    jugador.escudo = 0;
                }
            }
            if (danoEnemigo > 0) {
                jugador.hp = Math.max(1, jugador.hp - danoEnemigo);
                sistemaAudio.sfx('danoJugador');
                activarAnimacion('jugador', 'dano', { texto: '-' + danoEnemigo });
            } else {
                sistemaAudio.sfx('escudo');
                activarAnimacion('jugador', 'dano', { texto: 'Bloqueado' });
            }
            activarAnimacion('enemigo', 'ataque');

            enemigo.definirSiguienteMovimiento();
            jugador.restaurarAP();
            jugador.escudo = 0;
            jugador.cartasUsadasEsteTurno = {}; // Resetear cartas usadas este turno
            cartaSeleccionadaIndex = null; // Deseleccionar la carta al empezar nuevo turno
            avanzarTutorial();
            return;
        }
    }

    // --- DAÑO POR ESTADOS AL ENEMIGO AL INICIAR SU TURNO ---
    if (enemigo.estado === "QUEMADURA") {
        enemigo.hp = Math.max(0, enemigo.hp - 5);
        animaciones.textosFlotantes.push({ x: 360, y: 100, texto: "-5 (Quemadura)", color: "#e67e22", vida: 60, maxVida: 60 });
        sistemaAudio.sfx('danoJugador'); // Reutilizamos sonido de daño
    }

    // 1. Ejecutar acción del enemigo
    if (enemigo.intencion.tipo === "ATAQUE") {
        const dañoEnemigo = enemigo.intencion.valor;

        // Lógica de absorción por Escudo de Mamani
        if (jugador.escudo > 0) {
            if (jugador.escudo >= dañoEnemigo) {
                jugador.escudo -= dañoEnemigo;
                console.log("¡Tu escudo absorbió por completo los " + dañoEnemigo + " de daño!");
                sistemaAudio.sfx('escudo');
                activarAnimacion('enemigo', 'ataque');
                activarAnimacion('jugador', 'dano', { texto: 'Bloqueado' });
            } else {
                const dañoRestante = dañoEnemigo - jugador.escudo;
                jugador.escudo = 0;
                jugador.hp = Math.max(0, jugador.hp - dañoRestante);
                console.log("Tu escudo absorbió parte del ataque. Recibes " + dañoRestante + " de daño real.");
                sistemaAudio.sfx('danoJugador');
                activarAnimacion('enemigo', 'ataque');
                activarAnimacion('jugador', 'dano', { texto: '-' + dañoRestante });
            }
        } else {
            jugador.hp = Math.max(0, jugador.hp - dañoEnemigo);
            console.log("¡El " + enemigo.nombre + " te ataca causando " + dañoEnemigo + " de daño directo!");
            sistemaAudio.sfx('danoJugador');
            activarAnimacion('enemigo', 'ataque');
            activarAnimacion('jugador', 'dano', { texto: '-' + dañoEnemigo });
        }
    }
    else if (enemigo.intencion.tipo === "DEFENSA") {
        // CORREGIDO: El enemigo gana escudo real en lugar de alterar su defensa base
        enemigo.escudo = enemigo.intencion.valor;
        console.log("¡El " + enemigo.nombre + " se protege con +" + enemigo.escudo + " de Escudo!");
        sistemaAudio.sfx('escudo');
        activarAnimacion('enemigo', 'escudo', { texto: '+' + enemigo.escudo });
    }
    else if (enemigo.intencion.tipo === "ROBO_SANGRE") {
        const dañoEnemigo = enemigo.intencion.valor;
        let dañoReal = 0;

        if (jugador.escudo > 0) {
            if (jugador.escudo >= dañoEnemigo) {
                jugador.escudo -= dañoEnemigo;
                sistemaAudio.sfx('escudo');
                activarAnimacion('enemigo', 'ataque');
                activarAnimacion('jugador', 'dano', { texto: 'Bloqueado' });
            } else {
                dañoReal = dañoEnemigo - jugador.escudo;
                jugador.escudo = 0;
                jugador.hp = Math.max(0, jugador.hp - dañoReal);
                sistemaAudio.sfx('danoJugador');
                activarAnimacion('enemigo', 'ataque');
                activarAnimacion('jugador', 'dano', { texto: '-' + dañoReal });
            }
        } else {
            dañoReal = dañoEnemigo;
            jugador.hp = Math.max(0, jugador.hp - dañoReal);
            sistemaAudio.sfx('danoJugador');
            activarAnimacion('enemigo', 'ataque');
            activarAnimacion('jugador', 'dano', { texto: '-' + dañoReal });
        }

        if (dañoReal > 0) {
            // El enemigo se cura el mismo daño que logró hacerte (robo de vida)
            enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + dañoReal);
            // Usamos timeout para que los numeritos no se sobrepongan
            setTimeout(() => {
                activarAnimacion('enemigo', 'escudo', { texto: '+' + dañoReal + ' HP' });
            }, 500);
        }
    }
    else if (enemigo.intencion.tipo === "MALDICION") {
        // Maldición: Daño mágico que ignora tu escudo
        const dañoMaldicion = enemigo.intencion.valor || 8;
        jugador.hp = Math.max(0, jugador.hp - dañoMaldicion);
        sistemaAudio.sfx('danoJugador');
        activarAnimacion('enemigo', 'ataque');
        activarAnimacion('jugador', 'dano', { texto: '-' + dañoMaldicion + ' (Penetrante)' });
    }

    // 2. Condición de derrota
    if (jugador.hp <= 0) {
        mostrarToast("¡DERROTA!", "Mamani ha caído en combate...", "error");
        
        guardarLogro('muerte'); // Registrar derrota

        // Ocultamos el HUD para que la pantalla de Game Over se vea limpia
        document.getElementById('hud-ui').style.display = 'none';

        estadoActual = ESTADOS.GAMEOVER;
        return;
    }
    // 3. Preparar el nuevo turno del Jugador
    enemigo.definirSiguienteMovimiento();
    jugador.restaurarAP();
    jugador.escudo = 0; // Se limpia tu escudo al iniciar tu propio turno
    
    // Efecto Reliquia Tío de la Mina
    if (jugador.reliquias && jugador.reliquias.includes("Cigarro Eterno")) {
        jugador.escudo += 5;
        console.log("¡Cigarro Eterno te otorga +5 Escudo!");
    }
    
    jugador.cartasUsadasEsteTurno = {}; // Resetear cartas usadas este turno
    cartaSeleccionadaIndex = null; // Deseleccionar la carta al empezar nuevo turno

    // Reducir cooldowns
    if (jugador.cooldowns) {
        for (let k in jugador.cooldowns) {
            if (jugador.cooldowns[k] > 0) {
                jugador.cooldowns[k]--;
            }
        }
    }

    // --- NUEVO: DAÑO POR ESTADOS DE MAMANI AL INICIAR SU TURNO ---
    if (jugador.estado === "sangrado") {
        jugador.hp = Math.max(1, jugador.hp - 4); // Deja al menos 1 HP
        animaciones.textosFlotantes.push({ x: 80, y: 90, texto: "-4 (Sangrado)", color: "#c0392b", vida: 60, maxVida: 60 });
        sistemaAudio.sfx('danoJugador');
    } else if (jugador.estado === "quemadura") {
        jugador.hp = Math.max(1, jugador.hp - 6);
        animaciones.textosFlotantes.push({ x: 80, y: 90, texto: "-6 (Quemadura)", color: "#e67e22", vida: 60, maxVida: 60 });
        sistemaAudio.sfx('danoJugador');
    }

    console.log("--- TU TURNO --- ¡AP restaurado!");
}

// Evento de clic unificado (Pointer Event) para PC y Móviles táctiles
// Evento de clic unificado (Pointer Event) para PC y Móviles táctiles
canvas.addEventListener('pointerdown', (e) => {
    // Siempre mapeamos a coordenadas lógicas 480x270,
    // independientemente del DPR físico del canvas.
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (480 / rect.width);
    const clickY = (e.clientY - rect.top) * (270 / rect.height);


    // ── Clic en Botón Mute (Siempre disponible fuera del menú) ──────────
    if (estadoActual !== ESTADOS.MENU) {
        if (clickX >= MUTE_BTN.x && clickX <= MUTE_BTN.x + MUTE_BTN.w &&
            clickY >= MUTE_BTN.y && clickY <= MUTE_BTN.y + MUTE_BTN.h) {
            sistemaAudio.inicializar();
            sistemaAudio.toggleMute();
            return; // Detener propagación
        }
    }

    // ==========================================
    // INTERCEPTOR: MODAL DE CONFIRMACIÓN HTML ACTIVO
    // El modal es HTML; los botones se manejan solos.
    // Solo bloqueamos clics del canvas mientras esté visible.
    // ==========================================
    if (confirmacionActual) {
        return; // Bloquear cualquier otro procesamiento de clic en el canvas
    }

    // ==========================================
    // CLICS EN LA CUTSCENE
    // ==========================================
    if (estadoActual === ESTADOS.CUTSCENE) {
        avanzarCutscene();
        return;
    }

    // ==========================================
    // CLIC EN PANTALLA DE TUTORIAL COMPLETADO
    // ==========================================
    if (estadoActual === ESTADOS.TUTORIAL_COMPLETO) {
        // Hard reset del jugador para el inicio real (Acto 1)
        jugador.oro = 100; // Inicia con 100G
        jugador.hp = jugador.hpMax;
        jugador.ap = jugador.apMax;
        jugador.escudo = 0;
        jugador.reliquias = [];
        // Mazo inicial básico
        jugador.mano = {
            ofensiva: { ...CARTAS_BASE.ofensiva },
            defensiva: { ...CARTAS_BASE.defensiva },
            elemental: null,
            mejora: null,
            nerfeo: null
        };
        jugador.coleccionCartas = [
            { ...CARTAS_BASE.ofensiva },
            { ...CARTAS_BASE.defensiva }
        ];

        document.getElementById('hud-ui').style.display = 'flex';
        
        avanzarSiguienteActo();
        
        return;
    }

    // ==========================================
    // CLICS EN EL TUTORIAL — Validación de pasos
    // ==========================================
    if (estadoActual === ESTADOS.TUTORIAL) {
        const paso = TUTORIAL_PASOS[tutorialPasoActual];
        if (!paso) return;

        if (paso.tipo === "INFO" || paso.tipo === "MISION") {
            // Clic en cualquier lado avanza
            avanzarTutorial();
        } else if (paso.tipo === "ACCION") {
            // Sistema de doble toque en el tutorial
            // Usamos la posición real de la carta en el layout plano
            const cfgManoTut = UI_CONFIG.mano;
            if (paso.accion === "JUGAR_OFENSIVA") {
                // Carta 0 (ofensiva): x=55, y=200 (o 182 si está levantada)
                const idxOfen = 0;
                const xOfen = cfgManoTut.xInicial + idxOfen * (cfgManoTut.ancho + cfgManoTut.espacio);
                const yOfen = (cartaSeleccionadaIndex === idxOfen) ? cfgManoTut.yBase - 18 : cfgManoTut.yBase;
                if (clickX >= xOfen - 4 && clickX <= xOfen + cfgManoTut.ancho + 4 &&
                    clickY >= yOfen - 4 && clickY <= yOfen + cfgManoTut.alto + 4) {
                    if (cartaSeleccionadaIndex === idxOfen) {
                        cartaSeleccionadaIndex = null;
                        jugarCarta("ofensiva");
                    } else {
                        cartaSeleccionadaIndex = idxOfen;
                        sistemaAudio.sfx('hover');
                    }
                }
            } else if (paso.accion === "JUGAR_DEFENSIVA") {
                // Carta 1 (defensiva)
                const idxDef = 1;
                const xDef = cfgManoTut.xInicial + idxDef * (cfgManoTut.ancho + cfgManoTut.espacio);
                const yDef = (cartaSeleccionadaIndex === idxDef) ? cfgManoTut.yBase - 18 : cfgManoTut.yBase;
                if (clickX >= xDef - 4 && clickX <= xDef + cfgManoTut.ancho + 4 &&
                    clickY >= yDef - 4 && clickY <= yDef + cfgManoTut.alto + 4) {
                    if (cartaSeleccionadaIndex === idxDef) {
                        cartaSeleccionadaIndex = null;
                        jugarCarta("defensiva");
                    } else {
                        cartaSeleccionadaIndex = idxDef;
                        sistemaAudio.sfx('hover');
                    }
                }
            } else if (paso.accion === "TERMINAR_TURNO") {
                const sp = paso.spotlight;
                if (clickX >= sp.x - 4 && clickX <= sp.x + sp.w + 4 &&
                    clickY >= sp.y - 4 && clickY <= sp.y + sp.h + 4) {
                    terminarTurno();
                }
            }
        } else if (paso.tipo === "LIBRE" || paso.accion === "DERROTAR_ENEMIGO") {
            // Paso libre: sistema de doble toque también, posiciones planas
            const btnTerminar = UI_CONFIG.combate.terminarTurno;
            if (clickX >= btnTerminar.x && clickX <= btnTerminar.x + btnTerminar.w && clickY >= btnTerminar.y && clickY <= btnTerminar.y + btnTerminar.h) {
                cartaSeleccionadaIndex = null;
                terminarTurno();
                return;
            }
            const categoriesLib = ["ofensiva", "defensiva", "elemental", "mejora", "nerfeo"];
            const cfgManoLib = UI_CONFIG.mano;
            let tocadaLibIndex = null;
            for (let i = 0; i < categoriesLib.length; i++) {
                const xCartaLib = cfgManoLib.xInicial + i * (cfgManoLib.ancho + cfgManoLib.espacio);
                const yCartaLib = (cartaSeleccionadaIndex === i)
                    ? cfgManoLib.yBase - 18
                    : cfgManoLib.yBase;
                if (clickX >= xCartaLib - 4 && clickX <= xCartaLib + cfgManoLib.ancho + 4 &&
                    clickY >= yCartaLib - 4 && clickY <= yCartaLib + cfgManoLib.alto + 4) {
                    tocadaLibIndex = i;
                    break;
                }
            }
            if (tocadaLibIndex !== null) {
                const catLib = categoriesLib[tocadaLibIndex];
                if (jugador.mano[catLib] === null) {
                    cartaSeleccionadaIndex = null;
                } else if (cartaSeleccionadaIndex === tocadaLibIndex) {
                    cartaSeleccionadaIndex = null;
                    jugarCarta(catLib);
                } else {
                    cartaSeleccionadaIndex = tocadaLibIndex;
                    sistemaAudio.sfx('hover');
                }
            } else {
                cartaSeleccionadaIndex = null;
            }
        }
        return; // En tutorial siempre salimos aquí para no procesar combate normal
    }

    // ==========================================
    // CLICS EN LA PANTALLA DE COMBATE
    // ==========================================
    if (estadoActual === ESTADOS.COMBATE) {
        // --- Botón END TURN ---
        const btnTerminar = UI_CONFIG.combate.terminarTurno;
        if (clickX >= btnTerminar.x && clickX <= btnTerminar.x + btnTerminar.w &&
            clickY >= btnTerminar.y && clickY <= btnTerminar.y + btnTerminar.h) {
            sistemaAudio.sfx('finTurno');
            terminarTurno();
            return;
        }

        // --- Botón HUIR ---
        const btnHuir = UI_CONFIG.combate.huir;
        const esJefe = enemigo.nombre.includes("El Jichi") || enemigo.nombre.includes("El Tío") || enemigo.nombre.includes("Huiracocha") || enemigo.nombre.includes("Jefe");
        if (!esJefe && clickX >= btnHuir.x && clickX <= btnHuir.x + btnHuir.w &&
            clickY >= btnHuir.y && clickY <= btnHuir.y + btnHuir.h) {
            sistemaAudio.sfx('huir');
            volverAlMapa();
            return;
        }

        // --- CLIC EN OBJETOS DE LA BOLSA ---
        const slotX = 8;
        for (let i = 0; i < 3; i++) {
            const slotY = 150 + (i * 30); // 150, 180, 210
            if (clickX >= slotX && clickX <= slotX + 24 && clickY >= slotY && clickY <= slotY + 24) {
                if (jugador.slotsCombate[i]) {
                    usarItem(i);
                }
                return; // Termina el clic si tocó la bolsa
            }
        }

        // --- SISTEMA DE DOBLE TOQUE EN CARTAS ---
        // Primer toque: selecciona/levanta la carta.
        // Segundo toque en la misma carta: la juega.
        // Toque en otra carta: la selecciona (deselecciona la anterior).
        const categories = ["ofensiva", "defensiva", "elemental", "mejora", "nerfeo"];
        const cfgMano = UI_CONFIG.mano;

        let cartaTocadaIndex = null;

        // Detectar qué carta fue tocada (posición PLANA, sin curva de abanico)
        for (let i = 0; i < categories.length; i++) {
            const xCarta = cfgMano.xInicial + i * (cfgMano.ancho + cfgMano.espacio);
            // La carta seleccionada está levantada 18px, las demás en yBase
            const yCarta = (cartaSeleccionadaIndex === i)
                ? cfgMano.yBase - 18
                : cfgMano.yBase;

            // Área de toque generosa para celular (+4px en todos los lados)
            if (clickX >= xCarta - 4 && clickX <= xCarta + cfgMano.ancho + 4 &&
                clickY >= yCarta - 4 && clickY <= yCarta + cfgMano.alto + 4) {
                cartaTocadaIndex = i;
                break;
            }
        }

        if (cartaTocadaIndex !== null) {
            const catTocada = categories[cartaTocadaIndex];
            const cartaTocada = jugador.mano[catTocada];

            if (cartaTocada === null) {
                // Carta vacía, deseleccionar todo
                cartaSeleccionadaIndex = null;
            } else if (cartaSeleccionadaIndex === cartaTocadaIndex) {
                // ¡SEGUNDO TOQUE en la misma carta! → Jugarla
                cartaSeleccionadaIndex = null;
                jugarCarta(catTocada);
            } else {
                // PRIMER TOQUE en esta carta → Seleccionarla/levantarla
                cartaSeleccionadaIndex = cartaTocadaIndex;
                sistemaAudio.sfx('hover'); // Pequeño sonido de selección
            }
        } else {
            // Toque fuera de todas las cartas → Deseleccionar
            cartaSeleccionadaIndex = null;
        }
    }

    // ==========================================
    // CLICS EN LA PANTALLA DE MAPA
    // ==========================================
    else if (estadoActual === ESTADOS.MAPA) {
        // Interceptar clics para el tutorial del mapa en el Acto 0
        if (actoActual === 0) {
            if (mapaTutorialPaso === 0 || mapaTutorialPaso === 1 || mapaTutorialPaso === 3 || mapaTutorialPaso === 5 || mapaTutorialPaso === 6 || mapaTutorialPaso === 8) {
                mapaTutorialPaso++;
                sistemaAudio.sfx('hover');
                return; // Bloqueamos interacción con el mapa mientras está el diálogo
            }
        }

        nodosMapa.forEach((nodo, index) => {
            // Permitir interactuar con nodos disponibles o el nodo actual si no está completado (para reintentar)
            const esReintento = (index === nodoActualIndex && !nodo.completado);
            if (!nodo.disponible && !esReintento) return;

            // Cálculo de distancia matemática para detectar el clic en el nodo
            const distancia = Math.sqrt((clickX - nodo.x) ** 2 + (clickY - nodo.y) ** 2);

            if (distancia <= 14) { // Rango ampliado de 14px para facilitar el clic/toque
                const procesarViaje = () => {
                    console.log("Viajando al nodo: " + nodo.tipo);
                    sistemaAudio.sfx('nodoSeleccionar');

                    // Movemos a Mamani visualmente
                    nodosMapa[nodoActualIndex].completado = true;
                    nodosMapa[nodoActualIndex].disponible = false;
                    nodoActualIndex = index;

                    // Habilitamos los siguientes nodos de la ruta
                    actualizarRutasDisponibles(index);

                    // Ejecutamos la acción según el tipo de nodo
                    if (nodo.tipo === "COMBATE" || nodo.tipo === "JEFE") {
                        sistemaAudio.sfx('entrarCombate');
                        enemigo.configurarEnemigo(nodo.tipo);

                        // Limpiar todo el sistema de animaciones para el nuevo combate
                        ['jugador', 'enemigo'].forEach(obj => {
                            const a = animaciones[obj];
                            a.atkOffset = 0; a.hitShake = 0; a.shieldFlash = 0;
                            a.pose = null; a.poseTimer = 0; a.cat = null;
                            a.fase = 'idle'; a.faseTick = 0;
                            a.escalaY = 1; a.inclinacion = 0;
                            a._pendingProyectil = null;
                        });
                        animaciones.textosFlotantes.length = 0;
                        animaciones.proyectiles.length = 0;
                        animaciones.hitSparks.length = 0;
                        animaciones.particulas.length = 0;
                        animaciones.flashPantalla = 0;
                        animaciones.ondaChoque = null;

                        if (actoActual === 0 && nodo.tipo === "COMBATE") {
                            // Configurar al Quirquincho de Entrenamiento
                            enemigo.nombre = "Quirquincho de Entrenamiento";
                            enemigo.hpMax = 200;
                            enemigo.hp = 200;
                            enemigo.defensa = 0;
                            enemigo.escudo = 0;
                            enemigo.estado = null;
                            enemigo.intencion = { tipo: "ATAQUE", valor: 5, descripcion: "Ataque basico: 5 DMG" };
                            estadoActual = ESTADOS.TUTORIAL;
                        } else {
                            estadoActual = ESTADOS.COMBATE;
                        }
                        tiempoMisionCombate = Date.now();
                        jugador.escudo = 0;
                        if (jugador.reliquias) {
                            jugador.reliquias.forEach(r => {
                                if (r.efecto === "escudo_ini") {
                                    jugador.escudo += r.valor;
                                    animaciones.textosFlotantes.push({ x: 180, y: 150, texto: "¡" + r.nombre + " (+" + r.valor + " ESCUDO)!", color: "#3498db", vida: 60, maxVida: 60 });
                                }
                            });
                            // Buff "Piel del Jaguar" (bloqueoBase)
                            if (jugador.bloqueoBase > 0) {
                                jugador.escudo += jugador.bloqueoBase;
                            }
                        }
                    }
                    else if (nodo.tipo === "TIENDA") {
                        sistemaAudio.sfx('entrarTienda');
                        estadoActual = ESTADOS.TIENDA;
                        pestanaTiendaActual = 'objetos';
                        itemSeleccionadoTienda = null;
                        itemsTiendaActuales.objetos = generarItemsTienda('objetos');
                        itemsTiendaActuales.mazo = generarItemsTienda('mazo');
                    }
                    else if (nodo.tipo === "EVENTO") {
                        sistemaAudio.sfx('entrarEvento');
                        estadoActual = ESTADOS.EVENTO;
                    }
                    else if (nodo.tipo === "CAMPAMENTO") {
                        sistemaAudio.sfx('entrarCampamento');
                        iniciarCampamento();
                        estadoActual = ESTADOS.CAMPAMENTO;
                        campamentoAccionRealizada = false;
                    }
                };

                if (nodo.tipo === "JEFE") {
                    mostrarConfirmacion(
                        "¡Peligro Inminente!",
                        "¿Equipaste tus objetos de la bolsa? No podrás huir.",
                        procesarViaje
                    );
                } else {
                    procesarViaje();
                }
                return;
            }
        });
    }
    // ==========================================
    // CLICS EN LA PANTALLA DE TIENDA (Nuevo sistema Andino)
    // ==========================================
    else if (estadoActual === ESTADOS.TIENDA) {
        // Interceptar clics para el tutorial de la Tienda (Acto 0)
        if (actoActual === 0 && !tiendaTutorialCompletado) {
            if (tiendaTutorialPaso < 4) {
                tiendaTutorialPaso++;
                sistemaAudio.sfx('hover');

                // Forzar cambio de pestaña para seguir el tutorial
                if (tiendaTutorialPaso === 2) pestanaTiendaActual = 'pasivas';
                if (tiendaTutorialPaso === 3) {
                    pestanaTiendaActual = 'mazo';
                    // Cargar items del mazo si no están listos
                    if (!itemsTiendaActuales.mazo || itemsTiendaActuales.mazo.length === 0) {
                        itemsTiendaActuales.mazo = generarItemsTienda('mazo');
                    }
                }
                return; // Bloquea interacción
            } else if (tiendaTutorialPaso === 4) {
                tiendaTutorialPaso++;
                tiendaTutorialCompletado = true;
                sistemaAudio.sfx('hover');
                return; // Termina el tutorial
            }
        }

        // 1. Botón SALIR
        const btnVolver = UI_CONFIG.tienda.volverMapa;
        if (clickX >= btnVolver.x && clickX <= btnVolver.x + btnVolver.w &&
            clickY >= btnVolver.y && clickY <= btnVolver.y + btnVolver.h) {
            sistemaAudio.sfx('retroceder');
            nodosMapa[nodoActualIndex].completado = true;
            nodosMapa[nodoActualIndex].disponible = false;
            estadoActual = ESTADOS.MAPA;
            itemSeleccionadoTienda = null;
            return;
        }

        // 2. Pestañas
        let clicEnPestana = false;
        UI_CONFIG.tienda.tabs.forEach(tab => {
            if (clickX >= tab.x && clickX <= tab.x + tab.w &&
                clickY >= tab.y && clickY <= tab.y + tab.h) {
                sistemaAudio.sfx('hover');
                pestanaTiendaActual = tab.id;
                itemSeleccionadoTienda = null;
                clicEnPestana = true;
            }
        });
        if (clicEnPestana) return;

        // 3. Botón CAMBIAR (solo objetos/mazo)
        if (pestanaTiendaActual !== 'pasivas') {
            const bCamb = { x: 20, y: 204, w: 158, h: 24 };
            if (clickX >= bCamb.x && clickX <= bCamb.x + bCamb.w &&
                clickY >= bCamb.y && clickY <= bCamb.y + bCamb.h) {
                if (jugador.oro >= costoReemplazar) {
                    jugador.oro -= costoReemplazar;
                    itemsTiendaActuales[pestanaTiendaActual] = generarItemsTienda(pestanaTiendaActual);
                    itemSeleccionadoTienda = null;
                    sistemaAudio.sfx('hover');
                    mostrarToast("Renovado", "Nuevos artículos disponibles (-" + costoReemplazar + "G)", "compra");
                } else {
                    sistemaAudio.sfx('error');
                    mostrarToast("¡Oro insuficiente!", "Necesitas " + costoReemplazar + "G para cambiar", "error");
                }
                return;
            }
        }

        // 4. Botón COMPRAR
        const bComp = { x: 302, y: 204, w: 158, h: 24 };
        if (clickX >= bComp.x && clickX <= bComp.x + bComp.w &&
            clickY >= bComp.y && clickY <= bComp.y + bComp.h) {
            if (!itemSeleccionadoTienda) return;

            if (pestanaTiendaActual === 'pasivas' && itemSeleccionadoTienda.buffId) {
                // Compra de buff por niveles
                const bf = BUFFS_NIVELES.find(b => b.id === itemSeleccionadoTienda.buffId);
                const nv = jugador.pasivas[itemSeleccionadoTienda.buffId] || 0;
                if (!bf || nv >= bf.niveles.length) {
                    mostrarToast("Nivel Máximo", "Este buff ya está al máximo", "error");
                    return;
                }
                const nvDat = bf.niveles[nv];
                if (jugador.oro < nvDat.costo) {
                    sistemaAudio.sfx('error');
                    mostrarToast("¡Oro insuficiente!", "Necesitas " + nvDat.costo + "G", "error");
                    return;
                }
                jugador.oro -= nvDat.costo;
                jugador.pasivas[itemSeleccionadoTienda.buffId]++;
                sistemaAudio.sfx('compra');
                // Aplicar efecto
                if (nvDat.efecto === 'hp_max') {
                    jugador.hpMax += nvDat.valor;
                    jugador.hp = Math.min(jugador.hp + nvDat.valor, jugador.hpMax);
                } else if (nvDat.efecto === 'ap_max') {
                    jugador.apMax += nvDat.valor;
                } else if (nvDat.efecto === 'bloqueo_base') {
                    jugador.bloqueoBase = (jugador.bloqueoBase || 0) + nvDat.valor;
                } else if (nvDat.efecto === 'danio_bonus') {
                    jugador.danioBonus = (jugador.danioBonus || 0) + nvDat.valor;
                }
                mostrarToast("¡" + bf.nombre + " Nv." + (nv + 1) + "!", nvDat.desc + " aplicado", "compra");
                itemSeleccionadoTienda = null;

            } else if (pestanaTiendaActual === 'objetos') {
                if (jugador.oro < itemSeleccionadoTienda.costo) {
                    sistemaAudio.sfx('error');
                    mostrarToast("¡Oro insuficiente!", "No puedes pagar este artículo", "error");
                    return;
                }
                const esInstantaneo = (itemSeleccionadoTienda.desc || '').includes("HP") || (itemSeleccionadoTienda.desc || '').includes("Vida");
                jugador.oro -= itemSeleccionadoTienda.costo;
                sistemaAudio.sfx('compra');
                if (esInstantaneo) {
                    let cur = parseInt((itemSeleccionadoTienda.desc || '').replace(/\D/g, '')) || 20;
                    if (modoLeyenda) cur = Math.round(cur * 0.7);
                    jugador.hp = Math.min(jugador.hpMax, jugador.hp + cur);
                    mostrarToast("¡" + itemSeleccionadoTienda.nombre + "!", "Recuperas " + cur + " HP" + (modoLeyenda ? " (Leyenda -30%)" : ""), "compra");
                } else {
                    jugador.inventario.push({ ...itemSeleccionadoTienda });
                    mostrarToast("¡Comprado!", itemSeleccionadoTienda.nombre + " en inventario", "compra");
                }
                // Quitar item comprado de las opciones
                const idx = itemsTiendaActuales.objetos.findIndex(it => it.id === itemSeleccionadoTienda.id);
                if (idx !== -1) itemsTiendaActuales.objetos.splice(idx, 1);
                itemSeleccionadoTienda = null;

            } else if (pestanaTiendaActual === 'mazo') {
                if (jugador.oro < itemSeleccionadoTienda.costo) {
                    sistemaAudio.sfx('error');
                    mostrarToast("¡Oro insuficiente!", "No puedes pagar esta carta", "error");
                    return;
                }
                jugador.oro -= itemSeleccionadoTienda.costo;
                sistemaAudio.sfx('compra');
                const cat = itemSeleccionadoTienda.categoria;
                jugador.coleccionCartas.push({ ...itemSeleccionadoTienda.carta });
                guardarLogro('carta', itemSeleccionadoTienda.carta.nombre); // Logro
                if (cat) jugador.mano[cat] = { ...itemSeleccionadoTienda.carta };
                const idxM = itemsTiendaActuales.mazo.findIndex(it => it.id === itemSeleccionadoTienda.id);
                if (idxM !== -1) itemsTiendaActuales.mazo.splice(idxM, 1);
                mostrarToast("¡" + itemSeleccionadoTienda.nombre + " obtenida!", "Añadida a tu colección", "compra");
                itemSeleccionadoTienda = null;
            }
            return;
        }

        // 5. Clic en cartas de items (OBJETOS/MAZO)
        if (pestanaTiendaActual !== 'pasivas') {
            const items = itemsTiendaActuales[pestanaTiendaActual] || [];
            const CW = 100, CH = 148, GAP = 12;
            const startX = Math.floor((480 - (4 * CW + 3 * GAP)) / 2);
            items.forEach((item, idx) => {
                const cx = startX + idx * (CW + GAP);
                if (clickX >= cx && clickX <= cx + CW && clickY >= 45 && clickY <= 45 + CH) {
                    sistemaAudio.sfx('hover');
                    itemSeleccionadoTienda = item;
                }
            });
        } else {
            // 6. Clic en cartas de buffs (PASIVAS)
            const BL = [{ x: 12, y: 48 }, { x: 250, y: 48 }, { x: 12, y: 132 }, { x: 250, y: 132 }];
            const BW = 210, BH = 74;
            BUFFS_NIVELES.forEach((buff, bi) => {
                if (bi >= BL.length) return;
                const { x, y } = BL[bi];
                const nv = jugador.pasivas[buff.id] || 0;
                if (nv >= buff.niveles.length) return; // MAX, no clickeable
                if (clickX >= x && clickX <= x + BW && clickY >= y && clickY <= y + BH) {
                    sistemaAudio.sfx('hover');
                    itemSeleccionadoTienda = { buffId: buff.id, nombre: buff.nombre, costo: buff.niveles[nv].costo };
                }
            });
        }
    }

    // ==========================================
    // CLIC EN LA PANTALLA DE VICTORIA
    // ==========================================
    else if (estadoActual === ESTADOS.VICTORIA) {
        // Cualquier clic lanza la pantalla de recompensas
        sistemaAudio.sfx('confirmar');
        regresarAlMapaTrasCombate();
        return;
    }

    // ==========================================
    // CLICS EN LA PANTALLA DE RECOMPENSA
    // ==========================================
    else if (estadoActual === ESTADOS.RECOMPENSA) {
        const cfgR = UI_CONFIG.recompensa;

        // Detectar clic en botón Continuar (Omitir original)
        const btnOmitir = cfgR.omitir;
        // Coordenadas actualizadas para el botón centrado y bajado a y=160 (definido en dibujarPantallaRecompensa)
        const btnX = 240 - (btnOmitir.w / 2);
        const btnY = esRecompensaJefe ? 200 : 160;

        if (clickX >= btnX && clickX <= btnX + btnOmitir.w &&
            clickY >= btnY && clickY <= btnY + btnOmitir.h) {

            sistemaAudio.sfx('recompensa');
            // Añadir el oro
            jugador.oro += oroRecompensa;
            nodosMapa[nodoActualIndex].completado = true;
            nodosMapa[nodoActualIndex].disponible = false;
            canvas.style.cursor = "default"; // Resetear cursor

            if (esRecompensaJefe) {
                esRecompensaJefe = false;
                reliquiaJefeObtenida = null; // Limpiar para siguiente jefe
                avanzarSiguienteActo();
            } else {
                estadoActual = ESTADOS.MAPA;
            }
            return;
        }
    }

    // ==========================================
    // CLICS EN LA PANTALLA DE EVENTO
    // ==========================================
    else if (estadoActual === ESTADOS.EVENTO) {
        // Obtener evento usando la misma clave compuesta que usa el renderer
        const claveEvClick = `${actoActual}_${nodoActualIndex}`;
        const eventoClick = EVENTOS_POR_NODO[claveEvClick] || EVENTO_YATIRI_FALLBACK;
        const opcion1 = eventoClick.opciones[0];
        const opcion2 = eventoClick.opciones[1];
        const w = UI_CONFIG.evento.opcionAncho;
        const h = UI_CONFIG.evento.opcionAlto;

        // Helper para finalizar el nodo de evento y desbloquear siguientes
        function finalizarEventoNodo() {
            nodosMapa[nodoActualIndex].completado = true;
            nodosMapa[nodoActualIndex].disponible = false;
            // Desbloquear los nodos conectados
            const conexiones = nodosMapa[nodoActualIndex].conexiones || [];
            conexiones.forEach(id => {
                if (nodosMapa[id]) nodosMapa[id].disponible = true;
            });
            estadoActual = ESTADOS.MAPA;
        }

        // Opción 1
        if (clickX >= opcion1.x && clickX <= opcion1.x + w && clickY >= opcion1.y && clickY <= opcion1.y + h) {
            const validar = eventoClick.valida1 ? eventoClick.valida1(jugador) : true;
            if (validar) {
                const res = eventoClick.efecto1(jugador);
                sistemaAudio.sfx(res.tipo === 'eventoMal' ? 'eventoMal' : 'eventoBien');
                mostrarToast(res.msg, res.detalle, res.tipo);
                finalizarEventoNodo();
            } else {
                sistemaAudio.sfx('error');
                mostrarToast("¡No puedes!", eventoClick.msgError1 || "Condición no cumplida", "error");
            }
        }

        // Opción 2
        else if (opcion2 && clickX >= opcion2.x && clickX <= opcion2.x + w && clickY >= opcion2.y && clickY <= opcion2.y + h) {
            const validar2 = eventoClick.valida2 ? eventoClick.valida2(jugador) : true;
            if (validar2) {
                const res2 = eventoClick.efecto2(jugador);
                sistemaAudio.sfx(res2.tipo === 'eventoMal' ? 'eventoMal' : 'eventoBien');
                mostrarToast(res2.msg, res2.detalle, res2.tipo);
                finalizarEventoNodo();
            } else {
                sistemaAudio.sfx('error');
                mostrarToast("¡No puedes!", eventoClick.msgError2 || "Condición no cumplida", "error");
            }
        }
    }

    // ==========================================
    // CLICS EN LA PANTALLA DE CAMPAMENTO
    // ==========================================
    else if (estadoActual === ESTADOS.CAMPAMENTO) {
        const opt = UI_CONFIG.campamento;

        // 1. Detectar clic en el botón "VOLVER AL MAPA"
        const btnVolver = opt.volverMapa;
        if (clickX >= btnVolver.x && clickX <= btnVolver.x + btnVolver.w && clickY >= btnVolver.y && clickY <= btnVolver.y + btnVolver.h) {
            sistemaAudio.sfx('retroceder');
            // Marcamos el nodo de la pascana como completado en el mapa
            nodosMapa[nodoActualIndex].completado = true;
            nodosMapa[nodoActualIndex].disponible = false;
            estadoActual = ESTADOS.MAPA;
            return;
        }

        // Si ya realizamos una acción en este campamento, no permitimos más clics
        if (campamentoAccionRealizada) return;

        // 2. Opción 1: Descansar
        if (clickX >= opt.opcion1.x && clickX <= opt.opcion1.x + opt.opcionAncho &&
            clickY >= opt.opcion1.y && clickY <= opt.opcion1.y + opt.opcionAlto) {

            let curacion = Math.round(jugador.hpMax * 0.35);
            if (actoActual === 2 && nodosMapa[nodoActualIndex] && nodosMapa[nodoActualIndex].id === 5) {
                curacion = Math.round(jugador.hpMax * 0.40);
            }
            if (modoLeyenda) {
                curacion = Math.round(curacion * 0.7);
            }
            jugador.hp = Math.min(jugador.hpMax, jugador.hp + curacion);
            campamentoAccionRealizada = true;
            sistemaAudio.sfx('descanso');
            mostrarToast("¡Descanso!", "Recuperas " + curacion + " HP" + (modoLeyenda ? " (Penalización Leyenda)" : ""), "compra");
        }

        // 3. Opción 2: Meditar
        else if (clickX >= opt.opcion2.x && clickX <= opt.opcion2.x + opt.opcionAncho &&
            clickY >= opt.opcion2.y && clickY <= opt.opcion2.y + opt.opcionAlto) {
            jugador.hpMax += 10;
            jugador.hp += 10;
            campamentoAccionRealizada = true;
            sistemaAudio.sfx('mejora');
            mostrarToast("¡Meditación!", "HP máximo +10 con hojas de coca", "compra");
        }
    }

    // ==========================================
    // CLICS EN LA PANTALLA DE GAME OVER
    // ==========================================
    else if (estadoActual === ESTADOS.GAMEOVER) {
        // Detectar clic en el botón "VOLVER A INTENTAR"
        const btnReintentar = UI_CONFIG.gameOver.reintentar;
        if (clickX >= btnReintentar.x && clickX <= btnReintentar.x + btnReintentar.w && clickY >= btnReintentar.y && clickY <= btnReintentar.y + btnReintentar.h) {
            // Volver al menú SIN recargar la página (tutorialCompletado se mantiene en true)
            reiniciarAlMenu();
        }
    }
    // ==========================================
    // CLICS EN LA PANTALLA DE VICTORIA TOTAL
    // ==========================================
    else if (estadoActual === ESTADOS.VICTORIA_TOTAL) {
        const textoCompleto = modoLeyenda ? TEXTO_VICTORIA_LEYENDA : TEXTO_VICTORIA_NORMAL;
        // Solo permitimos hacer clic en el botón si el texto ya terminó de escribirse
        if (textoVictoriaIndex >= textoCompleto.length) {
            const btn = { x: 165, y: 250, w: 150, h: 22 };
            if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
                sistemaAudio.sfx('retroceder');
                // Recargamos la página para volver al menú de inicio limpio
                location.reload();
            }
        }
    }
});
// Evento para detectar el movimiento del mouse (solo para mostrar cursor pointer, sin levantar cartas)
canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (480 / rect.width);
    mouseY = (e.clientY - rect.top) * (270 / rect.height);
    // El hover del mouse ya NO levanta cartas.
    // Solo actualiza mouseX/mouseY para el cursor y el tooltip de intención enemiga.
});

// Limpia el efecto cuando el dedo o cursor sale del canvas
canvas.addEventListener('pointerleave', () => {
    // NO deseleccionamos la carta al salir (el jugador puede haber querido seleccionarla)
    mouseX = -100;
    mouseY = -100;
});

// Habilita los caminos futuros del mapa tras avanzar
function actualizarRutasDisponibles(actualIndex) {
    // Bloqueamos todos los nodos primero
    nodosMapa.forEach(n => n.disponible = false);

    // Desbloqueamos los nodos a los que conecta el nodo actual completado
    const nodoActual = nodosMapa[actualIndex];
    if (nodoActual && nodoActual.conexiones && nodoActual.conexiones.length > 0) {
        nodoActual.conexiones.forEach(destId => {
            if (nodosMapa[destId] && !nodosMapa[destId].completado) {
                nodosMapa[destId].disponible = true;
            }
        });
    }
}
/* ==========================================================================
   11. ARRANQUE DEL JUEGO
   ========================================================================== */

// Resetea el estado del juego y vuelve al menú SIN recargar la página.
// tutorialCompletado NO se toca para que la sesión lo recuerde.
function reiniciarAlMenu() {
    // Ocultar todas las UIs del juego
    document.getElementById('hud-ui').style.display = 'none';
    document.getElementById('pause-menu-ui').style.display = 'none';
    canvas.style.display = 'block';

    // Resetear jugador a valores iniciales
    jugador.hpMax = 100;
    jugador.hp    = 100;
    jugador.apMax = 3;
    jugador.ap    = 3;
    jugador.escudo = 0;
    jugador.oro   = 100;
    jugador.inventario     = [];
    jugador.slotsCombate   = [null, null, null];
    jugador.reliquias      = [];
    jugador.pasivas        = { vitalidad: 0, energia: 0, defensa: 0, fuerza: 0 };
    jugador.danioBonus     = 0;
    jugador.bloqueoBase    = 0;
    jugador.cartasUsadasEsteTurno = {};
    jugador.mano = {
        ofensiva:  { ...CARTAS_BASE.ofensiva },
        defensiva: { ...CARTAS_BASE.defensiva },
        elemental: null,
        mejora:    null,
        nerfeo:    null
    };
    jugador.coleccionCartas = [{ ...CARTAS_BASE.ofensiva }, { ...CARTAS_BASE.defensiva }];

    // Resetear estado del juego (sin tocar tutorialCompletado)
    actoActual = 0;
    nodoActualIndex = 0;
    cartaSeleccionadaIndex = null;
    modoLeyenda = false;
    mapaTutorialPaso = 0;
    tiendaTutorialPaso = 0;
    tiendaTutorialCompletado = false;
    enModoTutorial = false;
    esRecompensaJefe = false;
    reliquiaJefeObtenida = null;
    campamentoAccionRealizada = false;

    // Volver al menú principal
    // El canvas se mantiene VISIBLE para que gameLoop dibuje el fondo del menú
    estadoActual = ESTADOS.MENU;
    canvas.style.display = 'block';
    menuUi.style.display = 'flex';
}

// Vuelve al menú principal con confirmación del jugador
function volverAlMenuPrincipal() {
    document.getElementById('pause-menu-ui').style.display = 'none';
    mostrarConfirmacion(
        "¿Volver al Menú?",
        "Tu progreso se perderá",
        function () { reiniciarAlMenu(); }, // SIN recargar — preserva tutorialCompletado
        function () { document.getElementById('pause-menu-ui').style.display = 'flex'; }
    );
}

cargarGraficos(() => {
    console.log("Gráficos listos. Iniciando Game Loop...");

    // Deshabilitar botón de Senda de Leyenda si no hay victorias registradas
    const btnLeyenda = document.getElementById('btn-leyenda');
    if (btnLeyenda) {
        if (viajesCompletados === 0) {
            btnLeyenda.disabled = true;
            btnLeyenda.title = "Completa el juego al menos una vez para desbloquear";
        }
    }

    // ==========================================
    // CORRECCIÓN DE BORROSIDAD (Device Pixel Ratio)
    // ==========================================
    // En pantallas de alta densidad (Retina, FHD+), el canvas debe tener
    // tantos píxeles físicos como la pantalla real para verse nítido.
    // Escalamos el canvas al DPR y ajustamos el contexto para que
    // el código de dibujo siga usando las coordenadas lógicas 480x270.
    (function corregirBorrosidad() {
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            canvas.width = 480 * dpr;
            canvas.height = 270 * dpr;
            ctx.scale(dpr, dpr);
        }
        // Desactivar suavizado en todos los navegadores
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
    })();

    gameLoop();
});


// ==========================================
// LÓGICA DE LOGROS Y COLECCIÓN
// ==========================================
window.mostrarLogros = function() {
    document.getElementById('logros-ui').style.display = 'flex';
    cambiarPestañaLogros('reliquias');
};

window.cerrarLogros = function() {
    document.getElementById('logros-ui').style.display = 'none';
};

window.cambiarPestañaLogros = function(tab) {
    let CARTAS_TIENDA = POOL_CARTAS_TIENDA.map(item => item.carta);
    // Resetear colores
    document.getElementById('tab-reliquias').style.background = '#121218';
    document.getElementById('tab-reliquias').style.color = '#ffcc00';
    document.getElementById('tab-stats').style.background = '#121218';
    document.getElementById('tab-stats').style.color = '#ffcc00';
    document.getElementById('tab-cartas').style.background = '#121218';
    document.getElementById('tab-cartas').style.color = '#ffcc00';

    // Iluminar activa
    document.getElementById('tab-' + tab).style.background = '#ffcc00';
    document.getElementById('tab-' + tab).style.color = '#121218';

    const content = document.getElementById('logros-content');
    content.innerHTML = '';

    if (tab === 'reliquias') {
        let html = '<div style="display:flex; gap: 4vw; justify-content: center; margin-top: 2vw; flex-wrap: wrap;">';
        Object.values(RELIQUIAS_JEFE).forEach(r => {
            const obtenida = coleccion_reliquias.includes(r.nombre);
            html += `<div style="text-align: center; width: 25%;">
                <img src="${r.spriteKey.replace('reliquia', 'img/reliquia_').toLowerCase() + '.webp'}" style="width: 5vw; height: 5vw; filter: ${obtenida ? 'none' : 'brightness(0)'}; image-rendering: pixelated;">
                <h3 style="color: ${obtenida ? '#fff' : '#666'}; font-size: 0.9vw; margin-top: 1vw;">${obtenida ? r.nombre : '???'}</h3>
                <p style="color: #c0a060; font-size: 0.7vw; line-height: 1vw; margin-top: 0.5vw;">${obtenida ? r.descripcion : 'Reliquia no descubierta'}</p>
            </div>`;
        });
        html += '</div>';
        content.innerHTML = html;
    } else if (tab === 'stats') {
        let totalCartas = new Set([CARTAS_BASE.ofensiva, CARTAS_BASE.defensiva, ...CARTAS_TIENDA, ...POOL_CARTAS_RECOMPENSA].map(c=>c.nombre)).size;
        content.innerHTML = `
            <div style="font-size: 1.2vw; color: #fff; line-height: 3vw; text-align: left; margin-left: 20%; margin-top: 2vw;">
                <p style="color: #f1c40f;">👑 Viajes Completados: <span style="color: #fff">${viajesCompletados}</span></p>
                <p style="color: #e74c3c;">☠️ Muertes de Mamani: <span style="color: #fff">${stats_muertes}</span></p>
                <p style="color: #3498db;">👹 Monstruos Derrotados: <span style="color: #fff">${stats_monstruos}</span></p>
                <p style="color: #2ecc71;">🎴 Cartas Descubiertas: <span style="color: #fff">${coleccion_cartas.length} / ${totalCartas}</span></p>
            </div>
        `;
    } else if (tab === 'cartas') {
        let todasLasCartas = [CARTAS_BASE.ofensiva, CARTAS_BASE.defensiva, ...CARTAS_TIENDA, ...POOL_CARTAS_RECOMPENSA];
        let unicas = [];
        let nombres = new Set();
        todasLasCartas.forEach(c => {
            if (c && !nombres.has(c.nombre)) {
                nombres.add(c.nombre);
                unicas.push(c);
            }
        });

        let html = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1vw;">';
        unicas.forEach(c => {
            const esBasica = c.nombre === "Puñetazo" || c.nombre === "Bloqueo Básico";
            const obtenida = coleccion_cartas.includes(c.nombre) || esBasica;
            
            const mapCat = {
                'ofensiva': '#e74c3c',
                'defensiva': '#3498db',
                'elemental': '#9b59b6',
                'mejora': '#2ecc71',
                'nerfeo': '#f1c40f'
            };
            const colorCat = mapCat[c.categoria] || '#95a5a6';

            html += `
            <div style="border: 0.2vw solid ${obtenida ? colorCat : '#333'}; border-radius: 0.5vw; padding: 0.5vw; background: ${obtenida ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)'};">
                <div style="display: flex; justify-content: space-between; font-size: 0.7vw;">
                    <span style="color:${obtenida ? '#ffcc00' : '#444'}; text-shadow: 1px 1px 0 #000;">${obtenida ? c.costoAP + ' AP' : '?'}</span>
                    <span style="color:${obtenida ? colorCat : '#444'};">${obtenida ? c.tipo : '???'}</span>
                </div>
                <div style="text-align: center; font-size: 0.8vw; margin: 1vw 0; height: 1.5vw; color: ${obtenida ? '#fff' : '#555'};">${obtenida ? c.nombre : '???'}</div>
                <div style="font-size: 0.6vw; color: ${obtenida ? '#aaa' : '#444'}; text-align: center; height: 3vw; line-height: 1vw;">${obtenida ? c.descripcion : 'Descubre esta carta en tu aventura.'}</div>
            </div>`;
        });
        html += '</div>';
        content.innerHTML = html;
    }
};
