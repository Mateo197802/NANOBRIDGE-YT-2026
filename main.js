/**
 * NANOBRIDGE YT 2026 - MAIN JAVASCRIPT BUNDLE
 * Features:
 * 1. Interactive Nanotechnology Mesh Canvas (Malla Interactiva with pointer tracking)
 * 2. Real-Time Countdown to Oct 26, 2026 10:00 AM (UTC-5)
 * 3. Bilingual i18n Engine (ES / EN) with LocalStorage persistence
 * 4. Interactive Schedule Tabs (Day 1 / Day 2) with expandable talk abstracts
 * 5. Lodging Detailed Room Accordion
 * 6. Abstract Modal System
 * 7. Calendar Sync (.ics download & Google Calendar link)
 * 8. Responsive Mobile Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initInteractiveMesh();
  initCountdown();
  initI18n();
  initScheduleTabs();
  initLodgingAccordion();
  initAbstractModal();
  initMobileMenu();
  initCalendarSync();
});

/* ==========================================================================
   1. INTERACTIVE MESH CANVAS (MALLA INTERACTIVA ESTILO MIT FELLOWSHIP)
   Concentric orbital rings, harmonic drift kinetic physics, and reactive
   pointer illumination with scene-adaptive color interpolation (ink / paper).
   Ported directly from MIT Critical Data FellowshipMeshField architecture.
   ========================================================================== */
