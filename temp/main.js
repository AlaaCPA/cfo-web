/* Mobile drawer */
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
if (hamburger && drawer){
  /*hamburger.addEventListener('click', ()=> drawer.classList.toggle('open'));
  drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> drawer.classList.remove('open')));*/
  const toggle = () => {
    const open = !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    hamburger.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', toggle);
  drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    hamburger.setAttribute('aria-expanded','false');
  }));
}

/* Active nav link */
(function markActive(){
  const path = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
  document.querySelectorAll('.nav a, .drawer-nav a').forEach(a=>{
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href.endsWith(path)) a.classList.add('active');
  });
})();

/* Pause hero video when tab hidden */
const hero = document.querySelector('.hero');
const hv = document.querySelector('.hero video, .hero-video');
if (hv){
  document.addEventListener('visibilitychange', ()=> document.hidden ? hv.pause() : hv.play().catch(()=>{}));
  const io = new IntersectionObserver(([e]) => e.isIntersecting ? hv.play().catch(()=>{}) : hv.pause(), { threshold: .25 });
  hero && io.observe(hero);
}

/* Reveal on scroll (+ stagger) */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if (e.isIntersecting){
      e.target.classList.add('on','revealed');
      io.unobserve(e.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal, .card, .bubble, .tcard').forEach((el,i)=>{
  el.style.transitionDelay = `${(i%6)*60}ms`;
  io.observe(el);
});

/* Accordions (Services) */
document.querySelectorAll('.acc details').forEach(d=>{
  d.addEventListener('toggle', ()=>{
    if (d.open){
      document.querySelectorAll('.acc details').forEach(x=>{ if(x!==d) x.open=false; });
    }
  });
});

/* Team bios modal (Team page) */
const modal = document.querySelector('.modal');
if (modal){
  const modalBody = modal.querySelector('.modal-body');
  document.querySelectorAll('[data-bio]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      modalBody.innerHTML = document.getElementById(btn.dataset.bio).innerHTML;
      modal.classList.add('open');
    });
  });
  modal.addEventListener('click', (e)=>{
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')){
      modal.classList.remove('open');
    }
  });
}

/* Page enter animation */
window.addEventListener('DOMContentLoaded', ()=>{
  document.documentElement.classList.add('page-enter','page-enter-active');
  setTimeout(()=>document.documentElement.classList.remove('page-enter','page-enter-active'), 650);
});
// Respect reduced motion
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Page transitions (same-site links) ===== */
(function pageTransitions(){
  const curtain = document.getElementById('transition');
  if (!curtain || REDUCED) return;

  // Enter animation
  requestAnimationFrame(()=> {
    curtain.classList.add('active');
    // slide it off to reveal page
    setTimeout(()=>curtain.classList.add('leave'), 30);
    // clean up after anim
    setTimeout(()=>curtain.classList.remove('active','leave'), 800);
  });

  // Intercept internal links
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a');
    if (!a) return;
    const url = new URL(a.href, location.href);
    const same = url.origin === location.origin;
    const file = url.pathname.split('/').pop();
    const isHash = url.hash && url.pathname === location.pathname;
    const isExt = /^mailto:|^tel:/.test(a.getAttribute('href'));
    if (same && !isHash && !a.target && !a.hasAttribute('download') && !isExt){
      e.preventDefault();
      curtain.classList.remove('leave');
      curtain.classList.add('active');
      setTimeout(()=> location.href = a.href, 350);
    }
  });
})();

