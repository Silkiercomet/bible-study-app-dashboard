/* ─────────────────────────────────────────────────
   DEV PANEL — ESCENARIOS DE PRUEBA
   Cada escenario muta data.zone, data.past y
   data.registered, luego llama render() para
   reflejar el cambio en tiempo real.
   ───────────────────────────────────────────────── */
 
// Datos base compartidos por todos los escenarios
const DEV_BASE_PAST = [
  { id: 'p1', title: 'The Good Soil',       leader: 'Elias Ocasio', church: 'Life Church',    start: now - 7  * DAY },
  { id: 'p2', title: 'Faith Over Fear',     leader: 'Maria Torres',  church: 'Grace Chapel',   start: now - 14 * DAY },
  { id: 'p3', title: 'Romans: Ch. 8',       leader: 'James Okafor',  church: 'New Hope Bible', start: now - 21 * DAY }
];
 
// Mapa de escenarios —  cada entrada describe qué
// debe mostrar el dashboard al activarse.
const DEV_SCENARIOS = {
  live: {
    label: 'Live now',
    ledColor: '#0FA8A8',
    tabDotClass: 'active-live',
    registered: true,
    zone: [{
      id: 'z-live', title: 'The Good Soil', leader: 'Elias Ocasio',
      church: 'Life Church', lifecycle: 'live',
      start: now - 6 * MIN, startedAgo: 6 * MIN, inRoom: 8,
      participants: [
        { id: 'u-011', initials: 'EO', name: 'Elias Ocasio' },
        { id: 'u-022', initials: 'LC', name: 'Laura Chen'   },
        { id: 'u-033', initials: 'GS', name: 'Grace Solano' },
        { id: 'u-044', initials: 'MR', name: 'Marcus Reid'  },
        { id: 'u-055', initials: 'TK', name: 'Tina Kwan'    }
      ]
    }],
    past: DEV_BASE_PAST
  },
  soon: {
    label: 'Starting soon',
    ledColor: '#FF6600',
    tabDotClass: 'active-soon',
    registered: true,
    zone: [{
      id: 'z-soon', title: 'The Good Soil', leader: 'Elias Ocasio',
      church: 'Life Church', lifecycle: 'soon',
      start: Date.now() + 20 * MIN
    }],
    past: DEV_BASE_PAST
  },
  soon5s: {
    label: 'Soon → Live (10 s)',
    ledColor: '#FF6600',
    tabDotClass: 'active-soon',
    registered: true,
    zone: [{
      id: 'z-soon5s', title: 'The Good Soil', leader: 'Elias Ocasio',
      church: 'Life Church', lifecycle: 'soon',
      start: 0 // sobreescrito dinámicamente en devApplyScenario
    }],
    past: DEV_BASE_PAST
  },
  finished: {
    label: 'Just finished',
    ledColor: '#A3ABB2',
    tabDotClass: 'active-finished',
    registered: true,
    zone: [{
      id: 'z-fin', title: 'The Good Soil', leader: 'Elias Ocasio',
      church: 'Life Church', lifecycle: 'finished',
      endedAgo: 22 * MIN
    }],
    past: DEV_BASE_PAST
  },
  combo: {
    label: 'Live + Soon + Finished',
    ledColor: '#e67e22',
    tabDotClass: 'active-combo',
    registered: true,
    zone: [
      {
        id: 'z-live2', title: 'The Good Soil', leader: 'Elias Ocasio',
        church: 'Life Church', lifecycle: 'live',
        start: now - 6 * MIN, startedAgo: 6 * MIN, inRoom: 8,
        participants: [
          { id: 'u-011', initials: 'EO', name: 'Elias Ocasio' },
          { id: 'u-022', initials: 'LC', name: 'Laura Chen'   },
          { id: 'u-033', initials: 'GS', name: 'Grace Solano' }
        ]
      },
      {
        id: 'z-soon2', title: 'Faith Over Fear', leader: 'Maria Torres',
        church: 'Grace Chapel', lifecycle: 'soon',
        start: now + 45 * MIN
      },
      {
        id: 'z-fin2', title: 'Romans: Ch. 8', leader: 'James Okafor',
        church: 'New Hope Bible', lifecycle: 'finished',
        endedAgo: 22 * MIN
      }
    ],
    past: DEV_BASE_PAST
  },
  idle: {
    label: 'Idle (no session)',
    ledColor: '#3D5878',
    tabDotClass: 'active-idle',
    registered: true,
    zone: [],
    past: DEV_BASE_PAST
  },
  noreg: {
    label: 'Unregistered',
    ledColor: '#FF6600',
    tabDotClass: 'active-noreg',
    registered: false,
    zone: [],
    past: []
  }
};
 