function initInteractiveMesh() {
  const canvas = document.getElementById('mesh-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let frame = 0;
  let lastTime = 0;
  let pointerX = -1000;
  let pointerY = -1000;
  let pointerActive = false;

  // Scene Palettes (MIT Fellowship architecture)
  // ink: Dark scene (Hero, Venue, Footer) - Luminous cyan/teal with warm coral hotspot
  // paper: Light scene (About, Speakers, Schedule, Lodging, Registration) - Deep teal/slate with crimson/plasma hotspot
  const palettes = {
    ink: {
      line: [116, 190, 193],
      node: [157, 214, 214],
      hot: [255, 151, 118],
      glow: [255, 151, 118],
    },
    paper: {
      line: [47, 114, 120],
      node: [47, 114, 120],
      hot: [163, 31, 52],
      glow: [47, 114, 120],
    },
  };

  function clonePalette(palette) {
    return {
      line: [...palette.line],
      node: [...palette.node],
      hot: [...palette.hot],
      glow: [...palette.glow],
    };
  }

  function seeded(index) {
    const value = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function mixColor(from, to, amount) {
    return [
      from[0] + (to[0] - from[0]) * amount,
      from[1] + (to[1] - from[1]) * amount,
      from[2] + (to[2] - from[2]) * amount,
    ];
  }

  function rgba(color, alpha) {
    return `rgba(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])}, ${alpha})`;
  }

  function approachColor(current, target, amount = 0.07) {
    current[0] += (target[0] - current[0]) * amount;
    current[1] += (target[1] - current[1]) * amount;
    current[2] += (target[2] - current[2]) * amount;
  }

  function buildOrbitMesh(w, h) {
    const centerX = w * 0.52;
    const centerY = h * 0.48;
    const span = Math.max(w, h);
    const ringSpecs = [
      { rx: Math.max(170, span * 0.18), ry: Math.max(140, span * 0.15), count: 8, rotation: -0.18 },
      { rx: Math.max(320, span * 0.34), ry: Math.max(250, span * 0.28), count: 13, rotation: 0.12 },
      { rx: Math.max(540, span * 0.58), ry: Math.max(410, span * 0.47), count: 18, rotation: -0.08 },
    ];
    const nodes = [];
    const edges = [];
    const rings = ringSpecs.map((spec, index) => ({
      cx: centerX,
      cy: centerY,
      rx: spec.rx,
      ry: spec.ry,
      rotation: spec.rotation,
      phase: index * 1.8,
    }));
    const ringOffsets = [];

    // Ring nodes and circular edges
    for (let ringIndex = 0; ringIndex < ringSpecs.length; ringIndex += 1) {
      const spec = ringSpecs[ringIndex];
      const offset = nodes.length;
      ringOffsets.push(offset);

      for (let index = 0; index < spec.count; index += 1) {
        const angle = (index / spec.count) * Math.PI * 2 + spec.rotation;
        const jitter = seeded(index + ringIndex * 31) - 0.5;
        const anchorX = centerX + Math.cos(angle) * spec.rx + jitter * (ringIndex + 1) * 22;
        const anchorY = centerY + Math.sin(angle) * spec.ry + jitter * (ringIndex + 1) * 18;
        nodes.push({
          x: anchorX,
          y: anchorY,
          anchorX,
          anchorY,
          vx: 0,
          vy: 0,
          phase: seeded(index + ringIndex * 47 + 8) * Math.PI * 2,
          ring: ringIndex,
          radius: 1.6 + seeded(index + ringIndex * 59 + 14) * 2.2,
        });
        edges.push({ a: offset + index, b: offset + ((index + 1) % spec.count) });
      }
    }

    // Inter-ring lattice connections
    for (let ringIndex = 1; ringIndex < ringSpecs.length; ringIndex += 1) {
      const currentOffset = ringOffsets[ringIndex];
      const previousOffset = ringOffsets[ringIndex - 1];
      const currentCount = ringSpecs[ringIndex].count;
      const previousCount = ringSpecs[ringIndex - 1].count;

      for (let index = 0; index < currentCount; index += 1) {
        const previousIndex = Math.floor((index / currentCount) * previousCount) % previousCount;
        edges.push({ a: currentOffset + index, b: previousOffset + previousIndex });
        if (index % 3 === 0) {
          edges.push({ a: currentOffset + index, b: previousOffset + ((previousIndex + 1) % previousCount) });
        }
      }
    }

    // Central hub node
    const centerIndex = nodes.length;
    nodes.push({
      x: centerX,
      y: centerY,
      anchorX: centerX,
      anchorY: centerY,
      vx: 0,
      vy: 0,
      phase: 0.4,
      ring: -1,
      radius: 3.8,
    });

    for (let index = 0; index < ringSpecs[0].count; index += 2) {
      edges.push({ a: centerIndex, b: ringOffsets[0] + index });
    }

    // Outer satellite nodes orbiting beyond the 3rd ring
    const satelliteCount = Math.max(8, Math.round(w / 180));
    for (let index = 0; index < satelliteCount; index += 1) {
      const angle = (index / satelliteCount) * Math.PI * 2 + 0.22;
      const anchorX = centerX + Math.cos(angle) * (span * 0.74);
      const anchorY = centerY + Math.sin(angle) * (span * 0.62);
      const satelliteIndex = nodes.length;
      nodes.push({
        x: anchorX,
        y: anchorY,
        anchorX,
        anchorY,
        vx: 0,
        vy: 0,
        phase: seeded(index + 117) * Math.PI * 2,
        ring: 3,
        radius: 1.4 + seeded(index + 149) * 1.5,
      });
      edges.push({
        a: satelliteIndex,
        b: ringOffsets[2] + Math.floor((index / satelliteCount) * ringSpecs[2].count) % ringSpecs[2].count,
      });
    }

    return { nodes, edges, rings };
  }

  let system = buildOrbitMesh(1, 1);
  let activeScene = 'ink';
  const currentPalette = clonePalette(palettes.ink);
  let targetPalette = clonePalette(palettes.ink);

  function updateScene() {
    const viewportCenter = window.innerHeight * 0.48;
    let nearestDistance = Number.POSITIVE_INFINITY;
    let nearestScene = 'ink';

    const sections = Array.from(document.querySelectorAll('[data-fellowship-scene]'));
    for (const section of sections) {
      const scene = section.dataset.fellowshipScene;
      if (scene !== 'ink' && scene !== 'paper') continue;
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        nearestScene = scene;
        break;
      }
      const distance = Math.min(Math.abs(rect.top - viewportCenter), Math.abs(rect.bottom - viewportCenter));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestScene = scene;
      }
    }

    if (nearestScene !== activeScene) {
      activeScene = nearestScene;
      targetPalette = clonePalette(palettes[activeScene]);
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    system = buildOrbitMesh(width, height);
    updateScene();
  }

  function onPointerMove(event) {
    if (reduceMotion || event.pointerType === 'touch') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = true;
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  }

  function clearPointer() {
    pointerActive = false;
  }

  function draw(time) {
    const elapsed = time * 0.001;
    const delta = lastTime ? clamp((time - lastTime) / 16.67, 0.5, 2) : 1;
    lastTime = time;

    approachColor(currentPalette.line, targetPalette.line);
    approachColor(currentPalette.node, targetPalette.node);
    approachColor(currentPalette.hot, targetPalette.hot);
    approachColor(currentPalette.glow, targetPalette.glow);

    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';

    if (!reduceMotion) {
      for (const node of system.nodes) {
        const drift = 5 + Math.max(node.ring, 0) * 3;
        const targetX = node.anchorX + Math.cos(elapsed * (0.22 + node.ring * 0.02) + node.phase) * drift;
        const targetY = node.anchorY + Math.sin(elapsed * (0.18 + node.ring * 0.018) + node.phase) * drift;
        node.vx += (targetX - node.x) * 0.006 * delta;
        node.vy += (targetY - node.y) * 0.006 * delta;

        if (pointerActive) {
          const dx = node.x - pointerX;
          const dy = node.y - pointerY;
          const distance = Math.max(1, Math.hypot(dx, dy));
          if (distance < 220) {
            const force = (1 - distance / 220) * 0.72;
            node.vx += (dx / distance) * force * delta;
            node.vy += (dy / distance) * force * delta;
          }
        }

        node.vx *= 0.91;
        node.vy *= 0.91;
        node.x += node.vx * delta;
        node.y += node.vy * delta;
      }
    }

    // Reactive Radial Spotlight on Pointer
    if (pointerActive && !reduceMotion) {
      const glow = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, 240);
      glow.addColorStop(0, rgba(currentPalette.glow, 0.2));
      glow.addColorStop(0.38, rgba(currentPalette.glow, 0.07));
      glow.addColorStop(1, rgba(currentPalette.glow, 0));
      context.save();
      context.globalCompositeOperation = 'screen';
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.restore();
    }

    // Concentric Dashed Orbital Rings
    for (const ring of system.rings) {
      context.save();
      context.beginPath();
      context.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, ring.rotation + Math.sin(elapsed * 0.12 + ring.phase) * 0.025, 0, Math.PI * 2);
      context.setLineDash([2, 14]);
      context.lineWidth = 0.7;
      context.strokeStyle = rgba(currentPalette.line, 0.12);
      context.stroke();
      context.restore();
    }

    // Interconnecting Lattice Edges with Dynamic Proximity Heatmap
    for (const edge of system.edges) {
      const a = system.nodes[edge.a];
      const b = system.nodes[edge.b];
      const midpointX = (a.x + b.x) / 2;
      const midpointY = (a.y + b.y) / 2;
      const pointerDistance = pointerActive ? Math.hypot(midpointX - pointerX, midpointY - pointerY) : Number.POSITIVE_INFINITY;
      const proximity = clamp(1 - pointerDistance / 220, 0, 1);
      const lineColor = mixColor(currentPalette.line, currentPalette.hot, proximity * 0.9);
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.lineWidth = 0.6 + proximity * 1.2;
      context.strokeStyle = rgba(lineColor, 0.12 + proximity * 0.32);
      context.stroke();
    }

    // Orbital Nodes with Dynamic Halo Glow & Size Expansion
    for (const node of system.nodes) {
      const pointerDistance = pointerActive ? Math.hypot(node.x - pointerX, node.y - pointerY) : Number.POSITIVE_INFINITY;
      const proximity = clamp(1 - pointerDistance / 220, 0, 1);
      const nodeColor = mixColor(currentPalette.node, currentPalette.hot, proximity);
      context.save();
      if (proximity > 0) {
        context.shadowColor = rgba(currentPalette.hot, proximity * 0.72);
        context.shadowBlur = proximity * 14;
      }
      context.beginPath();
      context.arc(node.x, node.y, node.radius + proximity * 3.2, 0, Math.PI * 2);
      context.fillStyle = rgba(nodeColor, 0.35 + proximity * 0.55);
      context.fill();
      context.restore();
    }

    frame = window.requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateScene, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', clearPointer);
  window.addEventListener('blur', clearPointer);
  frame = window.requestAnimationFrame(draw);
}

