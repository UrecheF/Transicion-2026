/* =====================================================================
   TRANSICIÓN 2026 — script.js
   Toda la personalización (fecha, textos, colores, imágenes, música,
   velocidad de animaciones) se lee desde config.json. No es necesario
   tocar este archivo para editar el contenido del evento.
   ===================================================================== */

(() => {
  'use strict';

  let CONFIG = null;

  /* ---------------------------------------------------------------- */
  /* 1. CARGA DE CONFIGURACIÓN                                        */
  /* ---------------------------------------------------------------- */
  async function loadConfig() {
    try {
      const res = await fetch('config.json', { cache: 'no-store' });
      CONFIG = await res.json();
    } catch (err) {
      console.warn('No se pudo cargar config.json, usando valores por defecto.', err);
      CONFIG = null;
    }
  }

  function applyColorsAndSpeeds() {
    if (!CONFIG) return;
    const root = document.documentElement.style;
    const c = CONFIG.colores || {};
    const a = CONFIG.animaciones || {};
    if (c.azulOscuro) root.setProperty('--azul-oscuro', c.azulOscuro);
    if (c.azulProfundo) root.setProperty('--azul-profundo', c.azulProfundo);
    if (c.dorado) root.setProperty('--dorado', c.dorado);
    if (c.doradoClaro) root.setProperty('--dorado-claro', c.doradoClaro);
    if (c.doradoOscuro) root.setProperty('--dorado-oscuro', c.doradoOscuro);
    if (c.blancoHueso) root.setProperty('--blanco-hueso', c.blancoHueso);
    if (c.textoClaro) root.setProperty('--texto-claro', c.textoClaro);
    if (c.sombra) root.setProperty('--sombra', c.sombra);
    if (c.brilloEscudo) root.setProperty('--brillo-escudo', c.brilloEscudo);

    if (a.velocidadGlobos) root.setProperty('--vel-globos', a.velocidadGlobos);
    if (a.velocidadCortinas) root.setProperty('--vel-cortinas', a.velocidadCortinas);
    if (a.velocidadParticulas) root.setProperty('--vel-particulas', a.velocidadParticulas);
    if (a.pulsoEscudo) root.setProperty('--vel-pulso', a.pulsoEscudo);
  }

  function applyImagesAndMeta() {
    if (!CONFIG) return;
    const img = CONFIG.imagenes || {};
    const bgImage = document.getElementById('bg-image');
    if (img.fondo && bgImage) bgImage.src = img.fondo;

    const favicon = document.querySelector('link[rel="icon"]');
    if (img.favicon && favicon) favicon.href = img.favicon;

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (img.ogImage && ogImageTag) ogImageTag.setAttribute('content', img.ogImage);

    const seo = CONFIG.seo || {};
    if (seo.titulo) document.title = seo.titulo;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (seo.descripcion && metaDesc) metaDesc.setAttribute('content', seo.descripcion);

    const ogUrl = document.getElementById('og-url');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);
  }

  /* ---------------------------------------------------------------- */
  /* 2. CUENTA REGRESIVA                                               */
  /* ---------------------------------------------------------------- */
  function getTargetDate() {
    const iso = CONFIG?.evento?.fechaObjetivoISO || '2026-11-28T15:00:00-05:00';
    return new Date(iso);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function startCountdown() {
    const target = getTargetDate();
    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMinutes = document.getElementById('cd-minutes');
    const elSeconds = document.getElementById('cd-seconds');
    const panel = document.getElementById('countdown-panel');
    const celebration = document.getElementById('celebration');
    const celebrationMsg = document.getElementById('celebration-message');

    let finished = false;

    function tick() {
      if (finished) return;
      const now = new Date();
      let diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        elDays.textContent = '00';
        elHours.textContent = '00';
        elMinutes.textContent = '00';
        elSeconds.textContent = '00';
        finished = true;
        clearInterval(intervalId);
        panel.style.display = 'none';
        celebrationMsg.textContent = CONFIG?.evento?.mensajeCelebracion || '¡Llegó el gran día! 🎓✨';
        celebration.hidden = false;
        launchConfetti();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);
      const seconds = Math.floor(diff / 1000);

      elDays.textContent = pad(days);
      elHours.textContent = pad(hours);
      elMinutes.textContent = pad(minutes);
      elSeconds.textContent = pad(seconds);
    }

    tick();
    const intervalId = setInterval(tick, 1000);
  }

  /* Pequeña animación de confeti dorado al llegar a cero */
  function launchConfetti() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      r: 3 + Math.random() * 4,
      speed: 2 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 2,
      color: Math.random() > 0.5 ? '#d4af6a' : '#f3d9a4',
      rot: Math.random() * Math.PI,
    }));
    let frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawParticles(ctx, canvas); // conserva las partículas doradas de fondo
      pieces.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        p.rot += 0.02;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      });
      if (frame < 500) requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------------------------------------------------------------- */
  /* 3. PARTÍCULAS DORADAS FLOTANTES (canvas, aceleradas por GPU)      */
  /* ---------------------------------------------------------------- */
  let particles = [];
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const speed = CONFIG?.animaciones?.velocidadParticulas || 1;
    const count = window.innerWidth < 600 ? 26 : 46;
    particles = Array.from({ length: count }, () => spawnParticle(canvas, speed));

    const ctx = canvas.getContext('2d');
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawParticles(ctx, canvas);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function spawnParticle(canvas, speed) {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.6 + Math.random() * 1.8,
      vy: -(0.15 + Math.random() * 0.3) * speed,
      vx: (Math.random() - 0.5) * 0.15 * speed,
      alpha: 0.15 + Math.random() * 0.4,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  function drawParticles(ctx, canvas) {
    particles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      p.twinkle += 0.03;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 106, ${a.toFixed(2)})`;
      ctx.fill();
    });
  }

  /* ---------------------------------------------------------------- */
  /* 4. REPRODUCTOR DE MÚSICA                                          */
  /* ---------------------------------------------------------------- */
  function setupMusic() {
    const audio = document.getElementById('bg-audio');
    const toggleBtn = document.getElementById('music-toggle');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const volumeSlider = document.getElementById('volume-slider');
    const loopBtn = document.getElementById('loop-toggle');
    const tapHint = document.getElementById('tap-hint');

    const musicConf = CONFIG?.musica || {};
    if (musicConf.archivo) audio.querySelector('source').src = musicConf.archivo;
    audio.load();
    audio.volume = musicConf.volumenInicial ?? 0.5;
    audio.loop = musicConf.repetir !== false;
    volumeSlider.value = audio.volume;

    function updateIcons() {
      const playing = !audio.paused;
      iconPlay.hidden = playing;
      iconPause.hidden = !playing;
      toggleBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    }

    function playAudio() {
      audio.play().then(updateIcons).catch(() => { /* el navegador bloqueó el autoplay */ });
    }

    toggleBtn.addEventListener('click', () => {
      if (audio.paused) playAudio(); else audio.pause();
      updateIcons();
      tapHint.hidden = true;
    });

    volumeSlider.addEventListener('input', (e) => {
      audio.volume = parseFloat(e.target.value);
    });

    loopBtn.addEventListener('click', () => {
      audio.loop = !audio.loop;
      loopBtn.classList.toggle('ctrl-btn--active', audio.loop);
    });

    // Cumplimiento de políticas de autoplay: iniciar solo tras interacción
    if (musicConf.autoplayTrasInteraccion !== false) {
      const startOnce = () => {
        playAudio();
        tapHint.hidden = true;
        document.removeEventListener('click', startOnce);
        document.removeEventListener('touchstart', startOnce);
      };
      tapHint.addEventListener('click', startOnce);
      document.addEventListener('click', startOnce, { once: true });
      document.addEventListener('touchstart', startOnce, { once: true, passive: true });
    } else {
      tapHint.hidden = true;
    }
  }

  /* ---------------------------------------------------------------- */
  /* 5. COMPARTIR                                                       */
  /* ---------------------------------------------------------------- */
  function setupShare() {
    const shareToggle = document.getElementById('share-toggle');
    const shareMenu = document.getElementById('share-menu');
    const share = CONFIG?.compartir || {};
    const url = share.url || window.location.href;
    const titulo = share.titulo || document.title;
    const texto = encodeURIComponent(`${titulo} - ${share.descripcion || ''}`);
    const encodedUrl = encodeURIComponent(url);

    document.getElementById('share-whatsapp').href = `https://wa.me/?text=${texto}%20${encodedUrl}`;
    document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    document.getElementById('share-instagram').href = `https://www.instagram.com/`;
    document.getElementById('share-telegram').href = `https://t.me/share/url?url=${encodedUrl}&text=${texto}`;
    document.getElementById('share-x').href = `https://twitter.com/intent/tweet?text=${texto}&url=${encodedUrl}`;
    document.getElementById('share-email').href = `mailto:?subject=${encodeURIComponent(titulo)}&body=${texto}%20${encodedUrl}`;

    shareToggle.addEventListener('click', () => {
      shareMenu.hidden = !shareMenu.hidden;
    });
    document.addEventListener('click', (e) => {
      if (!shareMenu.hidden && !e.target.closest('.share-panel')) shareMenu.hidden = true;
    });

    document.getElementById('share-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        flashButton(document.getElementById('share-copy'), 'Enlace copiado ✓');
      } catch {
        flashButton(document.getElementById('share-copy'), 'No se pudo copiar');
      }
    });

    document.getElementById('share-qr').addEventListener('click', () => openQrModal(url));

    document.getElementById('qr-close').addEventListener('click', () => {
      document.getElementById('qr-modal').hidden = true;
    });

    // Web Share API nativa en móviles, si está disponible, mediante el mismo botón principal
    if (navigator.share) {
      shareToggle.addEventListener('dblclick', () => {
        navigator.share({ title: titulo, text: share.descripcion, url }).catch(() => {});
      });
    }
  }

  function flashButton(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = original; }, 1800);
  }

  function openQrModal(url) {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = '';
    modal.hidden = false;

    const render = () => {
      // eslint-disable-next-line no-undef
      new QRCode(qrContainer, { text: url, width: 200, height: 200, colorDark: '#0a1128', colorLight: '#f7f3ea' });
    };

    if (window.QRCode) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = render;
      document.body.appendChild(script);
    }
  }

  /* ---------------------------------------------------------------- */
  /* 6. INSTALACIÓN COMO APP (PWA)                                      */
  /* ---------------------------------------------------------------- */
  function setupInstall() {
    const installBtn = document.getElementById('install-btn');
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });

    window.addEventListener('appinstalled', () => { installBtn.hidden = true; });
  }

  /* ---------------------------------------------------------------- */
  /* 7. TEXTOS DINÁMICOS DESDE CONFIG (título/lema si se editan)       */
  /* ---------------------------------------------------------------- */
  function applyTextContent() {
    if (!CONFIG?.evento) return;
    // Los textos visibles viven dentro de la imagen de diseño; si en el futuro
    // se reemplaza el fondo por una versión sin texto, este bloque permite
    // inyectar los textos reales del evento como capas HTML editables.
    document.title = CONFIG.seo?.titulo || document.title;
  }

  /* ---------------------------------------------------------------- */
  /* INIT                                                               */
  /* ---------------------------------------------------------------- */
  async function init() {
    await loadConfig();
    applyColorsAndSpeeds();
    applyImagesAndMeta();
    applyTextContent();
    initParticles();
    startCountdown();
    setupMusic();
    setupShare();
    setupInstall();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
