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
  "es": {
    "top-notice": "IEEE Nanotechnology Council · Distinguished Lecturer Program & Frontier Summit · 26–27 Oct 2026",
    "nav-about": "Acerca de",
    "nav-speakers": "Ponentes",
    "nav-schedule": "Agenda",
    "nav-lodging": "Hospedaje",
    "nav-venue": "Sede Yachay",
    "nav-register": "Inscribirse",
    "cta-register": "Inscribirse Ahora",
    "hero-eyebrow": "IEEE NTC · Distinguished Lecturer Program & Frontier Summit",
    "hero-title-main": "NANOBRIDGE YT 2026",
    "hero-title-sub": "De la Nanociencia a Implantes Biomédicos y Sociedades de IA.",
    "hero-tagline": "La primera cumbre internacional de nanotecnología e inteligencia artificial en la Ciudad del Conocimiento Yachay.",
    "hero-btn-register": "Inscribirse al Evento",
    "hero-btn-schedule": "Ver Cronograma Completo",
    "hero-meta-dates-label": "Fechas Oficiales",
    "hero-meta-dates-val": "26 y 27 de Octubre, 2026",
    "hero-meta-dates-sub": "Lunes y Martes · Horario Completo",
    "hero-meta-venue-label": "Sede Presencial",
    "hero-meta-venue-val": "Universidad Yachay Tech",
    "hero-meta-venue-sub": "Urcuquí, Imbabura, Ecuador",
    "hero-meta-mode-label": "Modalidad",
    "hero-meta-mode-val": "Híbrida (Presencial & Streaming)",
    "hero-meta-mode-sub": "Certificación Oficial IEEE NTC",
    "countdown-title": "La cumbre inicia en",
    "count-unit-days": "Días",
    "count-unit-hours": "Horas",
    "count-unit-mins": "Min",
    "count-unit-secs": "Seg",
    "partners-eyebrow": "Instituciones Convocantes & Alianzas Académicas Internacionales",
    "about-eyebrow": "Misión & Fundamentos",
    "about-title": "Ciencia de frontera construida desde los cimientos.",
    "about-lead": "El IEEE Nanotechnology Council Student Branch Chapter de Yachay Tech organiza este encuentro para consolidar la primera generación de ingenieros en nanotecnología del Ecuador con la vanguardia internacional en materiales avanzados, inteligencia artificial y biotecnología.",
    "pillar-1-title": "Películas Delgadas y Sputtering",
    "pillar-1-desc": "Física fundamental de deposición por magnetron sputtering en ángulo oblicuo (OAD/GLAD) y crecimiento de nanoestructuras columnares.",
    "pillar-2-title": "Superficies Antibacterianas",
    "pillar-2-desc": "Prevención pasiva de biopelículas en implantes ortopédicos de titanio grado médico sin uso de agentes antibióticos.",
    "pillar-3-title": "Laboratorios Autónomos de IA",
    "pillar-3-desc": "Sistemas multi-agente para experimentación física en bucle cerrado (closed-loop) y dinámicas sociales de agentes de IA en ciencia biomédica.",
    "pillar-4-title": "Deep-Tech & Transferencia",
    "pillar-4-desc": "Del laboratorio académico a la spin-off: La experiencia de Nanostine escalando patentes hacia soluciones industriales reales.",
    "pillar-cat-1": "Materiales Avanzados",
    "pillar-cat-2": "Salud & Biomedicina",
    "pillar-cat-3": "Inteligencia Artificial",
    "pillar-cat-4": "Innovación & Spin-Offs",
    "pillar-foot-2": "Biomateriales",
    "speakers-eyebrow": "Liderazgo Científico & Conferencias",
    "speakers-title": "Conferencistas & Comité Científico",
    "speakers-lead": "Científicos e innovadores de referencia internacional reunidos en Yachay Tech para conectar la investigación de frontera en materiales avanzados, inteligencia artificial biomédica y transferencia tecnológica con la primera generación de ingenieros en nanotecnología.",
    "speaker-abstract-btn": "Ver Abstract de Charla",
    "badge-in-person": "Presencial",
    "badge-virtual": "Virtual",
    "sp-role-1": "CSIC · Nanostine",
    "sp-affil-1": "IEEE NTC Distinguished Lecturer",
    "sp-bio-1": "Investigador Científico en el Instituto de Micro y Nanotecnología (IMN-CNM, CSIC, Madrid). Co-fundador de Nanostine S.L. Pionero en recubrimientos nanoestructurados columnares de titanio con propiedades antibacterianas pasivas.",
    "sp-talk-day-1-1": "Día 1 (26 Oct) · 09:00 - 10:30",
    "sp-talk-title-1-1": "Nanostructured columnar thin films by magnetron sputtering: From fundamentals to devices",
    "sp-talk-day-1-2": "Día 2 (27 Oct) · 09:00 - 10:30",
    "sp-talk-title-1-2": "Nanomateriales para Biomedicina",
    "sp-role-2": "DENEM Labs",
    "sp-affil-2": "Lead AI Systems Architect",
    "sp-bio-2": "Ingeniero de aprendizaje automático y arquitecto de sistemas de IA, fundador de DENEM Labs y especialista en laboratorios autónomos de experimentación física y sociedades de agentes de inteligencia artificial.",
    "sp-talk-day-2-1": "Día 1 (26 Oct) · 11:30 - 13:00",
    "sp-talk-title-2-1": "Autonomous Nanotechnology Laboratory: Closed-Loop AI",
    "sp-talk-day-2-2": "Día 2 (27 Oct) · 11:30 - 13:00",
    "sp-talk-title-2-2": "Societies of AI Agents: Influence, Reputation & Emergence",
    "sp-role-3": "IEEE EMBS Ecuador",
    "sp-affil-3": "Presidente de Sección",
    "sp-bio-3": "Líder en ingeniería biomédica y presidente de la sociedad IEEE EMBS en Ecuador. Impulsor de la integración de biosensores y tecnologías de instrumentación en el sistema de salud ecuatoriano.",
    "sp-talk-day-3-1": "Día 2 (27 Oct) · 10:30 - 11:00",
    "sp-talk-title-3-1": "Fronteras en Ingeniería Biomédica y Ecosistema de Salud en Ecuador",
    "sp-role-4": "Comunicaciones Moleculares & IoBNT",
    "sp-affil-4": "TU Berlin · Telecommunication Networks (Alemania)",
    "sp-bio-4": "Senior Researcher en el grupo de Telecommunication Networks (TKN) de la Technische Universität Berlin (TU Berlin, Alemania). Especialista internacional en comunicaciones moleculares, Internet de las Bio-Nano-Cosas (IoBNT), localización de nanosensores y modelado de redes nano-biomédicas.",
    "sp-talk-day-4-1": "Día 1 (26 Oct) · 10:30 - 11:00 (Virtual)",
    "sp-talk-title-4-1": "Programmability in the Chemical Domain using the Metabolic Network of Cells",
    "sp-role-5": "Nanomateriales & Fabricación",
    "sp-affil-5": "Yachay Tech · Ciencias Físicas y Nanotecnología",
    "sp-bio-5": "Docente-Investigador en la Escuela de Ciencias Físicas y Nanotecnología de Yachay Tech. Responsable de líneas estratégicas en desarrollo de nanomateriales y prototipado local.",
    "sp-talk-day-5-1": "Día 1 (26 Oct) · 15:30 - 16:30",
    "sp-talk-title-5-1": "Líneas de Investigación en Nanomateriales y Fabricación Local",
    "sp-role-6": "Nanociencia Aplicada",
    "sp-affil-6": "Yachay Tech · Síntesis & Nanoestructuras",
    "sp-bio-6": "Docente e investigador en la Escuela de Ciencias Físicas y Nanotecnología de Yachay Tech. Especialista en síntesis física y química de nanoestructuras, caracterización estructural y proyectos de transferencia tecnológica.",
    "sp-talk-day-6-1": "Día 2 (27 Oct) · 14:30 - 15:30",
    "sp-talk-title-6-1": "Desarrollo de Nanotecnología y Aplicaciones Regionales",
    "sp-role-7": "Nanotecnología & Fotoquímica",
    "sp-affil-7": "Yachay Tech · Ciencias Físicas y Nanotecnología",
    "sp-bio-7": "Docente e investigador en la Escuela de Ciencias Físicas y Nanotecnología de Yachay Tech. Especialista internacional en síntesis coloidal, fotoquímica ultrarrápida, luminiscencia, puntos cuánticos y nanomateriales funcionales.",
    "sp-talk-day-7-1": "Día 1 (26 Oct) · 14:30 - 15:30",
    "sp-talk-title-7-1": "Introduction to Nanotechnology",
    "sp-role-8": "Materiales Nanoestructurados",
    "sp-affil-8": "Yachay Tech · Almacenamiento & Electroquímica",
    "sp-bio-8": "Investigador en nanotecnología en la Escuela de Ciencias Físicas y Nanotecnología de Yachay Tech, centrado en caracterización de nuevos materiales, aplicaciones en almacenamiento y optimización de dispositivos electroquímicos.",
    "sp-talk-day-8-1": "Día 2 (27 Oct) · 15:30 - 16:00",
    "sp-talk-title-8-1": "Innovación en Materiales Nanoestructurados",
    "sp-role-9": "Supercapacitores & Nanomateriales",
    "sp-affil-9": "Yachay Tech · Ciencias Físicas y Nanotecnología",
    "sp-bio-9": "Química e investigadora en la Escuela de Ciencias Físicas y Nanotecnología de Yachay Tech. Especialista en síntesis de materiales carbonosos a partir de biopolímeros, funcionalización con nanopartículas de ZnO y supercapacitores electroquímicos.",
    "sp-talk-day-9-1": "Día 2 (27 Oct) · 16:00 - 16:30",
    "sp-talk-title-9-1": "Materiales carbonosos con ZnO para supercapacitores",
    "schedule-eyebrow": "Programa Cronológico",
    "schedule-title": "Agenda de 2 Días",
    "schedule-lead": "Sesiones técnicas, conferencias plenarias, intermedios artísticos y talleres prácticos estructurados para estudiantes e investigadores.",
    "tab-day-1": "Día 1 · Lunes 26 Oct",
    "tab-day-2": "Día 2 · Martes 27 Oct",
    "sched-tag-opening": "Apertura",
    "sched-tag-inperson": "Presencial",
    "sched-tag-inaugural": "Plenaria Inaugural",
    "sched-tag-ieeedl": "IEEE DL",
    "sched-tag-virtual": "Conferencia Virtual",
    "sched-tag-germany": "Alemania",
    "sched-tag-cultural": "Acto Cultural en Vivo",
    "sched-tag-auditorium": "Auditorio",
    "sched-tag-live": "En Vivo",
    "sched-tag-coffeebreak": "Coffee Break",
    "sched-tag-networking": "Networking",
    "sched-tag-plenary-ai": "Plenaria AI",
    "sched-tag-lunch": "Almuerzo / Lunch",
    "sched-tag-keynote": "Conferencia Magistral",
    "sched-tag-workshop": "NanoSkills Workshop",
    "sched-tag-certified": "Certificado",
    "sched-tag-posters": "Posters & Trabajos",
    "sched-tag-wrapup1": "Cierre Día 1",
    "sched-tag-day2": "Día 2",
    "sched-tag-translational": "Plenaria Biomédica",
    "sched-tag-deeptech": "Biomateriales",
    "sched-tag-musical": "Interludio Musical",
    "sched-tag-conf": "Conferencia",
    "sched-tag-awards": "Homenaje & Premiación",
    "sched-tag-runway": "Pasarela Cultural",
    "sched-tag-closing": "Clausura",
    "timeline-btn-view": "Ver Resumen",
    "timeline-btn-hide": "Ocultar Resumen",
    "timeline-btn-workshop": "Inscribirse al Workshop",
    "sched-d1-i1-title": "Acreditación, Registro & Bienvenida Institucional",
    "sched-d1-i1-sub": "Capítulo Estudiantil IEEE NTC & Autoridades de la Universidad Yachay Tech",
    "sched-d1-i2-title": "Nanostructured columnar thin films by magnetron sputtering: From fundamentals to devices",
    "sched-d1-i2-sub": "Dr. José Miguel García-Martín · Instituto de Micro y Nanotecnología (CSIC, Madrid)",
    "sched-d1-i2-abs": "Demostración de la deposición en ángulo rasante mediante magnetron sputtering como vía accesible y escalable para fabricar películas delgadas nanocolumnares (NCTF) de metales y óxidos metálicos en grandes áreas en un solo paso. Análisis de aplicaciones funcionales en energía y medio ambiente (nanopilares magnéticos, superficies auto-limpiantes, celdas de perovskita), biomedicina (recubrimientos antibacterianos en implantes ortopédicos, bioelectrodos, detección SERS y electroquímica) y aeroespacial (mitigación del efecto multipactor).",
    "sched-d1-i3-title": "Programmability in the Chemical Domain using the Metabolic Network of Cells",
    "sched-d1-i3-sub": "Dr. Jorge Torres Gómez · Senior Researcher en TU Berlin (Alemania)",
    "sched-d1-i3-abs": "Investigación inspirada en los mecanismos biológicos para ensamblar bloques de procesamiento de señales a partir de reacciones existentes en la red metabólica de la célula. Se presenta un pipeline que mapea motivos de redes de reacciones químicas abstractas sobre modelos metabólicos celulares, junto con un algoritmo que optimiza concentraciones enzimáticas para retardos y ganancias factibles. Aplicación directa en medicina de precisión para estimar distancias entre células tumorales e inmunitarias.",
    "sched-d1-i4-title": "Coffee Break de la Mañana & Estación de Café",
    "sched-d1-i4-sub": "Espacio de hidratación, café y diálogo previo a la Conferencia Magistral",
    "sched-d1-i5-title": "Autonomous Nanotechnology Laboratory: AI agents for closed-loop physical experimentation",
    "sched-d1-i5-sub": "MSc. Simon Heilles · Lead AI Architect en DENEM Labs",
    "sched-d1-i5-abs": "Arquitectura técnica para laboratorios científicos autónomos. Cómo los agentes de IA formulan hipótesis, controlan robots de síntesis química y aprenden dinámicamente de resultados experimentales en tiempo real.",
    "sched-d1-i6-title": "Almuerzo Libre & Sesión de Networking Académico",
    "sched-d1-i6-sub": "Receso oficial para almuerzo y vinculación técnica entre estudiantes, delegaciones y ponentes",
    "sched-d1-i7-title": "Introduction to Nanotechnology",
    "sched-d1-i7-sub": "Dr. Andrey Mereshchenko · Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech",
    "sched-d1-i7-abs": "Principios fundamentales de la ciencia a escala nanométrica, efectos cuánticos confinados y panorama general del impacto tecnológico de los nanomateriales en la física y química contemporáneas.",
    "sched-d1-i8-title": "Líneas de Investigación en Nanomateriales y Fabricación Local",
    "sched-d1-i8-sub": "Dr. Carlos Reinoso · Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech",
    "sched-d1-i8-abs": "Presentación de los proyectos pioneros en formulación y síntesis de nanomateriales en los laboratorios de Yachay Tech, explorando su aplicabilidad industrial y ambiental en el Ecuador.",
    "sched-d1-i9-title": "Workshop Práctico de Formación Especializada en Nanociencia & Posters",
    "sched-d1-i9-sub": "Sesión técnica interactiva para el desarrollo de competencias de posgrado, investigación aplicada y presentación de posters científicos",
    "sched-d1-i10-title": "Pasarela de Moda Científica & Cierre de la Primera Jornada",
    "sched-d1-i10-sub": "Colección vanguardista de nanotecnología y textil por diseñadora Wendy, síntesis de la jornada y conclusiones por Directiva IEEE NTC",
    "sched-d2-i1-title": "Apertura de la Segunda Jornada & Acreditación",
    "sched-d2-i1-sub": "Directiva del Capítulo Estudiantil IEEE NTC Yachay Tech",
    "sched-d2-i2-title": "Nanomateriales para Biomedicina",
    "sched-d2-i2-sub": "Dr. José Miguel García-Martín · Instituto de Micro y Nanotecnología (CSIC, Madrid)",
    "sched-d2-i2-abs": "Revisión integral sobre el diseño, síntesis y aplicación de nanomateriales funcionales en el ámbito biomédico y clínico. Avances en recubrimientos nanoestructurados columnares para implantes ortopédicos con propiedades antibacterianas pasivas sin antibióticos, interacción célula-material para optimizar la osteointegración, bioelectrodos para estimulación eléctrica y plataformas nanotecnológicas para biosensado molecular.",
    "sched-d2-i3-title": "Fronteras en Ingeniería Biomédica y Ecosistema de Salud en Ecuador",
    "sched-d2-i3-sub": "Dr. Edwin Valarezo · Presidente de IEEE EMBS Sección Ecuador",
    "sched-d2-i3-abs": "Desafíos y oportunidades en el diseño de dispositivos médicos locales, sensores basados en nanotecnología y articulación entre la academia y el sistema nacional de salud.",
    "sched-d2-i4-title": "Presentación Especial del Club de Danza Yachay Tech",
    "sched-d2-i4-sub": "Club de Danza Universitaria · Expresión coreográfica tradicional andina y contemporánea",
    "sched-d2-i5-title": "Coffee Break & Presentación de Piano en Vivo",
    "sched-d2-i5-sub": "Recital musical en vivo al piano (música clásica y fusión contemporánea) & estación de café en el Auditorio Principal",
    "sched-d2-i6-title": "Societies of AI Agents: Measuring influence, reputation, and emergent social behavior",
    "sched-d2-i6-sub": "MSc. Simon Heilles · Lead AI Architect (DENEM Labs)",
    "sched-d2-i6-abs": "Dinámicas sociales de agentes artificiales: mecanismos que generan confianza, reputación, conformidad y cascadas de información cuando los modelos de lenguaje interactúan entre sí en tareas complejas.",
    "sched-d2-i7-title": "Almuerzo Libre & Diálogo Abierto con Expositores",
    "sched-d2-i7-sub": "Receso oficial para almuerzo y espacio de vinculación informal en el campus",
    "sched-d2-i8-title": "Ceremonia Especial de Reconocimiento Institucional & Premiación",
    "sched-d2-i8-sub": "Reconocimiento a MSc. Simon Heilles, Dr. José Miguel García-Martín, ponentes invitados y premiación oficial a los ganadores del Workshop & Posters del Día 1",
    "sched-d2-i9-title": "Desarrollo de Nanotecnología y Aplicaciones Regionales",
    "sched-d2-i9-sub": "Dr. Jhonny Chimborazo · Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech",
    "sched-d2-i9-abs": "Metodologías de síntesis física y química de nanoestructuras, caracterización estructural y proyectos de transferencia tecnológica orientados al sector productivo regional.",
    "sched-d2-i10-title": "Innovación en Materiales Nanoestructurados para Aplicaciones Energéticas",
    "sched-d2-i10-sub": "Ing. Benjamín Pusay · Investigador en Materiales Avanzados, Yachay Tech",
    "sched-d2-i10-abs": "Nuevas rutas de síntesis de nanomateriales para almacenamiento energético y dispositivos electroquímicos de nueva generación.",
    "sched-d2-i11-title": "Materiales carbonosos derivados de carboximetilcelulosa cargados con nanopartículas de ZnO para supercapacitores, estudio de la correlación entre la estructura y el rendimiento.",
    "sched-d2-i11-sub": "MSc. María Fernanda Bósquez · Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech",
    "sched-d2-i11-abs": "Estudio sobre la síntesis y evaluación de materiales carbonosos derivados de biopolímeros (carboximetilcelulosa) funcionalizados con nanopartículas de óxido de zinc (ZnO) para su aplicación en supercapacitores electroquímicos, analizando en detalle la correlación directa entre la estructura nanométrica y el rendimiento de almacenamiento energético.",
    "sched-d2-i12-title": "Ceremonia de Clausura Oficial de la Cumbre & Entrega de Certificados",
    "sched-d2-i12-sub": "Clausura institucional por autoridades de la Universidad Yachay Tech, directiva del Capítulo Estudiantil IEEE NTC y entrega oficial de certificados de asistencia",
    "lodging-tag": "Alojamiento & Logística Oficial",
    "lodging-eyebrow": "Logística & Alojamiento",
    "lodging-title": "Comparativo Financiero de Hospedaje en Urcuquí",
    "lodging-lead": "Informe oficial consolidado de tarifas, capacidad hotelera y opciones de alojamiento para asistentes y delegaciones durante NANOBRIDGE YT 2026.",
    "lodging-th-option": "Opción",
    "lodging-th-hotel": "Establecimiento",
    "lodging-th-modality": "Modalidad de Habitación",
    "lodging-th-1n-ieee": "1 Noche · Miembro IEEE",
    "lodging-th-1n-gen": "1 Noche · No Miembro",
    "lodging-th-2n-ieee": "2 Noches · Miembro IEEE",
    "lodging-th-2n-gen": "2 Noches · No Miembro",
    "lodging-th-location": "Ubicación",
    "lodging-r1-mod": "<strong>Matrimonial:</strong> 2 personas comparten UNA cama",
    "lodging-r2-mod": "<strong>Matrimonial:</strong> 2 personas comparten UNA cama",
    "lodging-r3-mod": "<strong>Grupal Compartido:</strong> Cama individual propia; habitación compartida",
    "lodging-r4-mod": "<strong>Grupal Compartido:</strong> Cama 1½ propia; habitación compartida",
    "lodging-r5-mod": "<strong>Individual Privado:</strong> Cama 1½ propia; habitación privada",
    "lodging-r6-mod": "<strong>Cuarto Compartido:</strong> Cuarto compartido; cama por confirmar",
    "lodging-loc-suenos": "Urcuquí Centro",
    "lodging-loc-kampak": "Urcuquí Centro",
    "lodging-loc-strega": "Zona Campestre",
    "lodging-rates-note": "<strong>Tarifas con Kit Oficial Incluido:</strong> Todos los precios son por persona e incluyen hospedaje y Kit Oficial NanoBridge YT 2026. Las tarifas IEEE aplican presentando membresía activa al registrarse.",
    "lodging-card1-label": "Calendario de Estadía",
    "lodging-card1-title": "Fechas Disponibles",
    "lodging-card1-desc": "Opciones de alojamiento flexibles para participantes y delegaciones:",
    "lodging-card1-content": "<div style=\"margin-bottom: 10px;\"><strong style=\"color: #0f172a; display: block;\">Modalidad 1 Noche:</strong><span style=\"display: block; color: #475569;\">• Ingreso: 25 de octubre | Salida: 26 de octubre</span><span style=\"display: block; color: #475569;\">• Ingreso: 26 de octubre | Salida: 27 de octubre</span></div><div><strong style=\"color: #0f172a; display: block;\">Modalidad 2 Noches:</strong><span style=\"display: block; color: #475569;\">• Ingreso: 25 de octubre | Salida: 27 de octubre</span></div>",
    "lodging-card2-label": "Paquete Integrado",
    "lodging-card2-title": "Beneficios Incluidos",
    "lodging-card2-desc": "Todo participante con reserva a través del comité organizador recibe:",
    "lodging-card2-content": "<div style=\"margin-bottom: 8px;\"><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9\"/></svg><span>Hospedaje Garantizado:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Alojamiento según la modalidad y establecimiento seleccionado en Urcuquí.</span></div><div style=\"margin-bottom: 8px;\"><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"16.5 9.4 7.55 4.24\"></polyline><path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"></path><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"></polyline><line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"></line></svg><span>Kit Oficial NanoBridge YT 2026:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Credencial oficial, material técnico de la cumbre y merchandising exclusivo.</span></div><div style=\"margin-bottom: 8px;\"><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg><span>Coordinación de Delegaciones:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Asignación de habitaciones y apoyo logístico por el comité organizador IEEE NTC.</span></div><div><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 22h8\"></path><path d=\"M12 11v11\"></path><path d=\"m19 3-7 8-7-8Z\"></path></svg><span>Discoteca Pato Mar:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Incluye entrada a la discoteca Pato Mar con shot de bienvenida.</span></div>",
    "lodging-card3-label": "Paso a Paso",
    "lodging-card3-title": "Instrucciones de Reserva",
    "lodging-card3-desc": "Proceso oficial para asegurar tu habitación:",
    "lodging-card3-content": "<span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>1. Formulario:</strong> Llena tus datos de contacto y condición de membresía IEEE.</span><span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>2. Modalidad:</strong> Selecciona tu opción de hospedaje y número de noches (1 o 2).</span><span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>3. Delegación:</strong> Si compartes habitación con compañeros, indica sus nombres.</span><span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>4. Pago:</strong> Adjunta tu comprobante de transferencia bancaria en el formulario.</span><span style=\"display: flex; align-items: center; gap: 5px; color: #0284c7; font-weight: 600;\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink: 0;\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"></line></svg>Cupos limitados: asignación por orden de confirmación de pago.</span>",
    "lodging-cta-badge": "Gestión Centralizada",
    "lodging-cta-title": "¿Listo para asegurar tu hospedaje en Urcuquí?",
    "lodging-cta-desc": "Las reservas se gestionan exclusivamente mediante el formulario oficial del Comité Organizador IEEE NTC para garantizar tarifas institucionales de convenio, el kit oficial del evento y la asignación por delegaciones.",
    "lodging-btn-form": "Reservar Hospedaje (Formulario Oficial)",
    "lodging-btn-ws": "Grupo Oficial de WhatsApp",
    "venue-eyebrow": "Sede del Evento",
    "venue-title": "Universidad Yachay Tech",
    "venue-lead": "Ubicada en la Ciudad del Conocimiento en Urcuquí, Imbabura. Primera universidad de investigación intensiva del Ecuador con laboratorios de vanguardia.",
    "venue-aud-label": "Auditorio Principal",
    "venue-aud-title": "Auditorio de la Escuela de Ciencias Físicas",
    "venue-aud-desc": "Instalaciones acústicas y audiovisuales de alta fidelidad para conferencias magistrales internacionales y transmisiones híbridas en directo.",
    "venue-lab-label": "Laboratorios Experimentales",
    "venue-lab-title": "Cleanroom & Salas de Caracterización",
    "venue-lab-desc": "Entorno de trabajo para el taller NanoSkills con equipamiento de deposición física, microscopías y preparación de muestras.",
    "venue-geo-label": "Ubicación Geográfica",
    "venue-geo-title": "Cantón San Miguel de Urcuquí, Imbabura",
    "venue-geo-desc": "A 2,000 msnm en los Andes ecuatorianos. Clima primaveral templado (15°C - 24°C).",
    "venue-map-eyebrow": "Localización Satelital & Georreferencia",
    "venue-map-title": "Mapa Interactivo del Campus Yachay Tech",
    "venue-map-sub": "Hacienda San José, San Miguel de Urcuquí, Imbabura, Ecuador · Coordenadas: 0°24'16.4\"N 78°10'29.5\"W",
    "btn-gmaps-link": "Abrir en Google Maps",
    "reg-eyebrow": "Inscripciones Abiertas",
    "reg-title": "Asegura tu lugar en NANOBRIDGE YT 2026",
    "reg-desc": "Participa de manera presencial en el campus de Yachay Tech o conéctate virtualmente a las transmisiones internacionales vía IEEE vTools. Se emitirá certificado con aval de IEEE Nanotechnology Council.",
    "reg-perk-1": "Acceso a todas las plenarias técnicas y conferencias magistrales",
    "reg-perk-2": "Participación en el NanoSkills Workshop práctico y sesión de posters",
    "reg-perk-3": "Certificado oficial avalado por IEEE NTC Student Branch y ponentes internacionales",
    "reg-btn-main": "Registro Oficial (Universidades & Externos)",
    "reg-btn-workshop": "Inscripción Workshop Práctico & Posters",
    "reg-btn-cal": "Google Calendar",
    "reg-btn-ics": "Archivo iCal (.ics)",
    "footer-brand-desc": "Organizado por el Capítulo Estudiantil del IEEE Nanotechnology Council (NTC) en la Universidad Yachay Tech, Urcuquí, Ecuador. Conectando la investigación de materiales y la inteligencia artificial desde los Andes hacia el mundo.",
    "footer-quick-nav": "Navegación Rápida",
    "footer-nav-about": "Acerca del Evento",
    "footer-nav-speakers": "Ponentes y Keynotes",
    "footer-nav-schedule": "Cronograma de 2 Días",
    "footer-nav-lodging": "Comparativo de Hospedaje",
    "footer-nav-venue": "Sede Universitaria",
    "footer-org-entities": "Entidades Organizadoras",
    "footer-copy-1": "© 2026 IEEE Nanotechnology Council Yachay Tech Student Branch Chapter. Todos los derechos reservados.",
    "footer-copy-2": "Cumbre científica oficial organizada por IEEE Nanotechnology Council Yachay Tech Student Branch.",
    "modal-eyebrow": "Abstract de Conferencia Oficial",
    "nav-sponsors": "Sponsors",
    "footer-nav-sponsors": "Sponsors Oficiales",
    "sponsors-eyebrow": "IEEE NTC · Alianzas & Auspiciantes",
    "sponsors-title": "Patrocinadores Oficiales",
    "sponsors-lead": "Empresas, emprendimientos y aliados locales que impulsan la ciencia, la cultura y la innovación en NANOBRIDGE YT 2026. Agradecemos su valioso respaldo a la comunidad científica y estudiantil.",
    "sponsors-back-home": "← Volver al Inicio",
    "sponsors-badge-local": "Aliado Local",
    "sponsors-badge-benefit": "Aporte & Sorteos Cumbre",
    "sp-epocas-title": "Épocas Liquor Store & Bar",
    "sp-epocas-cat": "Coctelería & Vida Nocturna",
    "sp-epocas-desc": "Espacio icónico de coctelería de autor, licores selectos y ambiente social distinguido en Urcuquí.",
    "sp-epocas-benefit": "Hidratación oficial y bebidas exclusivas para la Pasarela de Moda Científica y brindis del evento.",
    "sp-epocas-loc": "Urcuquí · WhatsApp: 0984526603",
    "sp-isabella-title": "Pizza's Isabella",
    "sp-isabella-cat": "Gastronomía Artesanal",
    "sp-isabella-desc": "Pizzería tradicional con masa artesanal crocante, ingredientes frescos y las mejores combinaciones de sabores.",
    "sp-isabella-benefit": "1 Pizza pequeña (sabor a elección) como premio oficial para sorteo entre los asistentes.",
    "sp-isabella-loc": "Urcuquí, Imbabura",
    "sp-ragnarok-title": "Ragnarok Restobar",
    "sp-ragnarok-cat": "Restobar & Gastronomía",
    "sp-ragnarok-desc": "Concepto temático con gastronomía selecta, piqueos, hamburguesas gourmet y cervezas artesanales.",
    "sp-ragnarok-benefit": "1 Orden de consumo en el local como premio para participantes destacados de la cumbre.",
    "sp-ragnarok-loc": "Urcuquí, Imbabura",
    "sp-riland-title": "Cacao Riland",
    "sp-riland-cat": "Chocolate Ancestral & Agroindustria",
    "sp-riland-desc": "Elaboración de chocolate puro ancestral de fino aroma, promoviendo salud, sostenibilidad y patrimonio cacaotero.",
    "sp-riland-benefit": "Stand oficial de degustación durante la cumbre + 20 barras de chocolate ancestral saludable para los asistentes.",
    "sp-riland-loc": "Ecuador",
    "sp-andres-title": "Andrés Tattoo Studio",
    "sp-andres-cat": "Arte Corporal Profesional",
    "sp-andres-desc": "Estudio profesional de tatuaje artístico con altos estándares de esterilización, diseño personalizado y trazos finos.",
    "sp-andres-benefit": "1 Tatuaje artístico gratis como premio oficial para sorteo especial entre los asistentes.",
    "sp-andres-loc": "Urcuquí, Imbabura",
    "sp-coctiki-title": "Discoteca Coctiki",
    "sp-coctiki-cat": "Entretenimiento & Vida Nocturna",
    "sp-coctiki-desc": "El centro de diversión nocturna de referencia en Urcuquí, con sonido envolvente, luces inteligentes y barra de cócteles.",
    "sp-coctiki-benefit": "Canasta con productos y cócteles exclusivos para premiación oficial y confraternidad del evento.",
    "sp-coctiki-loc": "Urcuquí, Imbabura",
    "sp-raices-title": "Raíces",
    "sp-raices-cat": "Diseño Textil & Moda",
    "sp-raices-desc": "Taller creativo de diseño de vestuario y confección textil que fusiona identidad andina, estética contemporánea y vanguardia.",
    "sp-raices-benefit": "Diseños de vestuario exclusivos confeccionados para la Pasarela de Moda Científica de NANOBRIDGE YT.",
    "sp-raices-loc": "Urcuquí / Imbabura",
    "sp-patomar-title": "Pato Mar",
    "sp-patomar-cat": "Bar, Gastronomía & Confraternidad",
    "sp-patomar-desc": "Espacio acogedor de integración social, bebidas, coctelería y gastronomía casual para la comunidad universitaria.",
    "sp-patomar-benefit": "Lugar de libre acceso y punto de encuentro oficial para la integración y celebración post-cumbre.",
    "sp-patomar-loc": "Urcuquí, Imbabura",
    "sp-nathaly-title": "Nathaly Buchely Beauty Studio",
    "sp-nathaly-cat": "Belleza, Maquillaje & Estilismo",
    "sp-nathaly-desc": "Estudio integral de imagen, maquillaje profesional de pasarela, estilismo y cuidado estético de alta definición.",
    "sp-nathaly-benefit": "Backstage oficial: Maquillaje y peinado profesional gratuito para todas las modelos de la Pasarela Científica.",
    "sp-nathaly-loc": "Urcuquí, Imbabura",
    "sponsors-cta-title": "¿Deseas vincular tu empresa o marca a NANOBRIDGE YT?",
    "sponsors-cta-desc": "Conéctate con más de 200 futuros científicos, investigadores internacionales y líderes de la industria tecnológica en Ecuador.",
    "sponsors-cta-btn": "Contáctanos vía IEEE NTC"
  },
  "en": {
    "top-notice": "IEEE Nanotechnology Council · Distinguished Lecturer Program & Frontier Summit · Oct 26–27, 2026",
    "nav-about": "About",
    "nav-speakers": "Speakers",
    "nav-schedule": "Schedule",
    "nav-lodging": "Lodging",
    "nav-venue": "Venue",
    "nav-register": "Register",
    "cta-register": "Register Now",
    "hero-eyebrow": "IEEE NTC · Distinguished Lecturer Program & Frontier Summit",
    "hero-title-main": "NANOBRIDGE YT 2026",
    "hero-title-sub": "From Nanoscience to Biomedical Implants & Societies of AI Agents.",
    "hero-tagline": "The premier international summit bridging nanotechnology and artificial intelligence at Yachay City of Knowledge.",
    "hero-btn-register": "Register for Summit",
    "hero-btn-schedule": "View Full Schedule",
    "hero-meta-dates-label": "Official Dates",
    "hero-meta-dates-val": "October 26 & 27, 2026",
    "hero-meta-dates-sub": "Monday & Tuesday · Full Day Sessions",
    "hero-meta-venue-label": "On-Site Venue",
    "hero-meta-venue-val": "Yachay Tech University",
    "hero-meta-venue-sub": "Urcuquí, Imbabura, Ecuador",
    "hero-meta-mode-label": "Modality",
    "hero-meta-mode-val": "Hybrid (In-Person & Live Stream)",
    "hero-meta-mode-sub": "Official IEEE NTC Certification",
    "countdown-title": "The summit begins in",
    "count-unit-days": "Days",
    "count-unit-hours": "Hours",
    "count-unit-mins": "Mins",
    "count-unit-secs": "Secs",
    "partners-eyebrow": "Convening Institutions & Global Academic Alliances",
    "about-eyebrow": "Mission & Fundamentals",
    "about-title": "Frontier science built from the ground up.",
    "about-lead": "Organized by the IEEE Nanotechnology Council Student Branch Chapter at Yachay Tech to bridge Ecuador’s pioneering generation of nanotechnology engineers with international leaders in materials science, AI, and biotechnology.",
    "pillar-1-title": "Thin Films & Sputtering",
    "pillar-1-desc": "Fundamental physics of magnetron sputtering at oblique angle deposition (OAD/GLAD) and columnar nanostructure synthesis.",
    "pillar-2-title": "Antibacterial Surfaces",
    "pillar-2-desc": "Passive biofilm prevention on medical-grade titanium orthopedic implants without relying on antibiotic chemical agents.",
    "pillar-3-title": "Autonomous AI Laboratories",
    "pillar-3-desc": "Closed-loop multi-agent systems for physical experimentation and emergent social dynamics of AI agents in biomedical science.",
    "pillar-4-title": "Deep-Tech & Translation",
    "pillar-4-desc": "From academic labs to commercial spin-offs: Nanostine’s journey translating scientific patents into industrial market solutions.",
    "pillar-cat-1": "Advanced Materials",
    "pillar-cat-2": "Health & Biomedicine",
    "pillar-cat-3": "Artificial Intelligence",
    "pillar-cat-4": "Innovation & Spin-Offs",
    "pillar-foot-2": "Biomaterials",
    "speakers-eyebrow": "Scientific Leadership & Keynotes",
    "speakers-title": "Distinguished Speakers & Committee",
    "speakers-lead": "International scientific leaders gathered at Yachay Tech to bridge frontier research in advanced materials, biomedical AI, and technology transfer with the region’s pioneer generation of nano-engineers.",
    "speaker-abstract-btn": "View Talk Abstract",
    "badge-in-person": "In-Person",
    "badge-virtual": "Virtual",
    "sp-role-1": "CSIC · Nanostine",
    "sp-affil-1": "IEEE NTC Distinguished Lecturer",
    "sp-bio-1": "Scientific Researcher at the Institute of Micro and Nanotechnology (IMN-CNM, CSIC, Madrid). Co-founder of Nanostine S.L. Pioneer in columnar nanostructured titanium coatings with passive antibacterial properties.",
    "sp-talk-day-1-1": "Day 1 (Oct 26) · 09:00 - 10:30",
    "sp-talk-title-1-1": "Nanostructured columnar thin films by magnetron sputtering: From fundamentals to devices",
    "sp-talk-day-1-2": "Day 2 (Oct 27) · 09:00 - 10:30",
    "sp-talk-title-1-2": "Nanomaterials for Biomedicine",
    "sp-role-2": "DENEM Labs",
    "sp-affil-2": "Lead AI Systems Architect",
    "sp-bio-2": "Machine learning engineer and AI systems architect, founder of DENEM Labs, specializing in autonomous laboratories for physical experimentation and multi-agent AI societies.",
    "sp-talk-day-2-1": "Day 1 (Oct 26) · 11:30 - 13:00",
    "sp-talk-title-2-1": "Autonomous Nanotechnology Laboratory: Closed-Loop AI",
    "sp-talk-day-2-2": "Day 2 (Oct 27) · 11:30 - 13:00",
    "sp-talk-title-2-2": "Societies of AI Agents: Influence, Reputation & Emergence",
    "sp-role-3": "IEEE EMBS Ecuador",
    "sp-affil-3": "Section Chair",
    "sp-bio-3": "Leader in biomedical engineering and Chair of the IEEE EMBS Chapter in Ecuador. Advocate for biosensor integration and healthcare instrumentation in public health systems.",
    "sp-talk-day-3-1": "Day 2 (Oct 27) · 10:30 - 11:00",
    "sp-talk-title-3-1": "Frontiers in Biomedical Engineering and the Healthcare Ecosystem in Ecuador",
    "sp-role-4": "Molecular Communications & IoBNT",
    "sp-affil-4": "TU Berlin · Telecommunication Networks (Germany)",
    "sp-bio-4": "Senior Researcher in the Telecommunication Networks (TKN) group at Technische Universität Berlin (TU Berlin, Germany). International specialist in molecular communications, Internet of Bio-Nano-Things (IoBNT), nanosensor localization, and nano-biomedical networks.",
    "sp-talk-day-4-1": "Day 1 (Oct 26) · 10:30 - 11:00 (Virtual)",
    "sp-talk-title-4-1": "Programmability in the Chemical Domain using the Metabolic Network of Cells",
    "sp-role-5": "Nanomaterials & Fabrication",
    "sp-affil-5": "Yachay Tech · Physical Sciences & Nanotechnology",
    "sp-bio-5": "Faculty Researcher in the School of Physical Sciences and Nanotechnology at Yachay Tech. Leading strategic initiatives in nanomaterials formulation and local prototype fabrication.",
    "sp-talk-day-5-1": "Day 1 (Oct 26) · 15:30 - 16:30",
    "sp-talk-title-5-1": "Research Lines in Nanomaterials and Local Fabrication",
    "sp-role-6": "Applied Nanoscience",
    "sp-affil-6": "Yachay Tech · Synthesis & Nanostructures",
    "sp-bio-6": "Faculty researcher at the School of Physical Sciences and Nanotechnology at Yachay Tech. Specialist in chemical and physical synthesis of nanostructures, structural characterization, and tech transfer.",
    "sp-talk-day-6-1": "Day 2 (Oct 27) · 14:30 - 15:30",
    "sp-talk-title-6-1": "Nanotechnology Development and Regional Applications",
    "sp-role-7": "Nanotechnology & Photochemistry",
    "sp-affil-7": "Yachay Tech · Physical Sciences & Nanotechnology",
    "sp-bio-7": "Faculty researcher at the School of Physical Sciences and Nanotechnology at Yachay Tech. International expert in colloidal synthesis, ultrafast photochemistry, luminescence, quantum dots, and functional nanomaterials.",
    "sp-talk-day-7-1": "Day 1 (Oct 26) · 14:30 - 15:30",
    "sp-talk-title-7-1": "Introduction to Nanotechnology",
    "sp-role-8": "Nanostructured Materials",
    "sp-affil-8": "Yachay Tech · Energy Storage & Electrochemistry",
    "sp-bio-8": "Nanotechnology researcher at the School of Physical Sciences and Nanotechnology at Yachay Tech, focusing on novel materials characterization, energy storage applications, and electrochemical devices.",
    "sp-talk-day-8-1": "Day 2 (Oct 27) · 15:30 - 16:00",
    "sp-talk-title-8-1": "Innovation in Nanostructured Materials for Energy Storage",
    "sp-role-9": "Supercapacitors & Nanomaterials",
    "sp-affil-9": "Yachay Tech · Physical Sciences & Nanotechnology",
    "sp-bio-9": "Chemist and researcher at the School of Physical Sciences and Nanotechnology at Yachay Tech. Specialist in biopolymer-derived carbon materials synthesis, ZnO nanoparticle functionalization, and electrochemical supercapacitors.",
    "sp-talk-day-9-1": "Day 2 (Oct 27) · 16:00 - 16:30",
    "sp-talk-title-9-1": "Carbon Materials with ZnO for Supercapacitors",
    "schedule-eyebrow": "Chronological Program",
    "schedule-title": "2-Day Agenda",
    "schedule-lead": "Technical sessions, keynote lectures, artistic interludes, and certified hands-on workshops tailored for students and researchers.",
    "tab-day-1": "Day 1 · Mon Oct 26",
    "tab-day-2": "Day 2 · Tue Oct 27",
    "sched-tag-opening": "Opening",
    "sched-tag-inperson": "In-Person",
    "sched-tag-inaugural": "Inaugural Plenary",
    "sched-tag-ieeedl": "IEEE DL",
    "sched-tag-virtual": "Virtual Lecture",
    "sched-tag-germany": "Germany",
    "sched-tag-cultural": "Live Cultural Performance",
    "sched-tag-auditorium": "Auditorium",
    "sched-tag-live": "Live",
    "sched-tag-coffeebreak": "Coffee Break",
    "sched-tag-networking": "Networking",
    "sched-tag-plenary-ai": "AI Plenary",
    "sched-tag-lunch": "Lunch Break",
    "sched-tag-keynote": "Keynote Lecture",
    "sched-tag-workshop": "NanoSkills Workshop",
    "sched-tag-certified": "Certified",
    "sched-tag-posters": "Posters & Submissions",
    "sched-tag-wrapup1": "Day 1 Wrap-up",
    "sched-tag-day2": "Day 2",
    "sched-tag-translational": "Biomedical Plenary",
    "sched-tag-deeptech": "Biomaterials",
    "sched-tag-musical": "Musical Interlude",
    "sched-tag-conf": "Conference Lecture",
    "sched-tag-awards": "Honors & Awards",
    "sched-tag-runway": "Cultural Runway",
    "sched-tag-closing": "Closing Ceremony",
    "timeline-btn-view": "View Summary",
    "timeline-btn-hide": "Hide Summary",
    "timeline-btn-workshop": "Register for Workshop",
    "sched-d1-i1-title": "Accreditation, Registration & Institutional Welcome",
    "sched-d1-i1-sub": "IEEE NTC Student Branch Chapter & Yachay Tech University Leadership",
    "sched-d1-i2-title": "Nanostructured columnar thin films by magnetron sputtering: From fundamentals to devices",
    "sched-d1-i2-sub": "Dr. José Miguel García-Martín · Institute of Micro and Nanotechnology (CSIC, Madrid)",
    "sched-d1-i2-abs": "Glancing angle deposition with magnetron sputtering as a user-friendly, single-step route to fabricate nanocolumnar thin films (NCTFs) of metals and metal-oxides in large areas. Functional devices described across energy and environment (magnetic nanopillars, photo-induced self-cleaning, perovskite solar cells), biomedicine (antibacterial orthopedic coatings, bioelectrodes, SERS chemical sensing), and aerospace (multipactor effect mitigation).",
    "sched-d1-i3-title": "Programmability in the Chemical Domain using the Metabolic Network of Cells",
    "sched-d1-i3-sub": "Dr. Jorge Torres Gómez · Senior Researcher at TU Berlin (Germany)",
    "sched-d1-i3-abs": "Motivated by living cells' information processing, this research explores assembling signal-processing blocks from reactions in the cell metabolic network. A pipeline mapping abstract reaction network motifs onto metabolic models is presented, along with an algorithm optimizing enzyme concentrations for feasible delays and gains, illustrated in a precision medicine scenario to estimate tumor-immune cell distances.",
    "sched-d1-i4-title": "Morning Coffee Break & Networking Station",
    "sched-d1-i4-sub": "Coffee station, refreshments, and technical networking prior to the Keynote Plenary",
    "sched-d1-i5-title": "Autonomous Nanotechnology Laboratory: AI agents for closed-loop physical experimentation",
    "sched-d1-i5-sub": "MSc. Simon Heilles · Lead AI Architect at DENEM Labs",
    "sched-d1-i5-abs": "Technical architecture for autonomous scientific laboratories. How AI agents formulate hypotheses, control robotic synthesis platforms, and dynamically learn from real-time physical experiments.",
    "sched-d1-i6-title": "Lunch Break & Academic Networking Session",
    "sched-d1-i6-sub": "Official break for lunch and academic exchange among students, visiting delegations, and keynote speakers",
    "sched-d1-i7-title": "Introduction to Nanotechnology",
    "sched-d1-i7-sub": "Dr. Andrey Mereshchenko · School of Physical Sciences and Nanotechnology, Yachay Tech",
    "sched-d1-i7-abs": "Fundamental principles of nanoscale science, quantum confinement effects, and an overview of the technological impact of nanomaterials in modern physics and chemistry.",
    "sched-d1-i8-title": "Research Lines in Nanomaterials and Local Fabrication",
    "sched-d1-i8-sub": "Dr. Carlos Reinoso · School of Physical Sciences and Nanotechnology, Yachay Tech",
    "sched-d1-i8-abs": "Presentation of pioneering projects in nanomaterials synthesis and formulation at Yachay Tech laboratories, exploring their industrial and environmental application in Ecuador.",
    "sched-d1-i9-title": "Hands-on Specialized Training Workshop in Nanoscience & Posters",
    "sched-d1-i9-sub": "Interactive technical session for graduate skill building, applied research workflows, and scientific poster presentations",
    "sched-d1-i10-title": "Scientific Fashion Runway & Day 1 Closing",
    "sched-d1-i10-sub": "Avant-garde nanotechnology and textile collection by designer Wendy, day synthesis, and conclusions by the IEEE NTC Executive Board",
    "sched-d2-i1-title": "Day 2 Opening & Morning Check-in",
    "sched-d2-i1-sub": "IEEE NTC Yachay Tech Student Branch Chapter Executive Board",
    "sched-d2-i2-title": "Nanomaterials for Biomedicine",
    "sched-d2-i2-sub": "Dr. José Miguel García-Martín · Institute of Micro and Nanotechnology (CSIC, Madrid)",
    "sched-d2-i2-abs": "Comprehensive review of the design, synthesis, and application of functional nanomaterials in biomedical engineering. Advances in columnar nanostructured coatings for orthopedic implants with passive antibacterial properties without antibiotics, cell-material interactions optimizing osteointegration, bioelectrodes for electrical stimulation, and nanotechnology platforms for molecular biosensing.",
    "sched-d2-i3-title": "Frontiers in Biomedical Engineering and the Healthcare Ecosystem in Ecuador",
    "sched-d2-i3-sub": "Dr. Edwin Valarezo · Chair of IEEE EMBS Ecuador Section",
    "sched-d2-i3-abs": "Challenges and opportunities in local medical device design, nanotechnology-based sensors, and bridging academia with national healthcare systems.",
    "sched-d2-i4-title": "Special Performance by the Yachay Tech Dance Club",
    "sched-d2-i4-sub": "University Dance Club · Traditional Andean and contemporary choreographic expression",
    "sched-d2-i5-title": "Coffee Break & Live Piano Performance",
    "sched-d2-i5-sub": "Live piano recital (classical and contemporary fusion) & coffee station in the Main Auditorium",
    "sched-d2-i6-title": "Societies of AI Agents: Measuring influence, reputation, and emergent social behavior",
    "sched-d2-i6-sub": "MSc. Simon Heilles · Lead AI Architect (DENEM Labs)",
    "sched-d2-i6-abs": "Social dynamics of artificial agents: mechanisms driving trust, reputation, conformity, and information cascades when language models interact in complex environments.",
    "sched-d2-i7-title": "Lunch Break & Open Dialogue with Speakers",
    "sched-d2-i7-sub": "Official lunch recess and informal networking space across campus",
    "sched-d2-i8-title": "Institutional Recognition Ceremony & Awards",
    "sched-d2-i8-sub": "Special honors for MSc. Simon Heilles, Dr. José Miguel García-Martín, guest speakers, and awards for Day 1 Workshop & Poster winners",
    "sched-d2-i9-title": "Nanotechnology Development and Regional Applications",
    "sched-d2-i9-sub": "Dr. Jhonny Chimborazo · School of Physical Sciences and Nanotechnology, Yachay Tech",
    "sched-d2-i9-abs": "Chemical and physical nanostructure synthesis methodologies, structural characterization, and technology transfer initiatives targeting regional industry.",
    "sched-d2-i10-title": "Innovation in Nanostructured Materials for Energy Applications",
    "sched-d2-i10-sub": "Ing. Benjamín Pusay · Advanced Materials Researcher, Yachay Tech",
    "sched-d2-i10-abs": "Novel synthesis routes of nanomaterials for energy storage and next-generation electrochemical devices.",
    "sched-d2-i11-title": "Carboxymethylcellulose-derived carbon materials loaded with ZnO nanoparticles for supercapacitors: study of the structure-performance correlation",
    "sched-d2-i11-sub": "MSc. María Fernanda Bósquez · School of Physical Sciences and Nanotechnology, Yachay Tech",
    "sched-d2-i11-abs": "Study on the synthesis and evaluation of biopolymer-derived carbon materials (carboxymethylcellulose) functionalized with zinc oxide (ZnO) nanoparticles for application in electrochemical supercapacitors, providing an in-depth analysis of the structure-performance correlation.",
    "sched-d2-i12-title": "Official Summit Closing Ceremony & Certificate Awarding",
    "sched-d2-i12-sub": "Institutional closing by Yachay Tech University authorities, IEEE NTC Student Branch Executive Board, and official attendee certification",
    "lodging-tag": "Official Lodging & Logistics",
    "lodging-eyebrow": "Logistics & Accommodation",
    "lodging-title": "Official Lodging Comparison in Urcuquí",
    "lodging-lead": "Consolidated official rates, room categories, and accommodation options for attendees and delegations during NANOBRIDGE YT 2026.",
    "lodging-th-option": "Option",
    "lodging-th-hotel": "Establishment",
    "lodging-th-modality": "Room Modality",
    "lodging-th-1n-ieee": "1 Night · IEEE Member",
    "lodging-th-1n-gen": "1 Night · Non-Member",
    "lodging-th-2n-ieee": "2 Nights · IEEE Member",
    "lodging-th-2n-gen": "2 Nights · Non-Member",
    "lodging-th-location": "Location",
    "lodging-r1-mod": "<strong>Matrimonial:</strong> 2 people share ONE bed",
    "lodging-r2-mod": "<strong>Matrimonial:</strong> 2 people share ONE bed",
    "lodging-r3-mod": "<strong>Shared Group:</strong> Own individual bed; shared room",
    "lodging-r4-mod": "<strong>Shared Group:</strong> Own 1½ size bed; shared room",
    "lodging-r5-mod": "<strong>Private Single:</strong> Own 1½ size bed; private room",
    "lodging-r6-mod": "<strong>Shared Room:</strong> Shared room; bed configuration TBA",
    "lodging-loc-suenos": "Downtown Urcuquí",
    "lodging-loc-kampak": "Downtown Urcuquí",
    "lodging-loc-strega": "Countryside Area",
    "lodging-rates-note": "<strong>Rates include Official Summit Kit:</strong> All rates are per person and include accommodation plus the Official NanoBridge YT 2026 Kit. IEEE rates apply upon presenting valid membership during registration.",
    "lodging-card1-label": "Stay Schedule",
    "lodging-card1-title": "Available Dates",
    "lodging-card1-desc": "Flexible lodging dates tailored for individual participants and delegations:",
    "lodging-card1-content": "<div style=\"margin-bottom: 10px;\"><strong style=\"color: #0f172a; display: block;\">1-Night Modality:</strong><span style=\"display: block; color: #475569;\">• Check-in: Oct 25 | Check-out: Oct 26</span><span style=\"display: block; color: #475569;\">• Check-in: Oct 26 | Check-out: Oct 27</span></div><div><strong style=\"color: #0f172a; display: block;\">2-Night Modality:</strong><span style=\"display: block; color: #475569;\">• Check-in: Oct 25 | Check-out: Oct 27</span></div>",
    "lodging-card2-label": "Integrated Package",
    "lodging-card2-title": "Included Benefits",
    "lodging-card2-desc": "Every attendee booking through the organizing committee receives:",
    "lodging-card2-content": "<div style=\"margin-bottom: 8px;\"><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9\"/></svg><span>Guaranteed Accommodation:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Lodging according to selected modality and establishment in Urcuquí.</span></div><div style=\"margin-bottom: 8px;\"><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"16.5 9.4 7.55 4.24\"></polyline><path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"></path><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"></polyline><line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"></line></svg><span>Official NanoBridge YT 2026 Kit:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Official badge, technical materials, and exclusive summit merchandise.</span></div><div style=\"margin-bottom: 8px;\"><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg><span>Delegation Coordination:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Room assignments and logistics support managed by the IEEE NTC committee.</span></div><div><strong style=\"color: #0f172a; display: flex; align-items: center; gap: 6px;\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0284c7\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 22h8\"></path><path d=\"M12 11v11\"></path><path d=\"m19 3-7 8-7-8Z\"></path></svg><span>Pato Mar Nightclub:</span></strong><span style=\"color: #475569; display: block; margin-top: 2px;\">Includes free admission to Pato Mar Nightclub with a welcome shot.</span></div>",
    "lodging-card3-label": "Step by Step",
    "lodging-card3-title": "Reservation Instructions",
    "lodging-card3-desc": "Official procedure to secure your room:",
    "lodging-card3-content": "<span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>1. Form:</strong> Complete your contact information and IEEE membership status.</span><span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>2. Modality:</strong> Choose your preferred lodging option and stay duration (1 or 2 nights).</span><span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>3. Delegation:</strong> If sharing a room with colleagues, provide their names for grouping.</span><span style=\"display: block; margin-bottom: 6px; color: #475569;\"><strong>4. Payment:</strong> Attach your bank transfer receipt directly in the form.</span><span style=\"display: flex; align-items: center; gap: 5px; color: #0284c7; font-weight: 600;\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink: 0;\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"></line></svg>Limited spots: assigned on a first-confirmed, first-served basis.</span>",
    "lodging-cta-badge": "Centralized Management",
    "lodging-cta-title": "Ready to secure your stay in Urcuquí?",
    "lodging-cta-desc": "Reservations are processed exclusively through the official IEEE NTC Organizing Committee form to secure institutional agreement rates, official attendee kits, and coordinated room assignments.",
    "lodging-btn-form": "Book Accommodation (Official Form)",
    "lodging-btn-ws": "Official WhatsApp Group",
    "venue-eyebrow": "Official Venue",
    "venue-title": "Yachay Tech University",
    "venue-lead": "Located within the Knowledge City in Urcuquí, Imbabura. Ecuador’s premier research-intensive experimental university equipped with advanced cleanroom laboratories.",
    "venue-aud-label": "Main Auditorium",
    "venue-aud-title": "School of Physical Sciences Auditorium",
    "venue-aud-desc": "High-fidelity acoustic and audiovisual facilities for international keynote lectures and hybrid livestreams.",
    "venue-lab-label": "Experimental Laboratories",
    "venue-lab-title": "Cleanroom & Characterization Suites",
    "venue-lab-desc": "Hands-on workspace for the NanoSkills Workshop with physical deposition tools, microscopy, and sample preparation.",
    "venue-geo-label": "Geographic Location",
    "venue-geo-title": "San Miguel de Urcuquí Canton, Imbabura",
    "venue-geo-desc": "At 2,000 m (6,560 ft) in the Ecuadorian Andes. Mild spring weather (15°C - 24°C / 59°F - 75°F).",
    "venue-map-eyebrow": "Satellite Location & Georeference",
    "venue-map-title": "Interactive Yachay Tech Campus Map",
    "venue-map-sub": "Hacienda San José, San Miguel de Urcuquí, Imbabura, Ecuador · Coordinates: 0°24'16.4\"N 78°10'29.5\"W",
    "btn-gmaps-link": "Open in Google Maps",
    "reg-eyebrow": "Registration Open",
    "reg-title": "Secure your seat at NANOBRIDGE YT 2026",
    "reg-desc": "Join us in-person at Yachay Tech campus or attend virtually via global IEEE vTools streams. Certified attendance granted by IEEE Nanotechnology Council.",
    "reg-perk-1": "Access to all keynote plenaries and technical sessions",
    "reg-perk-2": "Hands-on participation in the NanoSkills Workshop & Poster session",
    "reg-perk-3": "Official certificate endorsed by IEEE NTC Student Branch and international keynote speakers",
    "reg-btn-main": "Official Registration (Universities & Attendees)",
    "reg-btn-workshop": "Register for Hands-on Workshop & Posters",
    "reg-btn-cal": "Google Calendar",
    "reg-btn-ics": "Download iCal (.ics)",
    "footer-brand-desc": "Organized by the IEEE Nanotechnology Council (NTC) Student Branch Chapter at Yachay Tech University, Urcuquí, Ecuador. Connecting materials science and artificial intelligence from the Andes to the world.",
    "footer-quick-nav": "Quick Navigation",
    "footer-nav-about": "About the Summit",
    "footer-nav-speakers": "Speakers & Keynotes",
    "footer-nav-schedule": "2-Day Schedule",
    "footer-nav-lodging": "Lodging Comparison",
    "footer-nav-venue": "University Venue",
    "footer-org-entities": "Organizing Entities",
    "footer-copy-1": "© 2026 IEEE Nanotechnology Council Yachay Tech Student Branch Chapter. All rights reserved.",
    "footer-copy-2": "Official scientific summit organized by the IEEE Nanotechnology Council Yachay Tech Student Branch.",
    "modal-eyebrow": "Official Conference Abstract",
    "nav-sponsors": "Sponsors",
    "footer-nav-sponsors": "Official Sponsors",
    "sponsors-eyebrow": "IEEE NTC · Partnerships & Sponsors",
    "sponsors-title": "Official Summit Sponsors",
    "sponsors-lead": "Local businesses, ventures, and community partners powering science, culture, and innovation at NANOBRIDGE YT 2026. We thank them for their outstanding support to the scientific and student community.",
    "sponsors-back-home": "← Back to Home",
    "sponsors-badge-local": "Local Partner",
    "sponsors-badge-benefit": "Summit Support & Giveaways",
    "sp-epocas-title": "Épocas Liquor Store & Bar",
    "sp-epocas-cat": "Cocktails & Nightlife",
    "sp-epocas-desc": "Signature cocktail lounge, curated spirits, and vibrant social venue in Urcuquí.",
    "sp-epocas-benefit": "Official hydration and exclusive beverages for the Scientific Fashion Runway and summit toast.",
    "sp-epocas-loc": "Urcuquí · WhatsApp: 0984526603",
    "sp-isabella-title": "Pizza's Isabella",
    "sp-isabella-cat": "Artisan Gastronomy",
    "sp-isabella-desc": "Traditional pizzeria featuring artisan thin crust, fresh ingredients, and gourmet specialty recipes.",
    "sp-isabella-benefit": "1 Small pizza (flavor of choice) as an official raffle giveaway for attendees.",
    "sp-isabella-loc": "Urcuquí, Imbabura",
    "sp-ragnarok-title": "Ragnarok Restobar",
    "sp-ragnarok-cat": "Restobar & Dining",
    "sp-ragnarok-desc": "Themed culinary venue with gourmet burgers, craft beers, and casual dining.",
    "sp-ragnarok-benefit": "1 Dining voucher at the venue as an official award for outstanding summit participants.",
    "sp-ragnarok-loc": "Urcuquí, Imbabura",
    "sp-riland-title": "Cacao Riland",
    "sp-riland-cat": "Ancestral Chocolate & Agroindustry",
    "sp-riland-desc": "Crafting fine-flavor ancestral pure chocolate, championing wellness, sustainability, and cocoa heritage.",
    "sp-riland-benefit": "Official tasting booth during the summit + 20 bars of healthy ancestral chocolate for attendees.",
    "sp-riland-loc": "Ecuador",
    "sp-andres-title": "Andrés Tattoo Studio",
    "sp-andres-cat": "Professional Body Art",
    "sp-andres-desc": "Professional artistic tattoo studio with strict sterilization protocols, custom designs, and fine-line mastery.",
    "sp-andres-benefit": "1 Free artistic tattoo as an official raffle prize for registered attendees.",
    "sp-andres-loc": "Urcuquí, Imbabura",
    "sp-coctiki-title": "Discoteca Coctiki",
    "sp-coctiki-cat": "Nightclub & Entertainment",
    "sp-coctiki-desc": "The premier nightlife venue in Urcuquí, equipped with immersive sound, dynamic lighting, and signature cocktail bar.",
    "sp-coctiki-benefit": "Gift basket with premium products and signature cocktails for summit awards & networking.",
    "sp-coctiki-loc": "Urcuquí, Imbabura",
    "sp-raices-title": "Raíces",
    "sp-raices-cat": "Fashion & Textile Design",
    "sp-raices-desc": "Creative apparel and textile workshop fusing Andean cultural identity with contemporary avant-garde aesthetics.",
    "sp-raices-benefit": "Exclusive apparel and costume designs created for the NANOBRIDGE YT Scientific Fashion Runway.",
    "sp-raices-loc": "Urcuquí / Imbabura",
    "sp-patomar-title": "Pato Mar",
    "sp-patomar-cat": "Bar, Dining & Networking",
    "sp-patomar-desc": "Welcoming social lounge, craft drinks, and casual dining for university students and visitors.",
    "sp-patomar-benefit": "Free admission venue and official gathering point for post-summit networking and celebration.",
    "sp-patomar-loc": "Urcuquí, Imbabura",
    "sp-nathaly-title": "Nathaly Buchely Beauty Studio",
    "sp-nathaly-cat": "Beauty, Makeup & Styling",
    "sp-nathaly-desc": "Comprehensive image studio specializing in professional runway makeup, hair design, and high-definition aesthetics.",
    "sp-nathaly-benefit": "Official backstage: Free professional makeup and styling for all Scientific Fashion Runway models.",
    "sp-nathaly-loc": "Urcuquí, Imbabura",
    "sponsors-cta-title": "Would you like to partner your brand with NANOBRIDGE YT?",
    "sponsors-cta-desc": "Connect with over 200 future engineers, international scientists, and tech leaders in Ecuador.",
    "sponsors-cta-btn": "Contact Us via IEEE NTC"
  }
};