/* ==========================================================================
   2. REAL-TIME COUNTDOWN TIMER
   Target: October 26, 2026, 10:00:00 (Ecuador UTC-5)
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-10-26T09:00:00-05:00').getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. BILINGUAL i18n ENGINE (ES / EN)
   ========================================================================== */
const I18N_DICTIONARY = {
  es: {
    // Nav & Top Bar
    'top-notice': 'IEEE Nanotechnology Council · Distinguished Lecturer Program & Frontier Summit · 26–27 Oct 2026',
    'nav-about': 'Acerca de',
    'nav-speakers': 'Ponentes',
    'nav-schedule': 'Agenda',
    'nav-lodging': 'Hospedaje',
    'nav-venue': 'Sede Yachay',
    'nav-register': 'Inscribirse',
    'cta-register': 'Inscribirse Ahora',

    // Hero
    'hero-eyebrow': 'IEEE NTC · Distinguished Lecturer Program & Frontier Summit',
    'hero-title-main': 'NANOBRIDGE YT 2026',
    'hero-title-sub': 'De la Nanociencia a Implantes Biomédicos y Sociedades de IA.',
    'hero-tagline': 'La primera cumbre internacional de nanotecnología e inteligencia artificial en la Ciudad del Conocimiento Yachay.',
    'hero-desc': 'Dos jornadas presenciales e híbridas con el Dr. José Miguel García-Martín (CSIC, Nanostine, IEEE NTC Distinguished Lecturer), el MSc. Simon Heilles (Lead AI Architect en DENEM Labs) y destacados investigadores en la Universidad Yachay Tech.',
    'hero-btn-register': 'Inscribirse al Evento',
    'hero-btn-schedule': 'Ver Cronograma Completo',
    'hero-meta-dates-label': 'Fechas Oficiales',
    'hero-meta-dates-val': '26 y 27 de Octubre, 2026',
    'hero-meta-dates-sub': 'Lunes y Martes · Horario Completo',
    'hero-meta-venue-label': 'Sede Presencial',
    'hero-meta-venue-val': 'Universidad Yachay Tech',
    'hero-meta-venue-sub': 'Urcuquí, Imbabura, Ecuador',
    'hero-meta-mode-label': 'Modalidad',
    'hero-meta-mode-val': 'Híbrida (Presencial & Streaming)',
    'hero-meta-mode-sub': 'Certificación Oficial IEEE NTC',
    'countdown-title': 'La cumbre inicia en',
    'count-unit-days': 'Días',
    'count-unit-hours': 'Horas',
    'count-unit-mins': 'Min',
    'count-unit-secs': 'Seg',

    // Allies & Partners
    'partners-eyebrow': 'Instituciones Convocantes & Alianzas Académicas Internacionales',

    // About & Pillars
    'about-eyebrow': 'Misión & Fundamentos',
    'about-title': 'Ciencia de frontera construida desde los cimientos.',
    'about-lead': 'El IEEE Nanotechnology Council Student Branch Chapter de Yachay Tech organiza este encuentro para consolidar la primera generación de ingenieros en nanotecnología del Ecuador con la vanguardia internacional en materiales avanzados, inteligencia artificial y biotecnología.',
    'pillar-1-title': 'Películas Delgadas y Sputtering',
    'pillar-1-desc': 'Física fundamental de deposición por magnetron sputtering en ángulo oblicuo (OAD/GLAD) y crecimiento de nanoestructuras columnares.',
    'pillar-2-title': 'Superficies Antibacterianas',
    'pillar-2-desc': 'Prevención pasiva de biopelículas en implantes ortopédicos de titanio grado médico sin uso de agentes antibióticos.',
    'pillar-3-title': 'Laboratorios Autónomos de IA',
    'pillar-3-desc': 'Sistemas multi-agente para experimentación física en bucle cerrado (closed-loop) y dinámicas sociales de agentes de IA en ciencia biomédica.',
    'pillar-4-title': 'Deep-Tech & Transferencia',
    'pillar-4-desc': 'Del laboratorio académico a la spin-off: La experiencia de Nanostine escalando patentes hacia soluciones industriales reales.',

    // Speakers Section
    'speakers-eyebrow': 'Liderazgo Científico & Conferencias',
    'speakers-title': 'Conferencistas & Comité Científico',
    'speakers-lead': 'Científicos e innovadores de referencia internacional reunidos en Yachay Tech para conectar la investigación de frontera en materiales avanzados, inteligencia artificial biomédica y transferencia tecnológica con la primera generación de ingenieros en nanotecnología.',
    'speaker-abstract-btn': 'Ver Abstract de Charla',
    'badge-in-person': 'Presencial',
    'badge-virtual': 'Virtual',

    // Schedule Section
    'schedule-eyebrow': 'Programa Cronológico',
    'schedule-title': 'Agenda de 2 Días',
    'schedule-lead': 'Sesiones técnicas, conferencias plenarias, intermedios artísticos y talleres prácticos estructurados para estudiantes e investigadores.',
    'tab-day-1': 'Día 1 · Lunes 26 Oct',
    'tab-day-2': 'Día 2 · Martes 27 Oct',

    // Lodging Section
    'lodging-eyebrow': 'Logística & Alojamiento',
    'lodging-title': 'Tarifas y Opciones de Hospedaje en Urcuquí',
    'lodging-lead': 'Tarifas oficiales por persona y paquetes sugeridos de alojamiento para asistentes y delegaciones durante NANOBRIDGE YT 2026.',
    'lodging-th-hotel': 'Hotel / Hostal',
    'lodging-th-modality': 'Modalidad de Habitación',
    'lodging-th-rate': 'Tarifa / Noche (por pers.)',
    'lodging-th-cost-2': 'Estadía 2 Noches (por pers.)',
    'lodging-th-cost-3': 'Estadía 3 Noches (por pers.)',
    'lodging-th-status': 'Ubicación & Referencia',

    // Venue Section
    'venue-eyebrow': 'Sede del Evento',
    'venue-title': 'Universidad Yachay Tech',
    'venue-lead': 'Ubicada en la Ciudad del Conocimiento en Urcuquí, Imbabura. Primera universidad de investigación intensiva del Ecuador con laboratorios de vanguardia.',
    'venue-map-eyebrow': 'Localización Satelital & Georreferencia',
    'venue-map-title': 'Mapa Interactivo del Campus Yachay Tech',
    'venue-map-sub': 'Hacienda San José, San Miguel de Urcuquí, Imbabura, Ecuador · Coordenadas: 0°24\'16.4"N 78°10\'29.5"W',
    'btn-gmaps-link': 'Abrir en Google Maps',

    // Registration Box
    'reg-eyebrow': 'Inscripciones Abiertas',
    'reg-title': 'Asegura tu lugar en NANOBRIDGE YT 2026',
    'reg-desc': 'Participa de manera presencial en el campus de Yachay Tech o conéctate virtualmente a las transmisiones internacionales vía IEEE vTools. Se emitirá certificado con aval de IEEE Nanotechnology Council.',
    'timeline-btn-workshop': 'Inscribirse al Workshop',
    'reg-perk-1': 'Acceso a todas las plenarias técnicas y conferencias magistrales',
    'reg-perk-2': 'Participación en el NanoSkills Workshop práctico y sesión de posters',
    'reg-perk-3': 'Certificado oficial avalado por IEEE NTC Student Branch y ponentes internacionales',
    'reg-btn-main': 'Registro Oficial (Universidades & Externos)',
    'reg-btn-workshop': 'Inscripción Workshop Práctico & Posters',
    'reg-btn-cal': 'Google Calendar',
    'reg-btn-ics': 'Descargar iCal (.ics)'
  },
  en: {
    // Nav & Top Bar
    'top-notice': 'IEEE Nanotechnology Council · Distinguished Lecturer Program & Frontier Summit · Oct 26–27, 2026',
    'nav-about': 'About',
    'nav-speakers': 'Speakers',
    'nav-schedule': 'Schedule',
    'nav-lodging': 'Lodging',
    'nav-venue': 'Venue',
    'nav-register': 'Register',
    'cta-register': 'Register Now',

    // Hero
    'hero-eyebrow': 'IEEE NTC · Distinguished Lecturer Program & Frontier Summit',
    'hero-title-main': 'NANOBRIDGE YT 2026',
    'hero-title-sub': 'From Nanoscience to Biomedical Implants & Societies of AI Agents.',
    'hero-tagline': 'The premier international summit bridging nanotechnology and artificial intelligence at Yachay City of Knowledge.',
    'hero-desc': 'Two in-person and hybrid conference days featuring Dr. José Miguel García-Martín (CSIC, Nanostine, IEEE NTC Distinguished Lecturer), MSc. Simon Heilles (Lead AI Architect at DENEM Labs), and prominent researchers at Yachay Tech University.',
    'hero-btn-register': 'Register for Summit',
    'hero-btn-schedule': 'View Full Schedule',
    'hero-meta-dates-label': 'Official Dates',
    'hero-meta-dates-val': 'October 26 & 27, 2026',
    'hero-meta-dates-sub': 'Monday & Tuesday · Full Day Sessions',
    'hero-meta-venue-label': 'On-Site Venue',
    'hero-meta-venue-val': 'Yachay Tech University',
    'hero-meta-venue-sub': 'Urcuquí, Imbabura, Ecuador',
    'hero-meta-mode-label': 'Modality',
    'hero-meta-mode-val': 'Hybrid (In-Person & Live Stream)',
    'hero-meta-mode-sub': 'Official IEEE NTC Certification',
    'countdown-title': 'The summit begins in',
    'count-unit-days': 'Days',
    'count-unit-hours': 'Hours',
    'count-unit-mins': 'Mins',
    'count-unit-secs': 'Secs',

    // Allies & Partners
    'partners-eyebrow': 'Convening Institutions & Global Academic Alliances',

    // About & Pillars
    'about-eyebrow': 'Mission & Fundamentals',
    'about-title': 'Frontier science built from the ground up.',
    'about-lead': 'Organized by the IEEE Nanotechnology Council Student Branch Chapter at Yachay Tech to bridge Ecuador’s pioneering generation of nanotechnology engineers with international leaders in materials science, AI, and biotechnology.',
    'pillar-1-title': 'Thin Films & Sputtering',
    'pillar-1-desc': 'Fundamental physics of magnetron sputtering at oblique angle deposition (OAD/GLAD) and columnar nanostructure synthesis.',
    'pillar-2-title': 'Antibacterial Surfaces',
    'pillar-2-desc': 'Passive biofilm prevention on medical-grade titanium orthopedic implants without relying on antibiotic chemical agents.',
    'pillar-3-title': 'Autonomous AI Laboratories',
    'pillar-3-desc': 'Closed-loop multi-agent systems for physical experimentation and emergent social dynamics of AI agents in biomedical science.',
    'pillar-4-title': 'Deep-Tech & Translation',
    'pillar-4-desc': 'From academic labs to commercial spin-offs: Nanostine’s journey translating scientific patents into industrial market solutions.',

    // Speakers Section
    'speakers-eyebrow': 'Scientific Leadership & Keynotes',
    'speakers-title': 'Distinguished Speakers & Committee',
    'speakers-lead': 'International scientific leaders gathered at Yachay Tech to bridge frontier research in advanced materials, biomedical AI, and technology transfer with the region’s pioneer generation of nano-engineers.',
    'speaker-abstract-btn': 'View Talk Abstract',
    'badge-in-person': 'In-Person',
    'badge-virtual': 'Virtual',

    // Schedule Section
    'schedule-eyebrow': 'Chronological Program',
    'schedule-title': '2-Day Agenda',
    'schedule-lead': 'Technical sessions, keynote lectures, artistic interludes, and certified hands-on workshops tailored for students and researchers.',
    'tab-day-1': 'Day 1 · Mon Oct 26',
    'tab-day-2': 'Day 2 · Tue Oct 27',

    // Lodging Section
    'lodging-eyebrow': 'Logistics & Accommodation',
    'lodging-title': 'Lodging Rates and Options in Urcuquí',
    'lodging-lead': 'Official per-person rates and suggested accommodation packages for attendees and delegations during NANOBRIDGE YT 2026.',
    'lodging-th-hotel': 'Hotel / Inn',
    'lodging-th-modality': 'Room Modality',
    'lodging-th-rate': 'Rate / Night (per person)',
    'lodging-th-cost-2': '2 Nights Total (per person)',
    'lodging-th-cost-3': '3 Nights Total (per person)',
    'lodging-th-status': 'Location & Reference',

    // Venue Section
    'venue-eyebrow': 'Official Venue',
    'venue-title': 'Yachay Tech University',
    'venue-lead': 'Located within the Knowledge City in Urcuquí, Imbabura. Ecuador’s premier research-intensive experimental university equipped with advanced cleanroom laboratories.',
    'venue-map-eyebrow': 'Satellite Location & Georeference',
    'venue-map-title': 'Interactive Yachay Tech Campus Map',
    'venue-map-sub': 'Hacienda San José, San Miguel de Urcuquí, Imbabura, Ecuador · Coordinates: 0°24\'16.4"N 78°10\'29.5"W',
    'btn-gmaps-link': 'Open in Google Maps',

    // Registration Box
    'reg-eyebrow': 'Registration Open',
    'reg-title': 'Secure your seat at NANOBRIDGE YT 2026',
    'reg-desc': 'Join us in-person at Yachay Tech campus or attend virtually via global IEEE vTools streams. Certified attendance granted by IEEE Nanotechnology Council.',
    'timeline-btn-workshop': 'Register for Workshop',
    'reg-perk-1': 'Access to all keynote plenaries and technical sessions',
    'reg-perk-2': 'Hands-on participation in the NanoSkills Workshop & Poster session',
    'reg-perk-3': 'Official certificate endorsed by IEEE NTC Student Branch and international keynote speakers',
    'reg-btn-main': 'Official Registration (Universities & Attendees)',
    'reg-btn-workshop': 'Register for Hands-on Workshop & Posters',
    'reg-btn-cal': 'Google Calendar',
    'reg-btn-ics': 'Download iCal (.ics)'
  }
};

