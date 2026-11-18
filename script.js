(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  document.body.classList.add("loading");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- loader ---------- */
  const start = () => {
    $("#loader").classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
    setTimeout(typeLoop, 700);
  };
  window.addEventListener("load", () => setTimeout(start, reduce ? 0 : 1100));
  setTimeout(() => !document.body.classList.contains("ready") && start(), 4000);

  /* ---------- typewriter ---------- */
  const words = ["0 → 1 products.", "AI-powered tools.", "B2B SaaS platforms.", "roadmaps teams believe in.", "products people adopt."];
  const typed = $("#typed");
  let wi = 0, ci = 0, del = false, typing = false;
  function typeLoop() {
    if (typing) return;
    typing = true;
    if (reduce) { typed.textContent = words[0]; return; }
    const tick = () => {
      const w = words[wi];
      ci += del ? -1 : 1;
      typed.textContent = w.slice(0, ci);
      let t = del ? 35 : 70;
      if (!del && ci === w.length) { del = true; t = 1700; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; t = 300; }
      setTimeout(tick, t);
    };
    tick();
  }

  /* ---------- split text (word reveal on scroll) ---------- */
  $$("[data-split]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  });
  const splitWords = () => {
    $$("[data-split]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const ws = $$(".w", el);
      const n = Math.floor(p * ws.length * 1.05);
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    });
  };

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 6) * 0.08}s`);
    io.observe(el);
  });

  /* ---------- counters ---------- */
  function countUp(el) {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target; return; }
    const dur = 1800, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- scroll: progress, nav, timeline ---------- */
  const nav = $("#nav"), progress = $("#progress"), fill = $("#timelineFill"), tl = $(".timeline");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 40);
    nav.classList.toggle("hidden", y > lastY && y > 400);
    lastY = y;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
    fill.style.height = `${p * 100}%`;
    splitWords();
  };
  window.addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    const c = $("#cursor"), d = $("#cursorDot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; d.style.transform = `translate(${mx}px, ${my}px)`; });
    const loop = () => { cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
    $$("a, button, .tags span, .card, .stat").forEach((el) => {
      el.addEventListener("mouseenter", () => c.classList.add("hover"));
      el.addEventListener("mouseleave", () => c.classList.remove("hover"));
    });

    /* magnetic buttons */
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });

    /* photo tilt */
    const tilt = $("#tilt");
    const hv = $(".hero-visual");
    hv.addEventListener("mousemove", (e) => {
      const r = hv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(800px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg)`;
      tilt.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      tilt.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    });
    hv.addEventListener("mouseleave", () => (tilt.style.transform = ""));

    /* card tilt */
    $$(".tilt-card").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });

    /* stat spotlight */
    $$(".stat").forEach((el) => el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - r.left}px`);
      el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    }));
  }

  /* ---------- particle constellation background ---------- */
  const cv = $("#bg"), ctx = cv.getContext("2d");
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const colors = ["255,138,92", "242,92,154", "155,123,255"];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6, c: colors[(Math.random() * 3) | 0],
    }));
  };
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 140) { p.x += (dx / dist) * 1.2; p.y += (dy / dist) * 1.2; }
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(${a.c},${(1 - d / 130) * 0.22})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      ctx.fillStyle = `rgba(${p.c},0.85)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  draw();
})();
