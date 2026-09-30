/* =========================================================
   ESCUADRÓN RESPETO · Motor del juego (shoot 'em up estilo Gradius)
   ========================================================= */
(() => {
  'use strict';

  const W = 960, H = 540;
  const $ = (s) => document.querySelector(s);
  const cv = $('#juego');
  const ctx = cv.getContext('2d');
  const escenario = $('#escenario');
  const FUENTE = '600 15px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const FUENTE_CAT = '700 10px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const MONO = '700 16px ui-monospace, Menlo, Consolas, monospace';

  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const barajar = (arr) => { const r = arr.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
  const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* ---------- Poderes ---------- */
  const PODERES = {
    velocidad: { nombre: 'Acción oportuna', efecto: 'Velocidad de la nave +1 (máx. 3)', color: '#3be8b0', letra: 'V' },
    multiple:  { nombre: 'Palabras que suman', efecto: 'Disparo múltiple (doble y luego en abanico)', color: '#ffd23f', letra: 'M' },
    laser:     { nombre: 'Voz clara', efecto: 'Láser que atraviesa varias frases', color: '#4cc9f0', letra: 'L' },
    escudo:    { nombre: 'Empatía', efecto: 'Escudo que resiste 3 impactos', color: '#b388ff', letra: 'E' },
    aliado:    { nombre: 'Red de apoyo', efecto: 'Nave aliada que te sigue y dispara (máx. 2)', color: '#ff8fab', letra: 'A' },
    bonus:     { nombre: 'Conciencia plena', efecto: '+2000 puntos (ya tienes todos los poderes)', color: '#ffffff', letra: '+' }
  };

  /* ---------- Escalado ---------- */
  function ajustar() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / W, vh / H);
    const cw = Math.round(W * s), ch = Math.round(H * s);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    escenario.style.width = cw + 'px';
    escenario.style.height = ch + 'px';
    cv.width = Math.round(cw * dpr);
    cv.height = Math.round(ch * dpr);
    ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    escalaCSS = s;
  }
  let escalaCSS = 1;
  window.addEventListener('resize', ajustar);
  window.addEventListener('orientationchange', () => setTimeout(ajustar, 250));
  ajustar();

  /* ---------- Sonido (sintetizado, sin archivos) ---------- */
  let actx = null;
  let mudo = leer('er_mudo') === '1';
  function sonido(f = 440, d = 0.08, tipo = 'square', v = 0.04, desliz = 0) {
    if (mudo) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = tipo;
      o.frequency.setValueAtTime(f, t);
      if (desliz) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + desliz), t + d);
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + d + 0.02);
    } catch (e) { /* audio no disponible */ }
  }
  const sfx = {
    disparo: () => sonido(880, 0.05, 'square', 0.012, -300),
    golpe: () => sonido(300, 0.05, 'square', 0.03, -120),
    explota: () => sonido(160, 0.3, 'sawtooth', 0.05, -120),
    capsula: () => { sonido(660, 0.1, 'triangle', 0.06); setTimeout(() => sonido(990, 0.14, 'triangle', 0.06), 90); },
    bien: () => { sonido(523, 0.12, 'triangle', 0.07); setTimeout(() => sonido(659, 0.12, 'triangle', 0.07), 110); setTimeout(() => sonido(784, 0.2, 'triangle', 0.07), 220); },
    mal: () => sonido(220, 0.35, 'sine', 0.07, -80),
    dano: () => sonido(120, 0.4, 'sawtooth', 0.08, -60),
    alerta: () => { for (let i = 0; i < 3; i++) setTimeout(() => sonido(440, 0.25, 'square', 0.04, 220), i * 380); }
  };

  /* ---------- Estado ---------- */
  let estado = 'menu';
  let tiempo = 0;
  let J, balas, enemigos, balasEnem, capsulas, particulas, textos, jefe, N, stats, puntos, vidas, mazo, idxMazo, nivelIdx = 0;
  let bolsaFrases = [];
  let sigId = 1;
  let ultimoSonidoDisparo = 0;
  const teclas = {};
  let punteroDX = 0, punteroDY = 0;

  const estrellas = [];
  for (let i = 0; i < 110; i++) estrellas.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() });

  /* ---------- Partida y niveles ---------- */
  function nuevaPartida() {
    puntos = 0; vidas = 3; nivelIdx = 0;
    stats = { eliminadas: 0, correctas: 0, respondidas: 0, transformadas: [] };
    mazo = barajar(PREGUNTAS); idxMazo = 0;
    J = { x: 130, y: H / 2, vel: 0, disparo: 1, laser: false, escudo: 0, aliados: 0, inv: 1.5, cd: 0, rastro: [] };
    iniciarNivel();
  }

  function iniciarNivel() {
    const cfg = NIVELES[nivelIdx];
    balas = []; enemigos = []; balasEnem = []; capsulas = []; particulas = []; textos = []; jefe = null;
    N = { cfg, bajas: 0, meta: cfg.meta, spawnT: 1.5, jefeLanzado: false, alertaT: 0, sinCapsula: 0, finT: 0 };
    J.x = 130; J.y = H / 2; J.inv = 1.5; J.rastro = [];
    estado = 'jugando';
    mostrarCapa(null);
    texto(W / 2, H / 2 - 20, cfg.nombre, '#ffffff', 2.4, 26);
  }

  /* ---------- Creación de entidades ---------- */
  function siguienteFrase() { if (!bolsaFrases.length) bolsaFrases = barajar(FRASES); return bolsaFrases.pop(); }

  function crearEnemigo(y, x) {
    const f = siguienteFrase();
    ctx.font = FUENTE;
    const w = Math.ceil(ctx.measureText(f.t).width) + 40, h = 34;
    const n = nivelIdx;
    const hp = 1 + (Math.random() < 0.2 + n * 0.2 ? 1 : 0) + (n >= 2 && Math.random() < 0.3 ? 1 : 0);
    const patrones = n === 0 ? ['recto', 'onda'] : ['recto', 'onda', 'acecho'];
    const amp = rnd(25, 65);
    const yy = y !== undefined ? y : rnd(70, H - 60);
    const e = {
      id: sigId++, x: x !== undefined ? x : W + w / 2 + 10, y: yy, w, h,
      vx: -(rnd(85, 130) + n * 22), pat: patrones[Math.floor(Math.random() * patrones.length)],
      t: Math.random() * 6, amp, base: clamp(yy, 60 + amp, H - 50 - amp), hp, hpMax: hp, f,
      portador: Math.random() < 0.2, dispara: n >= 1 && Math.random() < 0.25 + n * 0.12, cdD: rnd(1, 2.5), flash: 0
    };
    enemigos.push(e);
  }

  function balaEnemiga(x, y, v, angulo) {
    const a = angulo !== undefined ? angulo : Math.atan2(J.y - y, J.x - x);
    balasEnem.push({ x, y, w: 9, h: 9, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
  }

  function explosion(x, y, color, n = 18, fuerza = 180) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = rnd(40, fuerza);
      particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, vida: rnd(0.35, 0.8), color: Math.random() < 0.5 ? color : '#ffd23f', r: rnd(1.5, 3.5) });
    }
  }

  function texto(x, y, txt, color, vida = 1.6, tam = 15) { textos.push({ x, y, txt, color, t: 0, vida, tam }); }

  /* ---------- Disparo del jugador ---------- */
  function disparar(x, y, principal) {
    const ys = principal && J.disparo >= 2 ? [y - 6, y + 6] : [y];
    for (const yy of ys) {
      if (J.laser) balas.push({ x: x + 26, y: yy, w: 56, h: 4, vx: 950, vy: 0, dmg: 1, laser: true, golpes: new Set() });
      else balas.push({ x, y: yy, w: 14, h: 4, vx: 760, vy: 0, dmg: 1 });
    }
    if (principal && J.disparo >= 3) {
      balas.push({ x, y: y - 4, w: 10, h: 4, vx: 680, vy: -260, dmg: 1 });
      balas.push({ x, y: y + 4, w: 10, h: 4, vx: 680, vy: 260, dmg: 1 });
    }
  }

  function posAliado(i) {
    const k = 12 * (i + 1);
    const p = J.rastro[Math.min(k, J.rastro.length - 1)] || J;
    return { x: p.x - 10, y: p.y + (i === 0 ? -26 : 26) };
  }

  /* ---------- Daños ---------- */
  function danarEnemigo(e, d) {
    e.hp -= d; e.flash = 0.08;
    if (e.hp <= 0) matarEnemigo(e); else sfx.golpe();
  }

  function matarEnemigo(e) {
    puntos += 100 * e.hpMax;
    stats.eliminadas++;
    N.bajas++;
    sfx.explota();
    explosion(e.x, e.y, e.portador ? '#ff9f1c' : '#ff4d8d', 22);
    texto(e.x, e.y, e.f.r, '#7cffb2', 1.9, 16);
    if (!stats.transformadas.some((x) => x.t === e.f.t)) stats.transformadas.push(e.f);
    N.sinCapsula++;
    if (e.portador || N.sinCapsula >= 9) {
      capsulas.push({ x: e.x, y: e.y, w: 32, h: 20, t: 0 });
      N.sinCapsula = 0;
    }
  }

  function golpearJugador() {
    if (J.inv > 0 || estado !== 'jugando') return;
    if (J.escudo > 0) {
      J.escudo--; J.inv = 1;
      sonido(260, 0.18, 'sine', 0.06);
      explosion(J.x, J.y, '#b388ff', 12, 120);
      return;
    }
    vidas--;
    sfx.dano();
    explosion(J.x, J.y, '#4cc9f0', 40, 260);
    J.inv = 2.6;
    J.disparo = Math.max(1, J.disparo - 1);
    J.laser = false;
    J.aliados = Math.max(0, J.aliados - 1);
    J.vel = Math.max(0, J.vel - 1);
    balasEnem = [];
    if (vidas <= 0) { estado = 'muriendo'; setTimeout(() => terminar(false), 1200); }
    else texto(J.x + 40, J.y - 30, 'Perdiste un poder', '#ff8fab', 1.4, 14);
  }

  /* ---------- Jefe ---------- */
  function lanzarJefe() {
    N.jefeLanzado = true; N.alertaT = 3;
    const c = N.cfg;
    jefe = { x: W + 140, y: H / 2, w: 180, h: 190, hp: c.hpJefe, hpMax: c.hpJefe, nombre: c.jefe, color: c.color, t: 0, cdD: 2.5, cdS: 3.5, flash: 0, activo: false };
    sfx.alerta();
  }

  function danarJefe(d) {
    if (!jefe || !jefe.activo) return;
    jefe.hp -= d; jefe.flash = 0.06; puntos += 10;
    if (jefe.hp <= 0) {
      puntos += 3000 * (nivelIdx + 1);
      const { x, y, color } = jefe;
      for (let i = 0; i < 6; i++) setTimeout(() => { explosion(x + rnd(-70, 70), y + rnd(-70, 70), color, 30, 280); sfx.explota(); }, i * 160);
      texto(x - 60, y, 'Superaste ' + jefe.nombre.toLowerCase(), '#7cffb2', 2.4, 20);
      jefe = null;
      balasEnem = [];
      enemigos.forEach((e) => { explosion(e.x, e.y, '#ff4d8d', 10); });
      enemigos = [];
      N.finT = 2.6;
    }
  }

  function actualizarJefe(dt) {
    const b = jefe;
    b.t += dt; b.flash -= dt;
    if (b.x > 790) { b.x -= 110 * dt; } else { b.activo = true; }
    b.y = H / 2 + Math.sin(b.t * 0.8) * (H / 2 - 130);
    if (!b.activo) return;
    b.cdD -= dt;
    if (b.cdD <= 0) {
      const n = 3 + nivelIdx * 2;
      const base = Math.atan2(J.y - b.y, J.x - (b.x - 90));
      for (let i = 0; i < n; i++) balaEnemiga(b.x - 90, b.y, 190 + nivelIdx * 25, base + (i - (n - 1) / 2) * 0.2);
      b.cdD = 2.1 - nivelIdx * 0.35;
      sonido(200, 0.12, 'square', 0.03, -60);
    }
    b.cdS -= dt;
    if (b.cdS <= 0) {
      crearEnemigo(clamp(b.y + rnd(-70, 70), 70, H - 60), b.x - 150);
      b.cdS = 4.2 - nivelIdx * 0.7;
    }
  }

  /* ---------- Actualización ---------- */
  const choca = (a, b) => Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;

  function actualizar(dt) {
    tiempo += dt;
    for (const s of estrellas) {
      s.x -= (15 + s.z * 90) * dt * (estado === 'jugando' || estado === 'menu' ? 1 : 0.2);
      if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
    }
    // efectos visuales siguen corriendo al morir
    if (estado === 'jugando' || estado === 'muriendo') {
      for (const p of particulas) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97; }
      particulas = particulas.filter((p) => p.t < p.vida);
      for (const t of textos) { t.t += dt; t.y -= 28 * dt; }
      textos = textos.filter((t) => t.t < t.vida);
    }
    if (estado !== 'jugando') return;

    // Movimiento del jugador
    const v = 250 + J.vel * 70;
    let dx = 0, dy = 0;
    if (teclas.arrowleft || teclas.a) dx -= 1;
    if (teclas.arrowright || teclas.d) dx += 1;
    if (teclas.arrowup || teclas.w) dy -= 1;
    if (teclas.arrowdown || teclas.s) dy += 1;
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }
    const sens = 1.15 + J.vel * 0.2;
    J.x += dx * v * dt + punteroDX * sens;
    J.y += dy * v * dt + punteroDY * sens;
    punteroDX = punteroDY = 0;
    J.x = clamp(J.x, 30, W - 40);
    J.y = clamp(J.y, 58, H - 22);
    J.rastro.unshift({ x: J.x, y: J.y });
    if (J.rastro.length > 40) J.rastro.length = 40;
    J.inv = Math.max(0, J.inv - dt);

    // Disparo automático
    J.cd -= dt;
    if (J.cd <= 0) {
      disparar(J.x + 22, J.y, true);
      for (let i = 0; i < J.aliados; i++) { const p = posAliado(i); disparar(p.x + 10, p.y, false); }
      J.cd = J.laser ? 0.17 : 0.2;
      if (tiempo - ultimoSonidoDisparo > 0.18) { sfx.disparo(); ultimoSonidoDisparo = tiempo; }
    }

    // Balas
    for (const b of balas) { b.x += b.vx * dt; b.y += b.vy * dt; }
    balas = balas.filter((b) => b.x < W + 60 && b.y > -20 && b.y < H + 20);

    // Aparición de enemigos
    if (!N.jefeLanzado) {
      N.spawnT -= dt;
      if (N.spawnT <= 0 && N.bajas + enemigos.length < N.meta + 4) {
        crearEnemigo();
        if (nivelIdx >= 1 && Math.random() < 0.25) crearEnemigo();
        N.spawnT = Math.max(0.6, 1.7 - nivelIdx * 0.3 - Math.random() * 0.4);
      }
      if (N.bajas >= N.meta) {
        // deja de generar y espera a que se despeje la pantalla
        N.spawnT = 99;
        if (enemigos.length === 0) lanzarJefe();
      }
    }

    // Enemigos
    for (const e of enemigos) {
      e.t += dt; e.x += e.vx * dt; e.flash -= dt;
      if (e.pat === 'onda') e.y = e.base + Math.sin(e.t * 2.2) * e.amp;
      else if (e.pat === 'acecho') e.y = clamp(e.y + Math.sign(J.y - e.y) * 45 * dt, 60, H - 40);
      if (e.dispara && e.x < W - 30 && e.x > J.x + 120) {
        e.cdD -= dt;
        if (e.cdD <= 0) { balaEnemiga(e.x - e.w / 2, e.y, 170 + nivelIdx * 25); e.cdD = rnd(2, 3.5); }
      }
    }

    // Jefe
    if (jefe) actualizarJefe(dt);
    if (N.alertaT > 0) N.alertaT -= dt;

    // Colisiones: balas del jugador
    for (const b of balas) {
      if (b.muerta) continue;
      for (const e of enemigos) {
        if (e.hp <= 0) continue;
        if (b.laser && b.golpes.has(e.id)) continue;
        if (choca(b, e)) {
          danarEnemigo(e, b.dmg);
          if (b.laser) b.golpes.add(e.id); else { b.muerta = true; break; }
        }
      }
      if (!b.muerta && jefe && choca(b, jefe)) {
        if (jefe.activo) { danarJefe(b.laser ? 1.4 : 1); sfx.golpe(); }
        b.muerta = true;
      }
    }
    balas = balas.filter((b) => !b.muerta);
    enemigos = enemigos.filter((e) => e.hp > 0 && e.x + e.w / 2 > -30);

    // Balas enemigas
    const hitJ = { x: J.x, y: J.y, w: 28, h: 12 };
    for (const b of balasEnem) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (choca(b, hitJ)) { b.muerta = true; golpearJugador(); }
    }
    balasEnem = balasEnem.filter((b) => !b.muerta && b.x > -20 && b.x < W + 20 && b.y > -20 && b.y < H + 20);

    // Choque con cuerpos
    for (const e of enemigos) if (choca(e, hitJ)) { golpearJugador(); danarEnemigo(e, 2); }
    enemigos = enemigos.filter((e) => e.hp > 0);
    if (jefe && choca(jefe, hitJ)) golpearJugador();

    // Cápsulas
    const recoge = { x: J.x, y: J.y, w: 50, h: 34 };
    for (const c of capsulas) {
      c.x -= 70 * dt; c.t += dt;
      if (estado === 'jugando' && choca(c, recoge)) { c.muerta = true; abrirQuiz(); }
    }
    capsulas = capsulas.filter((c) => !c.muerta && c.x > -30);

    // Fin del nivel
    if (N.finT > 0) {
      N.finT -= dt;
      if (N.finT <= 0) nivelSuperado();
    }
  }

  /* ---------- Dibujo ---------- */
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }

  function dibujarNave(x, y, c1, c2, s = 1, llama = true) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (llama) {
      const f = 8 + Math.random() * 8;
      ctx.fillStyle = '#ffb703';
      ctx.beginPath(); ctx.moveTo(-22, -4); ctx.lineTo(-22 - f, 0); ctx.lineTo(-22, 4); ctx.fill();
    }
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-16, -19); ctx.lineTo(-22, -19); ctx.lineTo(-14, -6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2, 8); ctx.lineTo(-16, 19); ctx.lineTo(-22, 19); ctx.lineTo(-14, 6); ctx.fill();
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-4, -11); ctx.lineTo(-22, -7); ctx.lineTo(-22, 7); ctx.lineTo(-4, 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e0fbfc';
    ctx.beginPath(); ctx.ellipse(5, 0, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function dibujarFondo() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b0620'); g.addColorStop(1, '#170a33');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const n = ctx.createRadialGradient(W * 0.72, H * 0.3, 10, W * 0.72, H * 0.3, 360);
    n.addColorStop(0, 'rgba(179,136,255,0.13)'); n.addColorStop(1, 'rgba(179,136,255,0)');
    ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
    for (const s of estrellas) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + s.z * 0.75) + ')';
      const t = 1 + s.z * 1.6;
      ctx.fillRect(s.x, s.y, t * (1 + s.z * 2), t);
    }
  }

  function dibujarEnemigo(e) {
    const { x, y, w, h } = e;
    const col = e.portador ? '#ff9f1c' : '#ff4d8d';
    ctx.save();
    ctx.shadowColor = col; ctx.shadowBlur = 14;
    ctx.fillStyle = e.flash > 0 ? '#ffffff' : (e.portador ? '#4a2300' : '#3a0a24');
    rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x - w / 2 - 12, y); ctx.lineTo(x - w / 2 + 6, y - 8); ctx.lineTo(x - w / 2 + 6, y + 8); ctx.fill();
    ctx.fillRect(x + w / 2 - 4, y - h / 2 - 5, 10, 4);
    ctx.fillRect(x + w / 2 - 4, y + h / 2 + 1, 10, 4);
    ctx.font = FUENTE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = e.flash > 0 ? '#3a0a24' : '#ffffff';
    ctx.fillText(e.f.t, x + 4, y + 1);
    ctx.font = FUENTE_CAT; ctx.fillStyle = col;
    ctx.fillText(e.f.c.toUpperCase(), x, y - h / 2 - 9);
    if (e.hpMax > 1) {
      for (let i = 0; i < e.hpMax; i++) {
        ctx.fillStyle = i < e.hp ? col : 'rgba(255,255,255,.2)';
        ctx.fillRect(x - (e.hpMax * 8) / 2 + i * 8, y + h / 2 + 4, 6, 3);
      }
    }
    ctx.restore();
  }

  function dibujarCapsula(c) {
    ctx.save(); ctx.translate(c.x, c.y);
    const p = 1 + Math.sin(c.t * 8) * 0.08;
    ctx.scale(p, p);
    ctx.shadowColor = '#ff9f1c'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff9f1c';
    rr(-16, -10, 32, 20, 10); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff3d6'; rr(-16, -10, 16, 20, 10); ctx.fill();
    ctx.fillStyle = '#3a1500'; ctx.font = '900 14px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);
    ctx.restore();
  }

  function dibujarJefe(b) {
    ctx.save(); ctx.translate(b.x, b.y);
    const pul = 1 + Math.sin(tiempo * 6) * 0.06;
    ctx.shadowColor = b.color; ctx.shadowBlur = 28;
    ctx.fillStyle = b.flash > 0 ? '#ffffff' : '#1b0b2e';
    const hw = b.w / 2, hh = b.h / 2;
    ctx.beginPath();
    ctx.moveTo(-hw, -30); ctx.lineTo(-hw + 50, -hh); ctx.lineTo(hw, -hh + 20); ctx.lineTo(hw, hh - 20); ctx.lineTo(-hw + 50, hh); ctx.lineTo(-hw, 30);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = b.color; ctx.stroke();
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(-hw + 20, 0, 18 * pul, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-hw + 20, 0, 7 * pul, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.flash > 0 ? '#1b0b2e' : '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const partes = b.nombre.split(' ');
    ctx.font = '700 13px system-ui, sans-serif'; ctx.fillText(partes[0], 25, -22);
    const nombre = partes.slice(1).join(' ');
    let tam = 19; ctx.font = '900 ' + tam + 'px system-ui, sans-serif';
    while (ctx.measureText(nombre).width > 128 && tam > 11) { tam--; ctx.font = '900 ' + tam + 'px system-ui, sans-serif'; }
    ctx.fillText(nombre, 25, 4);
    ctx.restore();
  }

  function dibujarHUD() {
    ctx.save();
    ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.font = MONO; ctx.fillStyle = '#ffffff';
    ctx.fillText('PUNTOS ' + String(puntos).padStart(6, '0'), 16, 12);
    ctx.fillStyle = '#b8b3d9'; ctx.fillText('NIVEL ' + (nivelIdx + 1), 16, 34);
    for (let i = 0; i < vidas; i++) dibujarNave(120 + i * 28, 42, '#4cc9f0', '#3a86ff', 0.5, false);

    if (!N.jefeLanzado) {
      const bw = 220, bx = W / 2 - bw / 2;
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(bx, 16, bw, 8);
      ctx.fillStyle = '#ff4d8d'; ctx.fillRect(bx, 16, bw * Math.min(1, N.bajas / N.meta), 8);
      ctx.textAlign = 'center'; ctx.font = '600 11px system-ui, sans-serif'; ctx.fillStyle = '#d8d4f0';
      ctx.fillText('Frases transformadas ' + Math.min(N.bajas, N.meta) + '/' + N.meta, W / 2, 28);
    } else if (jefe) {
      const bw = 300, bx = W / 2 - bw / 2;
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(bx, 16, bw, 10);
      ctx.fillStyle = jefe.color; ctx.fillRect(bx, 16, bw * Math.max(0, jefe.hp / jefe.hpMax), 10);
      ctx.textAlign = 'center'; ctx.font = '800 12px system-ui, sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(jefe.nombre, W / 2, 30);
    }

    const items = [];
    if (J.vel) items.push(['velocidad', 'x' + J.vel]);
    if (J.disparo > 1) items.push(['multiple', 'x' + J.disparo]);
    if (J.laser) items.push(['laser', '']);
    if (J.escudo) items.push(['escudo', String(J.escudo)]);
    if (J.aliados) items.push(['aliado', 'x' + J.aliados]);
    let x = 28;
    for (const [k, txt] of items) {
      const P = PODERES[k];
      ctx.fillStyle = P.color; ctx.shadowColor = P.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x, H - 24, 13, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0b0620'; ctx.font = '900 13px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.letra, x, H - 23);
      ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(txt, x + 16, H - 23);
      x += 34 + (txt ? 18 : 0);
    }

    if (N.alertaT > 0 && Math.floor(N.alertaT * 4) % 2 === 0) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ff4d4d'; ctx.font = '900 42px system-ui, sans-serif';
      ctx.fillText('¡ALERTA!', W / 2, H / 2 - 30);
      ctx.fillStyle = '#fff'; ctx.font = '700 18px system-ui, sans-serif';
      ctx.fillText('Se aproxima: ' + N.cfg.jefe, W / 2, H / 2 + 12);
    }
    ctx.restore();
  }

  function dibujar() {
    dibujarFondo();
    if (estado === 'menu' || !J) {
      dibujarNave(W * 0.5 + Math.sin(tiempo) * 30, H * 0.82 + Math.sin(tiempo * 1.7) * 8, '#4cc9f0', '#3a86ff', 1.4);
      return;
    }
    for (const c of capsulas) dibujarCapsula(c);
    for (const e of enemigos) dibujarEnemigo(e);
    if (jefe) dibujarJefe(jefe);

    for (const b of balas) {
      ctx.fillStyle = b.laser ? '#4cc9f0' : '#ffd23f';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }
    ctx.shadowBlur = 0;
    for (const b of balasEnem) {
      ctx.fillStyle = '#ff5d5d'; ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe0e0'; ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI * 2); ctx.fill();
    }

    if (vidas > 0 && estado !== 'muriendo') {
      for (let i = 0; i < J.aliados; i++) {
        const p = posAliado(i);
        ctx.save(); ctx.shadowColor = '#ff8fab'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#ff8fab'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x + 2, p.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      const visible = J.inv <= 0 || Math.floor(J.inv * 12) % 2 === 0;
      if (visible) dibujarNave(J.x, J.y, '#4cc9f0', '#3a86ff');
      if (J.escudo > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(179,136,255,' + (0.5 + Math.sin(tiempo * 6) * 0.25) + ')';
        ctx.lineWidth = 2 + J.escudo; ctx.shadowColor = '#b388ff'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.ellipse(J.x, J.y, 36, 26, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }

    for (const p of particulas) {
      ctx.globalAlpha = 1 - p.t / p.vida;
      ctx.fillStyle = p.color; ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
    }
    ctx.globalAlpha = 1;

    for (const t of textos) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1 - t.t / t.vida) * 1.6);
      ctx.font = '800 ' + t.tam + 'px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(t.txt).width;
      const x = clamp(t.x, tw / 2 + 8, W - tw / 2 - 8);
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(11,6,32,.9)'; ctx.strokeText(t.txt, x, t.y);
      ctx.fillStyle = t.color; ctx.fillText(t.txt, x, t.y);
      ctx.restore();
    }
    dibujarHUD();
  }

  /* ---------- Bucle principal ---------- */
  let ultimo = performance.now();
  function bucle(ahora) {
    let dt = (ahora - ultimo) / 1000; ultimo = ahora;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    actualizar(dt);
    dibujar();
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  /* ---------- Capas (menús) ---------- */
  function mostrarCapa(id) {
    document.querySelectorAll('.capa').forEach((c) => c.classList.remove('visible'));
    if (id) $('#' + id).classList.add('visible');
    $('#botones-hud').classList.toggle('oculto', estado !== 'jugando');
  }

  /* ---------- Preguntas ---------- */
  function elegirPoder() {
    const c = [];
    if (J.vel < 3) c.push('velocidad');
    if (J.disparo < 3) c.push('multiple', 'multiple');
    if (!J.laser) c.push('laser');
    if (J.escudo < 3) c.push('escudo', 'escudo');
    if (J.aliados < 2) c.push('aliado');
    return c.length ? c[Math.floor(Math.random() * c.length)] : 'bonus';
  }

  function aplicarPoder(tipo) {
    switch (tipo) {
      case 'velocidad': J.vel = Math.min(3, J.vel + 1); break;
      case 'multiple': J.disparo = Math.min(3, J.disparo + 1); break;
      case 'laser': J.laser = true; break;
      case 'escudo': J.escudo = 3; break;
      case 'aliado': J.aliados = Math.min(2, J.aliados + 1); break;
      default: puntos += 2000;
    }
  }

  function abrirQuiz() {
    sfx.capsula();
    const tipo = elegirPoder();
    const q = mazo[idxMazo++];
    if (idxMazo >= mazo.length) { mazo = barajar(PREGUNTAS); idxMazo = 0; }
    estado = 'quiz';
    const P = PODERES[tipo];
    const cab = $('#qPoder');
    cab.innerHTML = '';
    const ins = document.createElement('span'); ins.className = 'insignia'; ins.style.setProperty('--c', P.color); ins.textContent = P.letra;
    const info = document.createElement('div');
    const nom = document.createElement('strong'); nom.textContent = P.nombre;
    const ef = document.createElement('small'); ef.textContent = P.efecto;
    info.append(nom, ef); cab.append(ins, info);

    $('#qTexto').textContent = q.p;
    const cont = $('#qOpciones'); cont.innerHTML = '';
    barajar(q.o.map((t, i) => ({ t, i }))).forEach((op) => {
      const b = document.createElement('button');
      b.className = 'opcion'; b.textContent = op.t; b.dataset.ok = op.i === q.c ? '1' : '0';
      b.addEventListener('click', () => responder(op.i === q.c, b, q, tipo));
      cont.appendChild(b);
    });
    $('#qRetro').hidden = true; $('#qSeguir').hidden = true;
    mostrarCapa('quiz');
    $('#quiz .tarjeta').scrollTop = 0;
  }

  function responder(ok, boton, q, tipo) {
    document.querySelectorAll('#qOpciones .opcion').forEach((b) => {
      b.disabled = true;
      if (b.dataset.ok === '1') b.classList.add('ok');
    });
    if (!ok) boton.classList.add('mal');
    stats.respondidas++;
    const retro = $('#qRetro');
    retro.classList.toggle('mal', !ok);
    if (ok) {
      stats.correctas++; aplicarPoder(tipo); puntos += 500; sfx.bien();
      $('#qVeredicto').textContent = '¡Correcto! Poder activado: ' + PODERES[tipo].nombre + '.';
    } else {
      sfx.mal();
      $('#qVeredicto').textContent = 'Esta vez no se activó el poder. Lo importante es lo que aprendes:';
    }
    $('#qExplica').textContent = q.r;
    retro.hidden = false;
    const seguir = $('#qSeguir'); seguir.hidden = false;
    setTimeout(() => { seguir.focus({ preventScroll: true }); seguir.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 50);
  }

  $('#qSeguir').addEventListener('click', () => {
    estado = 'jugando'; J.inv = Math.max(J.inv, 1.2); mostrarCapa(null);
  });

  /* ---------- Nivel superado y final ---------- */
  function nivelSuperado() {
    estado = 'nivel';
    const c = NIVELES[nivelIdx];
    $('#nvSobre').textContent = 'Nivel ' + (nivelIdx + 1) + ' superado';
    $('#nvTitulo').textContent = 'Concepto clave: ' + c.concepto;
    $('#nvTexto').textContent = c.texto;
    $('#nvReflexion').textContent = c.reflexion;
    $('#btnSiguiente').textContent = nivelIdx < NIVELES.length - 1 ? 'Siguiente nivel' : 'Ver resultados';
    mostrarCapa('nivel');
  }

  $('#btnSiguiente').addEventListener('click', () => {
    if (nivelIdx < NIVELES.length - 1) { nivelIdx++; vidas = Math.min(5, vidas + 1); iniciarNivel(); texto(W / 2, H / 2 + 20, '+1 vida', '#7cffb2', 2, 18); }
    else terminar(true);
  });

  function terminar(gano) {
    estado = 'fin';
    const rec = Number(leer('er_record') || 0);
    const nuevoRecord = puntos > rec;
    if (nuevoRecord) guardar('er_record', String(puntos));
    $('#finSobre').textContent = gano ? 'Misión cumplida' : 'Fin de la misión';
    $('#finTitulo').textContent = gano ? '¡Transformaste el sector!' : 'La discriminación ganó esta ronda… pero no la guerra';
    const st = $('#finStats'); st.innerHTML = '';
    [[puntos, nuevoRecord ? 'Puntos · ¡récord!' : 'Puntos'], [stats.eliminadas, 'Frases transformadas'], [stats.correctas + '/' + stats.respondidas, 'Respuestas correctas']]
      .forEach(([v, l]) => { const d = document.createElement('div'); const b = document.createElement('b'); b.textContent = v; const s = document.createElement('span'); s.textContent = l; d.append(b, s); st.appendChild(d); });
    const ul = $('#finFrases'); ul.innerHTML = '';
    const lista = barajar(stats.transformadas).slice(0, 6);
    if (!lista.length) { const li = document.createElement('li'); li.textContent = 'Aún ninguna. ¡Inténtalo de nuevo!'; ul.appendChild(li); }
    lista.forEach((f) => {
      const li = document.createElement('li');
      const s = document.createElement('s'); s.textContent = f.t;
      const b = document.createElement('b'); b.textContent = f.r;
      li.append(s, document.createTextNode(' → '), b); ul.appendChild(li);
    });
    $('#finMensaje').textContent = 'En la vida real no hay láseres: hay palabras, escucha y acción. ' + CONFIG.ayudaInstitucional;
    mostrarCapa('fin');
  }

  /* ---------- Controles ---------- */
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    teclas[k] = true;
    if (k.startsWith('arrow') || k === ' ') e.preventDefault();
    if ((k === 'p' || k === 'escape') && (estado === 'jugando' || estado === 'pausa')) alternarPausa();
  });
  window.addEventListener('keyup', (e) => { teclas[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; });

  let punteroActivo = null, ultX = 0, ultY = 0;
  document.addEventListener('pointerdown', (e) => {
    if (estado !== 'jugando' || e.target.closest('button, .capa')) return;
    punteroActivo = e.pointerId; ultX = e.clientX; ultY = e.clientY;
  });
  document.addEventListener('pointermove', (e) => {
    if (e.pointerId !== punteroActivo || estado !== 'jugando') return;
    punteroDX += (e.clientX - ultX) / escalaCSS;
    punteroDY += (e.clientY - ultY) / escalaCSS;
    ultX = e.clientX; ultY = e.clientY;
  });
  const soltar = (e) => { if (e.pointerId === punteroActivo) punteroActivo = null; };
  document.addEventListener('pointerup', soltar);
  document.addEventListener('pointercancel', soltar);
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  function alternarPausa() {
    if (estado === 'jugando') { estado = 'pausa'; mostrarCapa('pausa'); }
    else if (estado === 'pausa') { estado = 'jugando'; mostrarCapa(null); }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && estado === 'jugando') alternarPausa(); });

  /* ---------- Botones ---------- */
  function pantallaCompleta() {
    const esTactil = matchMedia('(pointer: coarse)').matches;
    if (!esTactil) return;
    try {
      const el = document.documentElement;
      const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : null;
      if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* no soportado */ } }).catch(() => {});
    } catch (e) { /* no soportado (iOS) */ }
  }

  $('#btnJugar').addEventListener('click', () => { sonido(1, 0.01, 'sine', 0.0001); pantallaCompleta(); nuevaPartida(); });
  $('#btnOtraVez').addEventListener('click', () => nuevaPartida());
  $('#btnPausa').addEventListener('click', alternarPausa);
  $('#btnReanudar').addEventListener('click', alternarPausa);
  $('#btnReiniciar').addEventListener('click', () => nuevaPartida());
  $('#btnSalir').addEventListener('click', irAlMenu);
  document.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.abrir === 'menu') irAlMenu(); else mostrarCapa(b.dataset.abrir);
  }));
  $('#btnIgnorarGiro').addEventListener('click', () => document.body.classList.add('ignorar-giro'));

  const btnSonido = $('#btnSonido');
  function pintarSonido() { btnSonido.textContent = mudo ? '×' : '♪'; btnSonido.setAttribute('aria-pressed', String(mudo)); }
  btnSonido.addEventListener('click', () => { mudo = !mudo; guardar('er_mudo', mudo ? '1' : '0'); pintarSonido(); });
  pintarSonido();

  function irAlMenu() {
    estado = 'menu'; J = null;
    $('#record').textContent = leer('er_record') || '0';
    mostrarCapa('menu');
  }

  // Contenido inicial
  $('#creditos').textContent = CONFIG.creditos;
  $('#record').textContent = leer('er_record') || '0';
  const lp = $('#listaPoderes');
  ['escudo', 'multiple', 'laser', 'aliado', 'velocidad'].forEach((k) => {
    const P = PODERES[k];
    const d = document.createElement('div'); d.className = 'poder';
    const i = document.createElement('span'); i.className = 'insignia'; i.style.setProperty('--c', P.color); i.textContent = P.letra;
    const t = document.createElement('div');
    const s = document.createElement('strong'); s.textContent = P.nombre;
    const sm = document.createElement('small'); sm.textContent = P.efecto;
    t.append(s, sm); d.append(i, t); lp.appendChild(d);
  });

  // Modo de prueba: agrega ?debug a la dirección
  if (location.search.includes('debug')) {
    window.__ER = { abrirQuiz, get estado() { return estado; }, saltarAlJefe: () => { N.bajas = N.meta; enemigos = []; }, danarJefe, get jefe() { return jefe; }, get J() { return J; } };
  }

  // Instalación como app (funciona sin conexión)
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