let currentLang = 'es';

function initI18n() {
  const saved = localStorage.getItem('nanobridge_lang');
  if (saved && (saved === 'es' || saved === 'en')) {
    currentLang = saved;
  }

  updatePageLanguage(currentLang);

  // Bind to all ES & EN language buttons (Desktop & Mobile)
  document.querySelectorAll('#lang-btn-es, .lang-btn-es').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLanguage('es');
    });
  });

  document.querySelectorAll('#lang-btn-en, .lang-btn-en').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setLanguage('en');
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('nanobridge_lang', lang);
  updatePageLanguage(lang);
}

function updatePageLanguage(lang) {
  // Update button active states across all selectors
  document.querySelectorAll('#lang-btn-es, .lang-btn-es').forEach((b) => {
    b.classList.toggle('active', lang === 'es');
  });
  document.querySelectorAll('#lang-btn-en, .lang-btn-en').forEach((b) => {
    b.classList.toggle('active', lang === 'en');
  });

  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (I18N_DICTIONARY[lang] && I18N_DICTIONARY[lang][key] !== undefined) {
      const val = I18N_DICTIONARY[lang][key];
      const span = el.querySelector(':scope > span');
      if (span && !val.includes('<')) {
        span.textContent = val;
      } else if (val.includes('<')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // Update abstract toggle buttons in the schedule timeline
  document.querySelectorAll('.btn-toggle-abstract').forEach((toggle) => {
    if (toggle.tagName.toLowerCase() === 'button') {
      const entry = toggle.closest('.timeline-entry');
      const isExp = entry && entry.querySelector('.timeline-expandable-abstract.expanded');
      toggle.textContent = isExp
        ? (lang === 'es' ? 'Ocultar Resumen' : 'Hide Summary')
        : (lang === 'es' ? 'Ver Resumen' : 'View Summary');
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
   6. ABSTRACT MODAL SYSTEM & BILINGUAL TALKS DATA
   ========================================================================== */
const SPEAKERS_DATA = {
  'garcia-martin': {
    name: 'Dr. José Miguel García-Martín',
    affiliation: 'IMN-CNM, CSIC (Madrid, España) · Co-Fundador de Nanostine S.L. · IEEE NTC Distinguished Lecturer',
    affiliation_en: 'IMN-CNM, CSIC (Madrid, Spain) · Co-Founder of Nanostine S.L. · IEEE NTC Distinguished Lecturer',
    talk1: {
      day: 'Día 1 (26 Oct) · 09:00 - 10:30',
      day_en: 'Day 1 (Oct 26) · 09:00 - 10:30',
      title: 'Nanostructured columnar thin films by magnetron sputtering: From fundamentals to devices',
      title_en: 'Nanostructured columnar thin films by magnetron sputtering: From fundamentals to devices',
      abstract: 'En la primera parte de esta charla se demostrará que la deposición en ángulo rasante mediante magnetron sputtering es una vía accesible para fabricar películas delgadas nanocolumnares (NCTF) de metales y óxidos metálicos en grandes áreas de varios centímetros cuadrados y superiores (siendo viable su escalado) en un proceso de un solo paso, en claro contraste con las técnicas de nanolitografía. El desarrollo de la morfología nanocolumnar es resultado del sombreado atómico, difusión atómica y relajación superficial. En la segunda parte se describirán diversas aplicaciones donde las NCTF son relevantes, debatiendo cómo y por qué estos nanomateriales pueden utilizarse en dispositivos funcionales: para energía y medio ambiente (nanopilares magnéticos con propiedades a medida, superficies auto-limpiantes foto-inducidas, capas para celdas solares de perovskita y recubrimientos de metal negro en el rango visible); para biomedicina (recubrimientos antibacterianos en implantes ortopédicos, bioelectrodos para estimulación eléctrica, plantillas para detección química por SERS y electrodos de trabajo en detección electroquímica); y para la industria aeroespacial (recubrimientos nanoestructurados que mitigan el efecto multipactor).',
      abstract_en: 'In the first part of this talk, it will be shown that glancing angle deposition with magnetron sputtering is a user-friendly route to fabricate nanocolumnar thin films (NCTFs) of metals and metal-oxides in large areas of several square centimeters and above (scaling-up is feasible) in a single-step process. This is in clear contrast to nanolithography techniques. The development of the nanocolumnar morphology is the result of atomic shadowing, atomic diffusion, and surface relaxation. In the second part of the talk, several applications where NCTFs are of relevance will be described, discussing how and why these nanostructured materials can be used in functional devices. For energy and environment: as magnetic nanopillars with tailored properties, as nanostructured surfaces with photo-induced self-cleaning properties, as nanostructured layers to improve perovskite solar cells, and as black metal coatings in the visible range. For biomedicine: as antibacterial coatings in orthopedic implants, as bioelectrodes for electrical stimulation, as templates for chemical sensing by surface enhanced Raman spectroscopy, and as working electrodes in the electrochemical detection of molecules. Finally, for the aerospace industry: as nanostructured coatings that mitigate the undesirable multipactor effect (which can prevent the correct performance of radio-frequency devices or even damage them).'
    },
    talk2: {
      day: 'Día 2 (27 Oct) · 09:00 - 10:30',
      day_en: 'Day 2 (Oct 27) · 09:00 - 10:30',
      title: 'Nanomateriales para Biomedicina',
      title_en: 'Nanomaterials for Biomedicine',
      abstract: 'Revisión integral sobre el diseño, síntesis y aplicación de nanomateriales funcionales en el ámbito biomédico y clínico. Avances en recubrimientos nanoestructurados columnares para implantes ortopédicos con propiedades antibacterianas pasivas sin antibióticos, interacción célula-material para optimizar la osteointegración, bioelectrodos para estimulación eléctrica y plataformas nanotecnológicas para biosensado molecular.',
      abstract_en: 'Comprehensive review of the design, synthesis, and application of functional nanomaterials in biomedical engineering. Advances in columnar nanostructured coatings for orthopedic implants with passive antibacterial properties without antibiotics, cell-material interactions optimizing osteointegration, bioelectrodes for electrical stimulation, and nanotechnology platforms for molecular biosensing.'
    }
  },
  'simon-heilles': {
    name: 'MSc. Simon Heilles',
    affiliation: 'DENEM Labs · Lead AI Systems Architect & Machine Learning Researcher',
    affiliation_en: 'DENEM Labs · Lead AI Systems Architect & Machine Learning Researcher',
    talk1: {
      day: 'Día 1 (26 Oct) · 11:30 - 13:00',
      day_en: 'Day 1 (Oct 26) · 11:30 - 13:00',
      title: 'Autonomous Nanotechnology Laboratory: AI agents for closed-loop physical experimentation and scientific discovery',
      title_en: 'Autonomous Nanotechnology Laboratory: AI agents for closed-loop physical experimentation and scientific discovery',
      abstract: 'Exploración de arquitecturas de agentes de inteligencia artificial que trascienden el mero análisis de datos para transformarse en participantes activos de la experimentación científica. El laboratorio se concibe como un sistema en bucle cerrado: objetivo científico → hipótesis → diseño experimental → simulación digital twin → experimentación física → medición y caracterización → análisis → siguiente iteración.',
      abstract_en: 'Exploration of artificial intelligence agent architectures that move beyond data analysis to become active participants in scientific physical experimentation. The laboratory is engineered as a closed-loop system: scientific objective → hypothesis → experimental design → digital twin simulation → physical experimentation → measurement & characterization → analysis → next iteration.'
    },
    talk2: {
      day: 'Día 2 (27 Oct) · 11:30 - 13:00',
      day_en: 'Day 2 (Oct 27) · 11:30 - 13:00',
      title: 'Societies of AI Agents: Measuring influence, reputation, and emergent social behavior between autonomous agents',
      title_en: 'Societies of AI Agents: Measuring influence, reputation, and emergent social behavior between autonomous agents',
      abstract: 'A medida que los agentes de IA se comunican, delegan, negocian y transfieren información, la unidad de estudio relevante pasa a ser la sociedad de agentes. Se propone una agenda de investigación empírica inspirada en la psicología social y la ciencia de redes para medir influencia, reputación, conformidad y cascadas de información.',
      abstract_en: 'As AI agents communicate, delegate, negotiate, and exchange information, the relevant unit of inquiry becomes the multi-agent society. An empirical research agenda inspired by social psychology and network science is presented to quantify influence, reputation, conformity, and information cascades in multi-agent environments.'
    }
  },
  'edwin-valarezo': {
    name: 'Dr. Edwin Valarezo',
    affiliation: 'Presidente de IEEE EMBS (Engineering in Medicine and Biology Society) - Sección Ecuador',
    affiliation_en: 'Chair of IEEE EMBS (Engineering in Medicine and Biology Society) - Ecuador Section',
    talk1: {
      day: 'Día 2 (27 Oct) · 10:30 - 11:00 (Virtual)',
      day_en: 'Day 2 (Oct 27) · 10:30 - 11:00 (Virtual)',
      title: 'Fronteras en Ingeniería Biomédica y Ecosistema de Salud en Ecuador',
      title_en: 'Frontiers in Biomedical Engineering and the Healthcare Ecosystem in Ecuador',
      abstract: 'Panorama estratégico sobre la convergencia de dispositivos biomédicos, sensores nanotecnológicos y sistemas de salud pública en el contexto ecuatoriano y latinoamericano.',
      abstract_en: 'Strategic overview of the convergence among biomedical devices, nanotechnology-based sensors, and public health systems within Ecuadorian and Latin American contexts.'
    }
  },
  'jorge-torres': {
    name: 'Dr. Jorge Torres Gómez',
    affiliation: 'Senior Researcher, Telecommunication Networks Group (TKN), Technische Universität Berlin (TU Berlin, Alemania)',
    affiliation_en: 'Senior Researcher, Telecommunication Networks Group (TKN), Technische Universität Berlin (TU Berlin, Germany)',
    talk1: {
      day: 'Día 1 (26 Oct) · 10:30 - 11:00 (Virtual)',
      day_en: 'Day 1 (Oct 26) · 10:30 - 11:00 (Virtual)',
      title: 'Programmability in the Chemical Domain using the Metabolic Network of Cells',
      title_en: 'Programmability in the Chemical Domain using the Metabolic Network of Cells',
      abstract: 'Motivados por los mecanismos mediante los cuales las células vivas procesan información, investigamos si los bloques de procesamiento de señales pueden ensamblarse a partir de reacciones que ya existen en la red metabólica de la célula. Siguiendo esta idea, presentamos un pipeline que mapea motivos abstractos de redes de reacciones químicas sobre reacciones de un modelo metabólico celular. Introducimos un algoritmo que selecciona concentraciones enzimáticas para satisfacer retardos y ganancias por reacción bajo una abundancia enzimática factible. Ilustramos la aplicación de esta solución en un escenario de medicina de precisión, donde se requiere estimar distancias entre células tumorales e inmunitarias.',
      abstract_en: 'Motivated by the living cells mechanisms to process information, we research whether signal-processing blocks can be assembled from reactions that already exist in the metabolic network of the cell. Following this idea, we present a pipeline that maps abstract chemical reaction network motifs onto reactions of a cell metabolic model. We introduce an algorithm then selects enzyme concentrations to meet delays and gains per reaction under feasible enzyme abundance. We illustrate the application of this solution in medicine precision scenario, where distances between tumor and immune cells needs to be estimated.'
    }
  },
  'jose-torres': {
    name: 'Dr. Jorge Torres Gómez',
    affiliation: 'Senior Researcher, Telecommunication Networks Group (TKN), Technische Universität Berlin (TU Berlin, Alemania)',
    affiliation_en: 'Senior Researcher, Telecommunication Networks Group (TKN), Technische Universität Berlin (TU Berlin, Germany)',
    talk1: {
      day: 'Día 1 (26 Oct) · 10:30 - 11:00 (Virtual)',
      day_en: 'Day 1 (Oct 26) · 10:30 - 11:00 (Virtual)',
      title: 'Programmability in the Chemical Domain using the Metabolic Network of Cells',
      title_en: 'Programmability in the Chemical Domain using the Metabolic Network of Cells',
      abstract: 'Motivados por los mecanismos mediante los cuales las células vivas procesan información, investigamos si los bloques de procesamiento de señales pueden ensamblarse a partir de reacciones que ya existen en la red metabólica de la célula. Siguiendo esta idea, presentamos un pipeline que mapea motivos abstractos de redes de reacciones químicas sobre reacciones de un modelo metabólico celular. Introducimos un algoritmo que selecciona concentraciones enzimáticas para satisfacer retardos y ganancias por reacción bajo una abundancia enzimática factible. Ilustramos la aplicación de esta solución en un escenario de medicina de precisión, donde se requiere estimar distancias entre células tumorales e inmunitarias.',
      abstract_en: 'Motivated by the living cells mechanisms to process information, we research whether signal-processing blocks can be assembled from reactions that already exist in the metabolic network of the cell. Following this idea, we present a pipeline that maps abstract chemical reaction network motifs onto reactions of a cell metabolic model. We introduce an algorithm then selects enzyme concentrations to meet delays and gains per reaction under feasible enzyme abundance. We illustrate the application of this solution in medicine precision scenario, where distances between tumor and immune cells needs to be estimated.'
    }
  },
  'carlos-reinoso': {
    name: 'Dr. Carlos Reinoso',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Faculty Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 1 (26 Oct) · 15:30 - 16:30 (Presencial)',
      day_en: 'Day 1 (Oct 26) · 15:30 - 16:30 (In-Person)',
      title: 'Líneas de Investigación en Nanomateriales y Fabricación Local',
      title_en: 'Research Lines in Nanomaterials and Local Fabrication',
      abstract: 'Desarrollo de capacidades experimentales en Yachay Tech, líneas estratégicas de síntesis de nanomateriales y soluciones diseñadas para las problemáticas industriales y ambientales del Ecuador.',
      abstract_en: 'Development of experimental capabilities at Yachay Tech, strategic nanomaterial synthesis initiatives, and engineered solutions targeting industrial and environmental challenges in Ecuador.'
    }
  },
  'jhonny-chimborazo': {
    name: 'Dr. Jhonny Chimborazo',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Faculty Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 14:30 - 15:30 (Presencial)',
      day_en: 'Day 2 (Oct 27) · 14:30 - 15:30 (In-Person)',
      title: 'Desarrollo de Nanotecnología y Aplicaciones Regionales',
      title_en: 'Nanotechnology Development and Regional Applications',
      abstract: 'Metodologías de síntesis física y química de nanoestructuras, caracterización estructural y proyectos de transferencia tecnológica orientados al sector productivo regional.',
      abstract_en: 'Chemical and physical nanostructure synthesis methodologies, structural characterization, and technology transfer initiatives targeting regional industry.'
    }
  },
  'edwin-chimborazo': {
    name: 'Dr. Jhonny Chimborazo',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Faculty Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 14:30 - 15:30 (Presencial)',
      day_en: 'Day 2 (Oct 27) · 14:30 - 15:30 (In-Person)',
      title: 'Desarrollo de Nanotecnología y Aplicaciones Regionales',
      title_en: 'Nanotechnology Development and Regional Applications',
      abstract: 'Metodologías de síntesis física y química de nanoestructuras, caracterización estructural y proyectos de transferencia tecnológica orientados al sector productivo regional.',
      abstract_en: 'Chemical and physical nanostructure synthesis methodologies, structural characterization, and technology transfer initiatives targeting regional industry.'
    }
  },
  'andrey-mereshchenko': {
    name: 'Dr. Andrey Mereshchenko',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Faculty Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 1 (26 Oct) · 14:30 - 15:30 (Presencial)',
      day_en: 'Day 1 (Oct 26) · 14:30 - 15:30 (In-Person)',
      title: 'Introduction to Nanotechnology',
      title_en: 'Introduction to Nanotechnology',
      abstract: 'How does matter behave when its dimensions approach the scale of atoms and molecules, and how can this behavior be used to create functional materials? This presentation introduces the fundamental concepts of nanotechnology through accessible comparisons, historical examples, and contemporary applications. Focusing on materials with characteristic dimensions of approximately 1–100 nm, it explains how decreasing size increases the importance of surfaces and can alter electronic and optical properties. These concepts provide a framework for understanding the relationships between nanoscale structure, material properties, and technological function.<br><br>Metal nanoparticles illustrate how controlling size, shape, and composition changes the interaction of matter with light. Historical examples, including the Lycurgus Cup and stained glass, connect the longstanding use of nanoscale materials with modern explanations of their distinctive colors. Localized surface plasmon resonance is introduced as the collective oscillation of conduction electrons driven by light, providing a basis for understanding the optical behavior of gold and silver nanoparticles. The presentation also outlines major approaches to nanoparticle preparation, contrasting bottom-up chemical synthesis with physical production methods such as laser ablation and plasma processing. Particular attention is given to the role of surface ligands in stabilizing nanoparticles and controlling their growth and dispersion. Applications include silver-based antibacterial materials and gold nanoparticle labels for diagnostic assays.<br><br>Semiconductor quantum dots provide a complementary example of size-dependent behavior arising from quantum confinement. The presentation discusses their tunable optical properties, preparation by colloidal synthesis and epitaxial growth, and use as fluorescent labels in biological imaging. Surface modification and silica encapsulation are introduced as strategies for adapting nanoparticles to biological environments, with attention to the challenges associated with potentially toxic compositions. The discussion then turns to nature-inspired nanotechnology, highlighting how hierarchical structures and nanoscale interactions contribute to adhesion, refractive-index modulation, and structural coloration.<br><br>Finally, the presentation introduces the experimental tools used to investigate the nanoworld, including scanning and transmission electron microscopy, spectroscopy, and particle-sizing techniques. By connecting synthesis, characterization, and applications, it offers an interdisciplinary overview of how nanoscale design enables new material functions. The central aim is to develop an intuitive understanding of why size matters and how the controlled organization of matter at the nanoscale links fundamental chemistry and physics with practical technologies.',
      abstract_en: 'How does matter behave when its dimensions approach the scale of atoms and molecules, and how can this behavior be used to create functional materials? This presentation introduces the fundamental concepts of nanotechnology through accessible comparisons, historical examples, and contemporary applications. Focusing on materials with characteristic dimensions of approximately 1–100 nm, it explains how decreasing size increases the importance of surfaces and can alter electronic and optical properties. These concepts provide a framework for understanding the relationships between nanoscale structure, material properties, and technological function.<br><br>Metal nanoparticles illustrate how controlling size, shape, and composition changes the interaction of matter with light. Historical examples, including the Lycurgus Cup and stained glass, connect the longstanding use of nanoscale materials with modern explanations of their distinctive colors. Localized surface plasmon resonance is introduced as the collective oscillation of conduction electrons driven by light, providing a basis for understanding the optical behavior of gold and silver nanoparticles. The presentation also outlines major approaches to nanoparticle preparation, contrasting bottom-up chemical synthesis with physical production methods such as laser ablation and plasma processing. Particular attention is given to the role of surface ligands in stabilizing nanoparticles and controlling their growth and dispersion. Applications include silver-based antibacterial materials and gold nanoparticle labels for diagnostic assays.<br><br>Semiconductor quantum dots provide a complementary example of size-dependent behavior arising from quantum confinement. The presentation discusses their tunable optical properties, preparation by colloidal synthesis and epitaxial growth, and use as fluorescent labels in biological imaging. Surface modification and silica encapsulation are introduced as strategies for adapting nanoparticles to biological environments, with attention to the challenges associated with potentially toxic compositions. The discussion then turns to nature-inspired nanotechnology, highlighting how hierarchical structures and nanoscale interactions contribute to adhesion, refractive-index modulation, and structural coloration.<br><br>Finally, the presentation introduces the experimental tools used to investigate the nanoworld, including scanning and transmission electron microscopy, spectroscopy, and particle-sizing techniques. By connecting synthesis, characterization, and applications, it offers an interdisciplinary overview of how nanoscale design enables new material functions. The central aim is to develop an intuitive understanding of why size matters and how the controlled organization of matter at the nanoscale links fundamental chemistry and physics with practical technologies.'
    }
  },
  'andrei-mereshchenko': {
    name: 'Dr. Andrey Mereshchenko',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Faculty Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 1 (26 Oct) · 14:30 - 15:30 (Presencial)',
      day_en: 'Day 1 (Oct 26) · 14:30 - 15:30 (In-Person)',
      title: 'Introduction to Nanotechnology',
      title_en: 'Introduction to Nanotechnology',
      abstract: 'How does matter behave when its dimensions approach the scale of atoms and molecules, and how can this behavior be used to create functional materials? This presentation introduces the fundamental concepts of nanotechnology through accessible comparisons, historical examples, and contemporary applications. Focusing on materials with characteristic dimensions of approximately 1–100 nm, it explains how decreasing size increases the importance of surfaces and can alter electronic and optical properties. These concepts provide a framework for understanding the relationships between nanoscale structure, material properties, and technological function.<br><br>Metal nanoparticles illustrate how controlling size, shape, and composition changes the interaction of matter with light. Historical examples, including the Lycurgus Cup and stained glass, connect the longstanding use of nanoscale materials with modern explanations of their distinctive colors. Localized surface plasmon resonance is introduced as the collective oscillation of conduction electrons driven by light, providing a basis for understanding the optical behavior of gold and silver nanoparticles. The presentation also outlines major approaches to nanoparticle preparation, contrasting bottom-up chemical synthesis with physical production methods such as laser ablation and plasma processing. Particular attention is given to the role of surface ligands in stabilizing nanoparticles and controlling their growth and dispersion. Applications include silver-based antibacterial materials and gold nanoparticle labels for diagnostic assays.<br><br>Semiconductor quantum dots provide a complementary example of size-dependent behavior arising from quantum confinement. The presentation discusses their tunable optical properties, preparation by colloidal synthesis and epitaxial growth, and use as fluorescent labels in biological imaging. Surface modification and silica encapsulation are introduced as strategies for adapting nanoparticles to biological environments, with attention to the challenges associated with potentially toxic compositions. The discussion then turns to nature-inspired nanotechnology, highlighting how hierarchical structures and nanoscale interactions contribute to adhesion, refractive-index modulation, and structural coloration.<br><br>Finally, the presentation introduces the experimental tools used to investigate the nanoworld, including scanning and transmission electron microscopy, spectroscopy, and particle-sizing techniques. By connecting synthesis, characterization, and applications, it offers an interdisciplinary overview of how nanoscale design enables new material functions. The central aim is to develop an intuitive understanding of why size matters and how the controlled organization of matter at the nanoscale links fundamental chemistry and physics with practical technologies.',
      abstract_en: 'How does matter behave when its dimensions approach the scale of atoms and molecules, and how can this behavior be used to create functional materials? This presentation introduces the fundamental concepts of nanotechnology through accessible comparisons, historical examples, and contemporary applications. Focusing on materials with characteristic dimensions of approximately 1–100 nm, it explains how decreasing size increases the importance of surfaces and can alter electronic and optical properties. These concepts provide a framework for understanding the relationships between nanoscale structure, material properties, and technological function.<br><br>Metal nanoparticles illustrate how controlling size, shape, and composition changes the interaction of matter with light. Historical examples, including the Lycurgus Cup and stained glass, connect the longstanding use of nanoscale materials with modern explanations of their distinctive colors. Localized surface plasmon resonance is introduced as the collective oscillation of conduction electrons driven by light, providing a basis for understanding the optical behavior of gold and silver nanoparticles. The presentation also outlines major approaches to nanoparticle preparation, contrasting bottom-up chemical synthesis with physical production methods such as laser ablation and plasma processing. Particular attention is given to the role of surface ligands in stabilizing nanoparticles and controlling their growth and dispersion. Applications include silver-based antibacterial materials and gold nanoparticle labels for diagnostic assays.<br><br>Semiconductor quantum dots provide a complementary example of size-dependent behavior arising from quantum confinement. The presentation discusses their tunable optical properties, preparation by colloidal synthesis and epitaxial growth, and use as fluorescent labels in biological imaging. Surface modification and silica encapsulation are introduced as strategies for adapting nanoparticles to biological environments, with attention to the challenges associated with potentially toxic compositions. The discussion then turns to nature-inspired nanotechnology, highlighting how hierarchical structures and nanoscale interactions contribute to adhesion, refractive-index modulation, and structural coloration.<br><br>Finally, the presentation introduces the experimental tools used to investigate the nanoworld, including scanning and transmission electron microscopy, spectroscopy, and particle-sizing techniques. By connecting synthesis, characterization, and applications, it offers an interdisciplinary overview of how nanoscale design enables new material functions. The central aim is to develop an intuitive understanding of why size matters and how the controlled organization of matter at the nanoscale links fundamental chemistry and physics with practical technologies.'
    }
  },
  'benjamin-pusay': {
    name: 'Ing. Benjamín Pusay',
    affiliation: 'Investigador en Nanotecnología, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Nanotechnology Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 15:30 - 16:00 (Presencial)',
      day_en: 'Day 2 (Oct 27) · 15:30 - 16:00 (In-Person)',
      title: 'Innovación en Materiales Nanoestructurados para Aplicaciones Energéticas',
      title_en: 'Innovation in Nanostructured Materials for Energy Applications',
      abstract: 'Nuevas rutas de síntesis de nanomateriales para almacenamiento energético y dispositivos electroquímicos de nueva generación.',
      abstract_en: 'Novel synthesis routes of nanomaterials for energy storage and next-generation electrochemical devices.'
    }
  },
  'maria-fernanda-bosquez': {
    name: 'MSc. María Fernanda Bósquez',
    affiliation: 'Química & Investigadora, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    affiliation_en: 'Chemist & Researcher, School of Physical Sciences and Nanotechnology, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 16:00 - 16:30 (Presencial)',
      day_en: 'Day 2 (Oct 27) · 16:00 - 16:30 (In-Person)',
      title: 'Materiales carbonosos derivados de carboximetilcelulosa cargados con nanopartículas de ZnO para supercapacitores, estudio de la correlación entre la estructura y el rendimiento.',
      title_en: 'Carboxymethylcellulose-derived carbon materials loaded with ZnO nanoparticles for supercapacitors: study of the structure-performance correlation.',
      abstract: 'Estudio sobre la síntesis y evaluación de materiales carbonosos derivados de biopolímeros (carboximetilcelulosa) funcionalizados con nanopartículas de óxido de zinc (ZnO) para su aplicación en supercapacitores electroquímicos, analizando en detalle la correlación directa entre la estructura nanométrica y el rendimiento de almacenamiento energético.',
      abstract_en: 'Study on the synthesis and evaluation of biopolymer-derived carbon materials (carboxymethylcellulose) functionalized with zinc oxide (ZnO) nanoparticles for application in electrochemical supercapacitors, providing an in-depth analysis of the structure-performance correlation.'
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

      const isEn = currentLang === 'en';
      document.getElementById('modal-speaker-name').textContent = data.name;
      document.getElementById('modal-affiliation').textContent =
        isEn && data.affiliation_en ? data.affiliation_en : data.affiliation;

      const day1 = isEn && data.talk1.day_en ? data.talk1.day_en : data.talk1.day;
      const title1 = isEn && data.talk1.title_en ? data.talk1.title_en : data.talk1.title;
      const abs1 = isEn && data.talk1.abstract_en ? data.talk1.abstract_en : data.talk1.abstract;

      let talksHtml = `
        <div style="margin-bottom: 18px;">
          <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.1em;">${day1}</span>
          <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: #0f172a; margin: 4px 0 8px;">${title1}</h4>
          <p style="font-size: 13.5px; line-height: 1.65; color: #475569;">${abs1}</p>
        </div>
      `;

      if (data.talk2) {
        const day2 = isEn && data.talk2.day_en ? data.talk2.day_en : data.talk2.day;
        const title2 = isEn && data.talk2.title_en ? data.talk2.title_en : data.talk2.title;
        const abs2 = isEn && data.talk2.abstract_en ? data.talk2.abstract_en : data.talk2.abstract;

        talksHtml += `
          <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 14px;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.1em;">${day2}</span>
            <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: #0f172a; margin: 4px 0 8px;">${title2}</h4>
            <p style="font-size: 13.5px; line-height: 1.65; color: #475569;">${abs2}</p>
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   7. RESPONSIVE MOBILE NAVIGATION DRAWER
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

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   8. CALENDAR SYNC (.ics DOWNLOAD & GOOGLE CALENDAR)
   ========================================================================== */
function initCalendarSync() {
  const gcalBtn = document.getElementById('btn-gcal-sync');
  const icsBtn = document.getElementById('btn-ics-sync');

  if (gcalBtn) {
    gcalBtn.addEventListener('click', () => {
      const gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=NANOBRIDGE+YT+2026+-+IEEE+Nanotechnology+Council+Frontier+Summit&dates=20261026T140000Z/20261028T000000Z&details=NANOBRIDGE+YT+2026%3A+De+la+Nanociencia+a+Implantes+Biom%C3%A9dicos+y+Sociedades+de+IA.+IEEE+NTC+Student+Branch+Chapter+Yachay+Tech.&location=Universidad+Yachay+Tech%2C+Urcuqu%C3%AD%2C+Imbabura%2C+Ecuador';
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', () => {
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IEEE NTC Yachay Tech//NANOBRIDGE YT 2026//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:nanobridge-yt-2026@yachaytech.edu.ec',
        'DTSTAMP:20261020T000000Z',
        'DTSTART:20261026T140000Z',
        'DTEND:20261028T000000Z',
        'SUMMARY:NANOBRIDGE YT 2026 - IEEE Nanotechnology Council Summit',
        'DESCRIPTION:De la Nanociencia a Implantes Biomédicos y Sociedades de IA. Sede Presencial: Universidad Yachay Tech.',
        'LOCATION:Universidad Yachay Tech, Urcuquí, Imbabura, Ecuador',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NANOBRIDGE-YT-2026.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}