/* ===== Hero particles (lightweight) ===== */
(function heroParticles(){
  if (REDUCED) return;
  const c = document.getElementById('heroFx');
  if (!c) return;
  const ctx = c.getContext('2d',{ alpha:true });
  let w,h, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let pts = [], mouse = {x:-9999,y:-9999};

  function resize(){
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    // seed points
    const count = Math.round((w*h)/28000); // density
    pts = Array.from({length: count}, ()=>({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-.5)*.4, vy:(Math.random()-.5)*.4
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    // move & draw
    for (const p of pts){
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>w) p.vx*=-1;
      if (p.y<0||p.y>h) p.vy*=-1;

      // mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx,dy);
      if (dist < 90){
        p.vx += dx/dist * .12;
        p.vy += dy/dist * .12;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    }
    // lines
    for (let i=0;i<pts.length;i++){
      for (let j=i+1;j<pts.length;j++){
        const a=pts[i], b=pts[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
        if (d < 120*120){
          ctx.strokeStyle = 'rgba(198,240,225,0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  resize(); step();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e=>{
    const r = c.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
})();

/* ===== Magnetic buttons + ripple ===== */
(function magnets(){
  if (REDUCED) return;
  document.querySelectorAll('.magnetic').forEach(btn=>{
    const strength = 14;
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top  - r.height/2;
      btn.style.transform = `translate(${x/strength}px, ${y/strength}px)`;
    });
    btn.addEventListener('mouseleave', ()=> btn.style.transform = '');
    btn.addEventListener('click', e=>{
      const rip = document.createElement('span');
      rip.className='ripple';
      rip.style.left = e.offsetX + 'px';
      rip.style.top  = e.offsetY + 'px';
      btn.appendChild(rip);
      setTimeout(()=> rip.remove(), 650);
    });
  });
})();

/* ===== 3D tilt cards ===== */
(function tiltCards(){
  if (REDUCED) return;
  const max = 9; // deg
  document.querySelectorAll('.tilt').forEach(el=>{
    let r;
    el.addEventListener('pointermove', e=>{
      const b = el.getBoundingClientRect();
      const px = (e.clientX - b.left)/b.width;
      const py = (e.clientY - b.top)/b.height;
      const rx = (py - .5)*-2*max;
      const ry = (px - .5)* 2*max;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      cancelAnimationFrame(r);
    });
    el.addEventListener('pointerleave', ()=>{ el.style.transform=''; });
  });
})();

/* ===== Parallax orbs: follow cursor slightly ===== */
(function orbParallax(){
  if (REDUCED) return;
  const orbs = document.querySelectorAll('.orb');
  if (!orbs.length) return;
  document.addEventListener('mousemove', e=>{
    const x = (e.clientX / window.innerWidth - .5) * 14;
    const y = (e.clientY / window.innerHeight - .5) * 10;
    orbs.forEach((o,i)=>{ o.style.transform = `translate(${x*(i+1)/3}px, ${y*(i+1)/3}px)`; });
  });
})();

/* ===== Count-up numbers ===== */
(function countUp(){
  const els = document.querySelectorAll('.countup');
  if (!els.length) return;
  const run = el=>{
    const target = +el.dataset.count || 0;
    const dur = 1200, start = performance.now(), from = +el.textContent.replace(/[^0-9.-]/g,'') || 0;
    const step = (t)=>{
      const p = Math.min((t - start)/dur, 1);
      const val = Math.floor(from + (target - from) * p);
      el.textContent = val.toLocaleString();
      if (p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const obs = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if (e.isIntersecting){ run(e.target); obs.unobserve(e.target); } });
  },{threshold:.6});
  els.forEach(el=> obs.observe(el));
})();
(function () {
  const video = document.querySelector('.hero-video');
  const btn   = document.getElementById('soundToggle');
  if (!video || !btn) return;

  // restore last choice, if any
  const saved = localStorage.getItem('heroMuted');
  if (saved !== null) video.muted = saved === '1';

  function reflectUI(){
    btn.classList.toggle('on', !video.muted);
    btn.setAttribute('aria-pressed', String(!video.muted));
    btn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    btn.textContent = video.muted ? '🔈' : '🔊';
  }

  reflectUI();

  // Try to start with sound if the browser allows it
  async function tryEnableSound(){
    try {
      video.muted = false;
      await video.play();           // may throw if autoplay w/ sound is blocked
      reflectUI();
    } catch (e) {
      video.muted = true;           // stay muted until user interacts
      reflectUI();
    }
  }

  // run after load
  if (video.readyState >= 2) tryEnableSound(); else {
    video.addEventListener('loadeddata', tryEnableSound, { once:true });
  }

  // Toggle by button
  btn.addEventListener('click', async () => {
    video.muted = !video.muted;
    try { await video.play(); } catch {}
    localStorage.setItem('heroMuted', video.muted ? '1' : '0');
    reflectUI();
  });

  // First user interaction anywhere => unmute
  const oneShotUnmute = async () => {
    if (video.muted) {
      video.muted = false;
      try { await video.play(); } catch {}
      localStorage.setItem('heroMuted', '0');
      reflectUI();
    }
    window.removeEventListener('pointerdown', oneShotUnmute);
    window.removeEventListener('wheel', oneShotUnmute);
  };
  window.addEventListener('pointerdown', oneShotUnmute, { once:true, passive:true });
  window.addEventListener('wheel',       oneShotUnmute, { once:true, passive:true });
})();
// Team cover: background slideshow with autoplay + controls + swipe
(function teamCoverSlider(){
  const root  = document.querySelector('.team-cover');
  if (!root) return;
  const bg    = document.getElementById('teamBg');
  const prev  = document.getElementById('teamPrev');
  const next  = document.getElementById('teamNext');
  const dotsC = document.getElementById('teamDots');
  const slides = Array.from(bg.querySelectorAll('img')).filter(Boolean);
  if (!slides.length) return;

  // build dots
  const dots = slides.map((_,i)=>{
    const b = document.createElement('button');
    b.className = 'dot';
    b.setAttribute('aria-label', `Show photo ${i+1}`);
    b.addEventListener('click', ()=> go(i, true));
    dotsC.appendChild(b);
    return b;
  });

  let i = 0, timer = null, hovering = false;

  function setActive(n){
    slides.forEach((img,idx)=> img.classList.toggle('active', idx === n));
    dots.forEach((d,idx)=> d.classList.toggle('active', idx === n));
    bg.style.setProperty('--bg', `url('${slides[n].getAttribute('src')}')`);
    i = n;
  }
  function nextFn(){ go((i+1) % slides.length); }
  function prevFn(){ go((i-1+slides.length) % slides.length); }

  function go(n, user=false){
    setActive(n);
    if (user) restart(); // keep autoplay cadence after a manual action
  }

  function play(){ stop(); timer = setInterval(nextFn, 5000); }
  function stop(){ if (timer){ clearInterval(timer); timer = null; } }
  function restart(){ stop(); play(); }

  // init
  setActive(0); play();

  // controls
  next?.addEventListener('click', ()=> go((i+1)%slides.length, true));
  prev?.addEventListener('click', ()=> go((i-1+slides.length)%slides.length, true));

  // pause on hover/focus (desktop)
  root.addEventListener('mouseenter', ()=>{ hovering = true; stop(); });
  root.addEventListener('mouseleave', ()=>{ hovering = false; play(); });
  root.addEventListener('focusin',  stop);
  root.addEventListener('focusout', ()=> !hovering && play());

  // swipe (touch / mouse drag)
  let downX = 0, dragging = false;
  const start = e => { dragging = true; downX = (e.touches?e.touches[0].clientX:e.clientX); };
  const move  = e => {};
  const end   = e => {
    if (!dragging) return;
    const x = (e.changedTouches?e.changedTouches[0].clientX:e.clientX);
    const dx = x - downX;
    if (Math.abs(dx) > 40){ dx < 0 ? nextFn() : prevFn(); }
    dragging = false;
  };
  root.addEventListener('pointerdown', start);
  root.addEventListener('pointerup',   end);
  root.addEventListener('touchstart',  start, {passive:true});
  root.addEventListener('touchend',    end);
})();
/* Team bios modal (Team page) — structured, with next/prev + arrows */
(function teamBios(){
  const modal = document.querySelector('.modal');
  if (!modal) return;
  const body  = modal.querySelector('.modal-body');
  const close = modal.querySelector('.modal-close');
  const prevB = modal.querySelector('.modal-prev');
  const nextB = modal.querySelector('.modal-next');

  const triggers = Array.from(document.querySelectorAll('[data-bio]'));
  let index = -1;

  function render(idx){
    const id = triggers[idx]?.dataset.bio;
    const tpl = id && document.getElementById(id);
    if (!tpl) return;
    body.innerHTML = tpl.innerHTML;
    modal.classList.add('open');
    index = idx;
  }
  triggers.forEach((btn, i)=> btn.addEventListener('click', ()=> render(i)));

  function closeModal(){ modal.classList.remove('open'); index = -1; }
  modal.addEventListener('click', (e)=>{
    if (e.target === modal || e.target.classList.contains('modal-close')) closeModal();
  });

  // next/prev buttons
  nextB?.addEventListener('click', ()=> render((index+1) % triggers.length));
  prevB?.addEventListener('click', ()=> render((index-1+triggers.length) % triggers.length));

  // keyboard nav
  document.addEventListener('keydown', (e)=>{
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextB?.click();
    if (e.key === 'ArrowLeft')  prevB?.click();
  });
})();
(function teamCoverSlider(){
  const root  = document.querySelector('.team-cover');
  if (!root) return;

  const bg    = document.getElementById('teamBg');
  const prev  = document.getElementById('teamPrev');
  const next  = document.getElementById('teamNext');
  const dotsC = document.getElementById('teamDots');

  // NEW: progress + toggle
  const progWrap = root.querySelector('.team-progress');
  const progBar  = progWrap?.querySelector('span');
  const toggle   = document.getElementById('teamToggle');

  const slides = Array.from(bg.querySelectorAll('img')).filter(Boolean);
  if (!slides.length) return;

  // build dots (you already have this)
  const dots = slides.map((_,i)=>{
    const b = document.createElement('button');
    b.className = 'dot';
    b.setAttribute('aria-label', `Show photo ${i+1}`);
    b.addEventListener('click', ()=> go(i, true));
    dotsC.appendChild(b);
    return b;
  });

  let i = 0, raf = null, start = 0;
  const DURATION = 5000; // 5s per slide

  function setActive(n){
    slides.forEach((img,idx)=> img.classList.toggle('active', idx === n));
    dots.forEach((d,idx)=> d.classList.toggle('active', idx === n));
    // keeps blurred backfill in sync
    bg.style.setProperty('--bg', `url('${slides[n].getAttribute('src')}')`);
    i = n;
  }

  function tick(t){
    if (!start) start = t;
    const p = Math.min((t - start)/DURATION, 1);
    if (progBar) progBar.style.width = `${p*100}%`;
    if (p >= 1){
      nextFn();
      start = t; // restart progress
    }
    raf = requestAnimationFrame(tick);
  }

  function play(){
    stop();
    start = 0;
    toggle?.setAttribute('aria-label', 'Pause slideshow');
    toggle && (toggle.textContent = '❚❚');
    raf = requestAnimationFrame(tick);
  }

  function stop(){
    if (raf){ cancelAnimationFrame(raf); raf = null; }
    if (progBar) progBar.style.width = '0%';
    toggle?.setAttribute('aria-label', 'Play slideshow');
    toggle && (toggle.textContent = '▶');
  }

  function nextFn(){ go((i+1) % slides.length); }
  function prevFn(){ go((i-1+slides.length) % slides.length); }
  function go(n, user=false){ setActive(n); if (user) { start = 0; } }

  // init
  setActive(0);
  play();  // autoplay

  // controls you already had
  next?.addEventListener('click', ()=> go((i+1)%slides.length, true));
  prev?.addEventListener('click', ()=> go((i-1+slides.length)%slides.length, true));

  // NEW: play/pause
  toggle?.addEventListener('click', ()=> raf ? stop() : play());

  // pause on hover/focus (desktop)
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', play);
  root.addEventListener('focusin',  stop);
  root.addEventListener('focusout', play);

  // swipe (you already have this block; leave as-is if present)
})();
/* ===== 3D Coverflow – fixed layout & controls ===== */
(() => {
  const flow = document.getElementById('teamFlow');
  if (!flow) return;

  const track    = document.getElementById('cfTrack');
  const cards    = Array.from(track.querySelectorAll('.cf-card'));
  const prevBtn  = flow.querySelector('.cf-nav.prev');
  const nextBtn  = flow.querySelector('.cf-nav.next');
  const dotsWrap = document.getElementById('cfDots');

  let index = 0;
  let timer = null;
  const AUTOPLAY = 3400;

  // Build dots safely
  function buildDots(){
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to photo ${i+1}`);
      b.addEventListener('click', () => { index = i; render(); restart(); });
      dotsWrap.appendChild(b);
    });
    return Array.from(dotsWrap.children);
  }
  let dots = buildDots();

  function render(){
    const stageW = track.clientWidth;                 // width of stage
    const spacing = Math.min(stageW * 0.42, 430);    // horizontal distance between cards

    cards.forEach((card, i) => {
      const off   = i - index;                        // -2..0..+2
      const dist  = Math.abs(off);
      const x     = off * spacing;                    // offset from center
      const rotY  = off * -32;                        // 3D tilt
      const z     = -Math.min(80 + dist * 110, 360);  // push back sides
      const scale = dist ? 0.88 : 1;

      card.style.transform =
        `translateX(calc(-50% + ${x}px)) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;

      card.classList.toggle('is-center', dist === 0);
      card.classList.toggle('is-side',   dist !== 0);
      card.style.zIndex = String(1000 - dist);

      if (dist) {
        card.style.setProperty('--rx','0deg');
        card.style.setProperty('--ry','0deg');
        card.style.setProperty('--imgScale','1.02');
      }
    });

    dots.forEach((d,i)=>d.classList.toggle('active', i === index));
  }

  function prev(){ index = (index - 1 + cards.length) % cards.length; render(); }
  function next(){ index = (index + 1) % cards.length; render(); }

  // Arrows
  prevBtn.addEventListener('click', e => { e.preventDefault(); prev(); restart(); });
  nextBtn.addEventListener('click', e => { e.preventDefault(); next(); restart(); });

  // Swipe on the stage (not on buttons/dots)
  let startX = 0, dragging = false;
  track.addEventListener('pointerdown', e => {
    if (e.target.closest('.cf-nav') || e.target.closest('.cf-dots')) return;
    dragging = true; startX = e.clientX; track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointerup', e => {
    if (!dragging) return; dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 30) (dx < 0 ? next : prev)();
    restart();
  });
  track.addEventListener('pointercancel', () => dragging = false);

  // Tilt on center card
  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      if (!card.classList.contains('is-center')) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;
      const rx = (x - .5) * 10;
      const ry = (0.5 - y) *  8;
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
      card.style.setProperty('--imgScale','1.05');
      card.style.setProperty('--mx', `${x*100}%`);
      card.style.setProperty('--my', `${y*100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx','0deg');
      card.style.setProperty('--ry','0deg');
      card.style.setProperty('--imgScale','1.02');
      card.style.setProperty('--mx','50%');
      card.style.setProperty('--my','50%');
    });
  });

  // Autoplay
  const start   = () => { if (!timer) timer = setInterval(next, AUTOPLAY); };
  const stop    = () => { if (timer) { clearInterval(timer); timer = null; } };
  const restart = () => { stop(); start(); };

  flow.addEventListener('mouseenter', stop);
  flow.addEventListener('mouseleave', start);
  const io = new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { threshold: .35 });
  io.observe(flow);

  // Keyboard + responsive
  flow.tabIndex = 0;
  flow.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); restart(); }
    if (e.key === 'ArrowRight') { next(); restart(); }
  });
  window.addEventListener('resize', render);

  render();
})();
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    /*if (!id) return;*/
    const el = document.getElementById(id);
    if (el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});
/* 3D tilt that respects reduced motion */
(function tiltCards(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const max = 9;
  document.querySelectorAll('.what .card.tilt').forEach(el=>{
    el.addEventListener('pointermove', e=>{
      const b = el.getBoundingClientRect();
      const px = (e.clientX - b.left)/b.width;
      const py = (e.clientY - b.top)/b.height;
      el.style.transform = `rotateX(${(py-.5)*-2*max}deg) rotateY(${(px-.5)*2*max}deg)`;
    });
    el.addEventListener('pointerleave', ()=>{ el.style.transform=''; });
  });
})();
/* Team strip: ensure seamless loop and give click a purpose on Home */
(function teamStripMarquee(){
  const strip = document.querySelector('.team-strip .strip');
  if (!strip) return;

  // 1) Make sure content is at least ~2x viewport width for seamless loop
  const gap = parseFloat(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 18;
  const totalWidth = () => Array.from(strip.children)
    .reduce((w,el)=> w + el.getBoundingClientRect().width, 0) + (strip.children.length-1)*gap;

  let w = totalWidth();
  const vis = strip.getBoundingClientRect().width;
  const kids = Array.from(strip.children);
  while (w < vis * 2.2) { kids.forEach(n => strip.appendChild(n.cloneNode(true))); w = totalWidth(); }

  // 2) Pause animation on hover is already in CSS; make sure it's smooth on resize
  let raf; const sync = () => { cancelAnimationFrame(raf); strip.style.animation = 'none';
    raf = requestAnimationFrame(()=> { strip.style.animation = ''; }); };
  addEventListener('resize', sync);

  // 3) On Home, clicking a face should take users to the Team page
  if (!document.querySelector('.modal')) {
    strip.querySelectorAll('[data-bio]').forEach(btn=>{
      btn.addEventListener('click', ()=> location.href = 'team.html');
    });
  }
})();
/* Team avatars: swap to photo when data-img is available */
(function teamAvatars(){
  document.querySelectorAll('.avatar[data-img]').forEach(el=>{
    const url = el.dataset.img;
    if (!url) return;
    el.style.setProperty('--photo', `url("${url}")`);
    el.classList.add('has-photo');
  });
})();
// Contact form handler
// Contact form handler with optional endpoint + mailto fallback
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const msg = form.querySelector('.form-msg');
  const btn = document.getElementById('sendBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // honeypot
    if (form.website && form.website.value.trim()) return;

    btn.disabled = true; btn.textContent = 'Sending…';
    const ENDPOINT = ''; // e.g. '/api/contact' later

    try {
      let ok = true;
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, { method: 'POST', body: new FormData(form) });
        ok = res.ok;
      } else {
        // mailto fallback if no backend yet
        const name = encodeURIComponent(form.name.value || '');
        const email = encodeURIComponent(form.email.value || '');
        const phone = encodeURIComponent(form.phone.value || '');
        const company = encodeURIComponent(form.organization.value || '');
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${company}\n\n${form.message.value || ''}`
        );
        window.location.href = `mailto:a.amer@cfoai.cpa?subject=Website inquiry — ${name}&body=${body}`;
      }
      msg.hidden = false;
      msg.textContent = 'Thanks! We’ll be in touch shortly.';
      form.reset();
    } catch {
      msg.hidden = false;
      msg.textContent = 'Network error. Please try again.';
    } finally {
      btn.disabled = false; btn.textContent = 'Send Message';
    }
  });
})();