// Escenario activo en el dev panel
let devActiveScenario = 'live';
 
/* Aplica un escenario al data object y re-renderiza */
function devApplyScenario(key) {
  const sc = DEV_SCENARIOS[key];
  if (!sc) return;
 
  devActiveScenario = key;
 
  // Mutar data en lugar de reemplazarlo para mantener
  // compatibilidad con referencias externas al objeto
  data.registered = sc.registered;
  data.zone       = sc.zone.map(z => {
    const copy = { ...z };
    // soon5s: recalcular start en el momento del click para que
    // el countdown siempre arranque desde 10 s, no desde el load.
    if (key === 'soon5s') copy.start = Date.now() + 10_000;
    return copy;
  });
  data.past = sc.past.map(p => ({ ...p }));
 
  // Reset de state UI
  state.open    = new Set();
  state.popover = null;
 
  // Actualizar indicadores del panel
  devUpdateStatus(key, sc);
 
  // Mostrar/ocultar slider de presencia
  const presenceSection = document.getElementById('devPresenceSection');
  presenceSection.style.display = (key === 'live' || key === 'combo') ? 'block' : 'none';
 
  // Marcar botón activo
  document.querySelectorAll('#dev-panel .dev-btn[data-scenario]').forEach(b => {
    b.classList.toggle('active-scenario', b.dataset.scenario === key && b.textContent.includes(sc.label.split(' ')[0]));
  });
  // Marcar solo el primer botón del escenario que coincide exactamente
  document.querySelectorAll(`#dev-panel .dev-btn[data-scenario="${key}"]`).forEach((b, i) => {
    // El primer botón de cada data-scenario key es el definitorio
    b.classList.toggle('active-scenario', i === 0);
  });
 
  // Navegar al dashboard para ver el efecto
  showScreen('dashboard');
  render();
}
 
/* Actualiza los indicadores visuales del panel */
function devUpdateStatus(key, sc) {
  const led  = document.getElementById('devStatusLed');
  const name = document.getElementById('devStatusName');
  const dot  = document.getElementById('devTabDot');
 
  led.style.background  = sc.ledColor;
  led.style.boxShadow   = `0 0 0 3px ${sc.ledColor}33`;
  name.textContent      = sc.label;
 
  // Actualizar clase del dot del tab lateral
  dot.className = 'dev-tab-dot ' + sc.tabDotClass;
}
 
/* Event handlers del dev panel */
document.getElementById('dev-panel').addEventListener('click', e => {
  // Botón de escenario
  const scenarioBtn = e.target.closest('[data-scenario]');
  if (scenarioBtn) {
    devApplyScenario(scenarioBtn.dataset.scenario);
    return;
  }
 
  // Botón de pantalla
  const screenBtn = e.target.closest('[data-screen]');
  if (screenBtn) {
    showScreen(screenBtn.dataset.screen);
    return;
  }
 
  // Botón pin
  if (e.target.closest('#devPinBtn')) {
    const panel = document.getElementById('dev-panel');
    const btn   = document.getElementById('devPinBtn');
    panel.classList.toggle('pinned');
    btn.classList.toggle('pinned-on');
    btn.textContent = panel.classList.contains('pinned') ? 'unpin' : 'pin';
  }
});
 
// Slider de presencia — sincroniza inRoom y participants
document.getElementById('devPresenceSlider').addEventListener('input', function() {
  const val = parseInt(this.value);
  document.getElementById('devPresenceVal').textContent = val;
 
  // Pool de participantes ficticios para rellenar el array
  const POOL = [
    { id: 'u-011', initials: 'EO', name: 'Elias Ocasio'  },
    { id: 'u-022', initials: 'LC', name: 'Laura Chen'    },
    { id: 'u-033', initials: 'GS', name: 'Grace Solano'  },
    { id: 'u-044', initials: 'MR', name: 'Marcus Reid'   },
    { id: 'u-055', initials: 'TK', name: 'Tina Kwan'     },
    { id: 'u-066', initials: 'PD', name: 'Pedro Dias'    },
    { id: 'u-077', initials: 'AS', name: 'Aisha Stone'   },
    { id: 'u-088', initials: 'BN', name: 'Ben Nkosi'     }
  ];
 
  data.zone.forEach(z => {
    if (z.lifecycle === 'live') {
      z.inRoom       = val;
      // Proveer tantos participantes como haya en el pool, hasta val
      z.participants = POOL.slice(0, Math.min(val, POOL.length));
    }
  });
  render();
});