let currentLang = 'es';

function initI18n() {
  const saved = localStorage.getItem('nanobridge_lang');
  if (saved && (saved === 'es' || saved === 'en')) {
    currentLang = saved;
  }

  updatePageLanguage(currentLang);

  const btnEs = document.getElementById('lang-btn-es');
  const btnEn = document.getElementById('lang-btn-en');

  if (btnEs) {
    btnEs.addEventListener('click', () => {
      setLanguage('es');
    });
  }
  if (btnEn) {
    btnEn.addEventListener('click', () => {
      setLanguage('en');
    });
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('nanobridge_lang', lang);
  updatePageLanguage(lang);
}

function updatePageLanguage(lang) {
  const btnEs = document.getElementById('lang-btn-es');
  const btnEn = document.getElementById('lang-btn-en');
  if (btnEs && btnEn) {
    btnEs.classList.toggle('active', lang === 'es');
    btnEn.classList.toggle('active', lang === 'en');
  }

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (I18N_DICTIONARY[lang] && I18N_DICTIONARY[lang][key]) {
      el.textContent = I18N_DICTIONARY[lang][key];
    }
  });

  document.documentElement.lang = lang;
}

/* ==========================================================================
   4. INTERACTIVE SCHEDULE TABS & ABSTRACT ACCORDION
   ========================================================================== */
