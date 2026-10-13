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
   1. INTERACTIVE MESH CANVAS (MALLA INTERACTIVA)
   Generates a living nanotech / molecular node network that responds to cursor
   ========================================================================== */
function initInteractiveMesh() {
  const canvas = document.getElementById('mesh-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: width / 2, y: height / 2, radius: 180 };
  let isMouseActive = false;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMouseActive = true;
    document.documentElement.style.setProperty('--pointer-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${e.clientY}px`);
  });

  window.addEventListener('mouseleave', () => {
    isMouseActive = false;
  });

  // Particle Node System
  const particleCount = Math.min(Math.floor(window.innerWidth / 18), 75);
  let particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1.2;
      this.baseColor = Math.random() > 0.4 ? 'rgba(23, 61, 69, 0.45)' : 'rgba(246, 164, 58, 0.6)';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse gentle interaction
      if (isMouseActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * 1.5;
          this.y -= (dy / distance) * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  initParticles();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting mesh lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 135) {
          const opacity = (1 - distance / 135) * 0.28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(23, 61, 69, ${opacity})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    // Connect particles to mouse
    if (isMouseActive) {
      for (let i = 0; i < particles.length; i++) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 140) {
          const opacity = (1 - distance / 140) * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(246, 164, 58, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. REAL-TIME COUNTDOWN TIMER
   Target: October 26, 2026, 10:00:00 (Ecuador UTC-5)
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-10-26T10:00:00-05:00').getTime();

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
    'hero-tagline': 'Películas delgadas en los Andes: La primera generación de nano-ingenieros conectando con la frontera científica mundial.',
    'hero-desc': 'Dos jornadas presenciales e híbridas con el Dr. José Miguel García-Martín (CSIC, Nanostine, IEEE NTC Distinguished Lecturer), Simon Heilles (MIT Critical Data / DENEM Labs) y destacados investigadores en la Universidad Yachay Tech.',
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
    'speakers-eyebrow': 'Comité Científico & Expositores',
    'speakers-title': 'Ponentes Destacados',
    'speakers-lead': 'Un panel interdisciplinario que une científicos del CSIC en España, investigadores del MIT Critical Data y docentes-investigadores de Yachay Tech e instituciones aliadas.',
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
    'lodging-title': 'Comparativo Financiero de Hospedaje en Urcuquí',
    'lodging-lead': 'Informe oficial consolidado de tarifas, capacidad hotelera y paquetes de referencia para asistentes y delegaciones durante NANOBRIDGE YT 2026.',
    'lodging-th-hotel': 'Hotel / Hostal',
    'lodging-th-rooms': 'Habitaciones',
    'lodging-th-beds': 'Plazas',
    'lodging-th-rate': 'Tarifa / Noche',
    'lodging-th-cost-night': 'Costo Hotel/Noche',
    'lodging-th-cost-2': 'Costo 2 Noches',
    'lodging-th-cost-3': 'Costo 3 Noches',
    'lodging-th-status': 'Estado',
    'lodging-accordion-btn': 'Ver Desglose Completo Habitación por Habitación',

    // Venue Section
    'venue-eyebrow': 'Sede del Evento',
    'venue-title': 'Universidad Yachay Tech',
    'venue-lead': 'Ubicada en la Ciudad del Conocimiento en Urcuquí, Imbabura. Primera universidad de investigación intensiva del Ecuador con laboratorios de vanguardia.',

    // Registration Box
    'reg-eyebrow': 'Inscripciones Abiertas',
    'reg-title': 'Asegura tu lugar en NANOBRIDGE YT 2026',
    'reg-desc': 'Participa de manera presencial en el campus de Yachay Tech o conéctate virtualmente a las transmisiones internacionales vía IEEE vTools. Se emitirá certificado con aval de IEEE Nanotechnology Council.',
    'reg-perk-1': 'Acceso a todas las plenarias técnicas y conferencias magistrales',
    'reg-perk-2': 'Participación en el NanoSkills Workshop práctico',
    'reg-perk-3': 'Certificado oficial avalado por IEEE NTC Student Branch y ponentes internacionales',
    'reg-btn-main': 'Completar Registro Oficial',
    'reg-btn-cal': 'Agregar a Google Calendar'
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
    'hero-tagline': 'Thin films in the Andes: The first generation of nano-engineers connecting with the global scientific frontier.',
    'hero-desc': 'Two in-person and hybrid conference days featuring Dr. José Miguel García-Martín (CSIC, Nanostine, IEEE NTC Distinguished Lecturer), Simon Heilles (MIT Critical Data / DENEM Labs), and prominent researchers at Yachay Tech University.',
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
    'speakers-eyebrow': 'Scientific Committee & Lecturers',
    'speakers-title': 'Featured Speakers',
    'speakers-lead': 'An interdisciplinary lineup connecting CSIC scientists from Spain, researchers from MIT Critical Data, and distinguished faculty members from Yachay Tech and partner institutions.',
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
    'lodging-eyebrow': 'Logistics & Lodging',
    'lodging-title': 'Financial Lodging Comparison in Urcuquí',
    'lodging-lead': 'Consolidated official report covering room inventories, occupancy capacities, and benchmark packages for delegations during NANOBRIDGE YT 2026.',
    'lodging-th-hotel': 'Hotel / Inn',
    'lodging-th-rooms': 'Rooms',
    'lodging-th-beds': 'Capacity',
    'lodging-th-rate': 'Rate / Night',
    'lodging-th-cost-night': 'Hotel Cost / Night',
    'lodging-th-cost-2': '2 Nights Total',
    'lodging-th-cost-3': '3 Nights Total',
    'lodging-th-status': 'Status',
    'lodging-accordion-btn': 'View Full Room-by-Room Breakdown',

    // Venue Section
    'venue-eyebrow': 'Official Venue',
    'venue-title': 'Yachay Tech University',
    'venue-lead': 'Located within the Knowledge City in Urcuquí, Imbabura. Ecuador’s premier research-intensive experimental university equipped with advanced cleanroom laboratories.',

    // Registration Box
    'reg-eyebrow': 'Registration Open',
    'reg-title': 'Secure your seat at NANOBRIDGE YT 2026',
    'reg-desc': 'Join us in-person at Yachay Tech campus or attend virtually via global IEEE vTools streams. Certified attendance granted by IEEE Nanotechnology Council.',
    'reg-perk-1': 'Access to all keynote plenaries and technical sessions',
    'reg-perk-2': 'Hands-on participation in the NanoSkills Workshop',
    'reg-perk-3': 'Official certificate endorsed by IEEE NTC Student Branch and international keynote speakers',
    'reg-btn-main': 'Complete Official Registration',
    'reg-btn-cal': 'Add to Google Calendar'
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
      day: 'Día 1 (26 Oct) · 11:30 - 13:00',
      title: 'Nanostructured Columnar Thin Films and Antibacterial Surfaces: From Sputtering Physics to Biomedical Implants',
      abstract: 'Revisión exhaustiva de los fundamentos de síntesis de películas delgadas columnares nanoestructuradas mediante pulverización catódica (magnetron sputtering) en incidencia oblicua (OAD/GLAD). Se analizan sus propiedades mecánicas, ópticas y su capacidad antibacteriana pasiva: reducción crítica de adhesión bacteriana y prevención de biopelículas en implantes de titanio grado médico sin uso de agentes químicos antibióticos.'
    },
    talk2: {
      day: 'Día 2 (27 Oct) · 10:00 - 11:30',
      title: 'From the Academic Laboratory to Deep-Tech Spin-Offs: The Nanostine Journey',
      abstract: 'Conferencia orientada a investigadores, posgraduados y estudiantes sobre transferencia tecnológica, valorización de propiedad intelectual y el camino de creación de empresas de base tecnológica (spin-offs) a partir de patentes científicas en nanociencia, detallando el modelo de negocio y escalamiento de Nanostine.'
    }
  },
  'simon-heilles': {
    name: 'Simon Heilles',
    affiliation: 'MIT Critical Data (Cambridge, MA) · Lead AI Systems Architect en DENEM Labs',
    talk1: {
      day: 'Día 1 (26 Oct) · 14:00 - 15:30',
      title: 'Autonomous Nanotechnology Laboratory: AI agents for closed-loop physical experimentation and scientific discovery',
      abstract: 'Exploración de arquitecturas de agentes de inteligencia artificial que trascienden el mero análisis de datos para transformarse en participantes activos de la experimentación científica. El laboratorio se concibe como un sistema en bucle cerrado: objetivo científico → hipótesis → diseño experimental → simulación digital twin → experimentación física → medición y caracterización → análisis → siguiente iteración.'
    },
    talk2: {
      day: 'Día 2 (27 Oct) · 14:00 - 15:30',
      title: 'Societies of AI Agents: Measuring influence, reputation, and emergent social behavior between autonomous agents',
      abstract: 'A medida que los agentes de IA se comunican, delegan, negocian y transfieren información, la unidad de estudio relevante pasa a ser la sociedad de agentes. Se propone una agenda de investigación empírica inspirada en la psicología social y la ciencia de redes para medir influencia, reputación, conformidad y cascadas de información.'
    }
  },
  'edwin-valarezo': {
    name: 'Dr. Edwin Valarezo Añazco',
    affiliation: 'Presidente de IEEE EMBS (Engineering in Medicine and Biology Society) - Sección Ecuador',
    talk1: {
      day: 'Día 1 (26 Oct) · 15:30 - 16:30 (Virtual)',
      title: 'Fronteras en Ingeniería Biomédica y Ecosistema de Salud en Ecuador',
      abstract: 'Panorama estratégico sobre la convergencia de dispositivos biomédicos, sensores nanotecnológicos y sistemas de salud pública en el contexto ecuatoriano y latinoamericano.'
    }
  },
  'jose-torres': {
    name: 'Dr. José Torres',
    affiliation: 'Investigador en Nanotecnología Aplicada (Universidad Alemana)',
    talk1: {
      day: 'Día 2 (27 Oct) · 12:00 - 13:00 (Virtual)',
      title: 'Avances Internacionales en Caracterización y Métodos Avanzados en Nanociencia',
      abstract: 'Técnicas avanzadas de caracterización a escala nanométrica en centros de investigación europeos y su articulación con proyectos experimentales de la región andina.'
    }
  },
  'carlos-reinoso': {
    name: 'Prof. Carlos Reinoso',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    talk1: {
      day: 'Día 1 (26 Oct) · 10:00 - 11:00 (Presencial)',
      title: 'Líneas de Investigación en Nanomateriales y Fabricación Local',
      abstract: 'Desarrollo de capacidades experimentales en Yachay Tech, líneas estratégicas de síntesis de nanomateriales y soluciones diseñadas para las problemáticas industriales y ambientales del Ecuador.'
    }
  },
  'edwin-chimborazo': {
    name: 'Edwin Chimborazo',
    affiliation: 'Investigador en Nanociencia y Fabricación',
    talk1: {
      day: 'Día 1 (26 Oct) · 16:30 - 17:30 (Presencial)',
      title: 'Desarrollo de Nanotecnología y Aplicaciones Regionales',
      abstract: 'Experiencias de modelado y aplicación práctica de nanotecnología en el sector productivo y académico regional.'
    }
  },
  'andrei-mereshchenko': {
    name: 'Prof. Andrey Mereshchenko',
    affiliation: 'Docente-Investigador, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 15:30 - 16:30 (Presencial)',
      title: 'Fotoquímica, Luminiscencia y Dinámica Ultrarrápida en Nanomateriales',
      abstract: 'Estudio de la dinámica de excitones en nanocompuestos coloidales, fotofísica de complejos metálicos y aplicaciones en sensores espectroscópicos avanzados, respaldado por más de 1900 citas y un índice h de 24.'
    }
  },
  'benjamin-pusay': {
    name: 'Benjamín Pusay',
    affiliation: 'Investigador en Materiales Avanzados, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 16:30 - 17:30 (Presencial)',
      title: 'Innovación en Materiales Nanoestructurados para Aplicaciones Energéticas',
      abstract: 'Avances recientes en síntesis y modelado de materiales avanzados con impacto en remediación y sustentabilidad.'
    }
  },
  'maria-fernanda-bosquez': {
    name: 'MSc. María Fernanda Bósquez-Cáceres',
    affiliation: 'Química & Investigadora, Escuela de Ciencias Físicas y Nanotecnología, Yachay Tech',
    talk1: {
      day: 'Día 2 (27 Oct) · 17:30 - 18:30 (Presencial)',
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
          <span style="font-size: 11px; font-weight: 700; color: #f6a43a; text-transform: uppercase;">${data.talk1.day}</span>
          <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: #173d45; margin: 4px 0 8px;">${data.talk1.title}</h4>
          <p style="font-size: 13.5px; line-height: 1.65; color: #466562;">${data.talk1.abstract}</p>
        </div>
      `;

      if (data.talk2) {
        talksHtml += `
          <div style="border-top: 1px solid rgba(23,61,69,0.12); padding-top: 14px; margin-top: 14px;">
            <span style="font-size: 11px; font-weight: 700; color: #f6a43a; text-transform: uppercase;">${data.talk2.day}</span>
            <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: #173d45; margin: 4px 0 8px;">${data.talk2.title}</h4>
            <p style="font-size: 13.5px; line-height: 1.65; color: #466562;">${data.talk2.abstract}</p>
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
        'IEEE Nanotechnology Council Distinguished Lecturer Program & Frontier Summit con el Dr. José Miguel García-Martín (CSIC) y Simon Heilles (MIT Critical Data) en Yachay Tech University.'
      );
      const location = encodeURIComponent('Universidad Yachay Tech, Urcuquí, Imbabura, Ecuador');
      // Starts 2026-10-26 10:00 ECT (15:00 UTC) to 2026-10-27 19:00 ECT (2026-10-28 00:00 UTC)
      const dates = '20261026T150000Z/20261028T000000Z';
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
    'DTSTART:20261026T150000Z',
    'DTEND:20261028T000000Z',
    'SUMMARY:NANOBRIDGE YT 2026 · IEEE NTC Distinguished Lecturer Program & Frontier Summit',
    'DESCRIPTION:Cumbre científica con Dr. José Miguel García-Martín (CSIC / IEEE DL) y Simon Heilles (MIT Critical Data) en Yachay Tech.',
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