function initScheduleTabs() {
  const tabBtns = document.querySelectorAll('.schedule-tab-btn');
  const panels = document.querySelectorAll('.schedule-content-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetDay = btn.getAttribute('data-day');

      tabBtns.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`schedule-day-${targetDay}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // Expandable abstracts inside schedule timeline
  const abstractToggles = document.querySelectorAll('.btn-toggle-abstract');
  abstractToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const entry = toggle.closest('.timeline-entry');
      const abstractContent = entry.querySelector('.timeline-expandable-abstract');
      if (abstractContent) {
        abstractContent.classList.toggle('expanded');
        const isExp = abstractContent.classList.contains('expanded');
        toggle.textContent = isExp
          ? (currentLang === 'es' ? 'Ocultar Resumen' : 'Hide Summary')
          : (currentLang === 'es' ? 'Ver Resumen' : 'View Summary');
      }
    });
  });
}

/* ==========================================================================
   5. LODGING DETAILED ROOM ACCORDION
   ========================================================================== */
function initLodgingAccordion() {
  const toggleBtn = document.getElementById('toggle-room-breakdown');
  const content = document.getElementById('room-breakdown-content');

  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', () => {
      content.classList.toggle('expanded');
      const isExpanded = content.classList.contains('expanded');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
      const icon = toggleBtn.querySelector('.accordion-arrow-icon');
      if (icon) {
        icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }
}

/* ==========================================================================
   6. ABSTRACT MODAL SYSTEM
   ========================================================================== */
const SPEAKERS_DATA = {
  'garcia-martin': {
    name: 'Dr. José Miguel García-Martín',
    affiliation: 'IMN-CNM, CSIC (Madrid, España) · Co-Fundador de Nanostine S.L. · IEEE NTC Distinguished Lecturer',
    talk1: {
      day: 'Día 1 (26 Oct) · 09:00 - 10:30',
      title: 'Nanostructured Columnar Thin Films and Antibacterial Surfaces: From Sputtering Physics to Biomedical Implants',
      abstract: 'Revisión exhaustiva de los fundamentos de síntesis de películas delgadas columnares nanoestructuradas mediante pulverización catódica (magnetron sputtering) en incidencia oblicua (OAD/GLAD). Se analizan sus propiedades mecánicas, ópticas y su capacidad antibacteriana pasiva: reducción crítica de adhesión bacteriana y prevención de biopelículas en implantes de titanio grado médico sin uso de agentes químicos antibióticos.'
    },
    talk2: {
      day: 'Día 2 (27 Oct) · 09:00 - 10:30',
      title: 'From the Academic Laboratory to Deep-Tech Spin-Offs: The Nanostine Journey',
      abstract: 'Conferencia orientada a investigadores, posgraduados y estudiantes sobre transferencia tecnológica, valorización de propiedad intelectual y el camino de creación de empresas de base tecnológica (spin-offs) a partir de patentes científicas en nanociencia, detallando el modelo de negocio y escalamiento de Nanostine.'
    }
  },
  'simon-heilles': {
    name: 'MSc. Simon Heilles',
    affiliation: 'DENEM Labs · Lead AI Systems Architect & Machine Learning Researcher',
    talk1: {
      day: 'Día 1 (26 Oct) · 11:30 - 13:00',
      title: 'Autonomous Nanotechnology Laboratory: AI agents for closed-loop physical experimentation and scientific discovery',
      abstract: 'Exploración de arquitecturas de agentes de inteligencia artificial que trascienden el mero análisis de datos para transformarse en participantes activos de la experimentación científica. El laboratorio se concibe como un sistema en bucle cerrado: objetivo científico → hipótesis → diseño experimental → simulación digital twin → experimentación física → medición y caracterización → análisis → siguiente iteración.'
    },
    talk2: {
      day: 'Día 2 (27 Oct) · 11:30 - 13:00',
      title: 'Societies of AI Agents: Measuring influence, reputation, and emergent social behavior between autonomous agents',
      abstract: 'A medida que los agentes de IA se comunican, delegan, negocian y transfieren información, la unidad de estudio relevante pasa a ser la sociedad de agentes. Se propone una agenda de investigación empírica inspirada en la psicología social y la ciencia de redes para medir influencia, reputación, conformidad y cascadas de información.'
    }
  },
  'edwin-valarezo': {
    name: 'Dr. Edwin Valarezo',
    affiliation: 'Presidente de IEEE EMBS (Engineering in Medicine and Biology Society) - Sección Ecuador',
    talk1: {
      day: 'Día 2 (27 Oct) · 10:30 - 11:00 (Virtual)',
      title: 'Fronteras en Ingeniería Biomédica y Ecosistema de Salud en Ecuador',
      abstract: 'Panorama estratégico sobre la convergencia de dispositivos biomédicos, sensores nanotecnológicos y sistemas de salud pública en el contexto ecuatoriano y latinoamericano.'
    }
  },
  'jose-torres': {
    name: 'Dr. José Torres',
    affiliation: 'Investigador Postdoctoral en Nanotecnología Aplicada (Alemania)',
    talk1: {
      day: 'Día 1 (26 Oct) · 10:30 - 11:00 (Virtual)',
      title: 'Avances Internacionales en Caracterización y Métodos Avanzados en Nanociencia',
      abstract: 'Técnicas avanzadas de caracterización a escala nanométrica en centros de investigación europeos y su articulación con proyectos experimentales de la región andina.'
    }
  },
  'carlos-reinoso': {
    name: 'Dr. Carlos Reinoso',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    talk1: {
      day: 'Día 1 (26 Oct) · 15:30 - 16:30 (Presencial)',
      title: 'Líneas de Investigación en Nanomateriales y Fabricación Local',
      abstract: 'Desarrollo de capacidades experimentales en Yachay Tech, líneas estratégicas de síntesis de nanomateriales y soluciones diseñadas para las problemáticas industriales y ambientales del Ecuador.'
    }
  },
  'edwin-chimborazo': {
    name: 'Dr. Edwin Chimborazo',
    affiliation: 'Investigador en Nanociencia y Fabricación',
    talk1: {
      day: 'Día 1 (26 Oct) · 14:30 - 15:30 (Presencial)',
      title: 'Desarrollo de Nanotecnología y Aplicaciones Regionales',
      abstract: 'Experiencias de modelado y aplicación práctica de nanotecnología en el sector productivo y académico regional.'
    }
  },
  'andrei-mereshchenko': {
    name: 'Dr. Andrei Mereshchenko',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 14:30 - 15:30 (Presencial)',
      title: 'Fotoquímica, Luminiscencia y Dinámica Ultrarrápida en Nanomateriales',
      abstract: 'Estudio de la dinámica de excitones en nanocompuestos coloidales, fotofísica de complejos metálicos y aplicaciones en sensores espectroscópicos avanzados, respaldado por más de 1900 citas y un índice h de 24.'
    }
  },
  'benjamin-pusay': {
    name: 'Ing. Benjamín Pusay',
    affiliation: 'Investigador en Materiales Avanzados, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 17:00 - 18:00 (Presencial)',
      title: 'Innovación en Materiales Nanoestructurados para Aplicaciones Energéticas',
      abstract: 'Avances recientes en síntesis y modelado de materiales avanzados con impacto en remediación y sustentabilidad.'
    }
  },
  'maria-fernanda-bosquez': {
    name: 'MSc. María Fernanda Bósquez',
    affiliation: 'Química & Investigadora, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 16:00 - 17:00 (Presencial)',
      title: 'Electrolitos Poliméricos Nanoestructurados e Hidrogeles para Baterías de Zinc-Aire y Almacenamiento Sostenible',
      abstract: 'Desarrollo de electrolitos biopoliméricos nanocompuestos (quitosano-almidón) e hidrogeles con nano-diamantes para sistemas de almacenamiento de energía renovable de alto rendimiento y bajo impacto ambiental.'
    }
  }
};

function initAbstractModal() {
  const modal = document.getElementById('abstract-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const openBtns = document.querySelectorAll('.btn-speaker-abstract');

  if (!modal || !closeBtn) return;

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const speakerId = btn.getAttribute('data-speaker');
      const data = SPEAKERS_DATA[speakerId];
      if (!data) return;

      document.getElementById('modal-speaker-name').textContent = data.name;
      document.getElementById('modal-affiliation').textContent = data.affiliation;

      let talksHtml = `
        <div style="margin-bottom: 18px;">
          <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.1em;">${data.talk1.day}</span>
          <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: #0f172a; margin: 4px 0 8px;">${data.talk1.title}</h4>
          <p style="font-size: 13.5px; line-height: 1.65; color: #475569;">${data.talk1.abstract}</p>
        </div>
      `;

      if (data.talk2) {
        talksHtml += `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 14px;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.1em;">${data.talk2.day}</span>
            <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: #0f172a; margin: 4px 0 8px;">${data.talk2.title}</h4>
            <p style="font-size: 13.5px; line-height: 1.65; color: #475569;">${data.talk2.abstract}</p>
          </div>
        `;
      }

      document.getElementById('modal-talk-container').innerHTML = talksHtml;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   7. CALENDAR SYNC (Google Calendar & .ics download)
   ========================================================================== */
function initCalendarSync() {
  const gcalBtn = document.getElementById('btn-gcal-sync');
  const icsBtn = document.getElementById('btn-ics-sync');

  if (gcalBtn) {
    gcalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = encodeURIComponent('NANOBRIDGE YT 2026: IEEE NTC Distinguished Lecturer Program & Summit');
      const details = encodeURIComponent(
        'IEEE Nanotechnology Council Distinguished Lecturer Program & Frontier Summit con el Dr. José Miguel García-Martín (CSIC) y el MSc. Simon Heilles (DENEM Labs) en Yachay Tech University.'
      );
      const location = encodeURIComponent('Universidad Yachay Tech, Urcuquí, Imbabura, Ecuador');
      // Starts 2026-10-26 09:00 ECT (14:00 UTC) to 2026-10-27 18:30 ECT (23:30 UTC)
      const dates = '20261026T140000Z/20261027T233000Z';
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank');
    });
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcsFile();
    });
  }
}

function downloadIcsFile() {
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IEEE Nanotechnology Council//NANOBRIDGE YT 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:nanobridge-yt-2026@ieee-ntc-yachay',
    'DTSTAMP:20261012T200000Z',
    'DTSTART:20261026T140000Z',
    'DTEND:20261027T233000Z',
    'SUMMARY:NANOBRIDGE YT 2026 · IEEE NTC Distinguished Lecturer Program & Frontier Summit',
    'DESCRIPTION:Cumbre científica con Dr. José Miguel García-Martín (CSIC / IEEE DL) y MSc. Simon Heilles (DENEM Labs) en Yachay Tech.',
    'LOCATION:Universidad Yachay Tech, Urcuquí, Imbabura, Ecuador',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'NANOBRIDGE-YT-2026.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   8. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('mobile-hamburger');
  const drawer = document.getElementById('mobile-nav-drawer');

  if (!hamburger || !drawer) return;

  hamburger.addEventListener('click', () => {
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  const links = drawer.querySelectorAll('.nav-link');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  });
}
