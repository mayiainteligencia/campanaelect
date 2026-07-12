import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import logoFlai from '@/assets/images/logos/logo-FLAI.png';
import logoMayia from '@/assets/images/logos/mayiaLogoBlanco.png';
import hechoEnMexico from '@/assets/images/logos/hechoEnMexicoRed.png';
import nubeFlai from '@/assets/images/logos/nubeFlaiP.png';
import './Hero.css';

// Progreso de scroll dentro de la sección (0 = arriba, 1 = fondo). Independiente de la altura.
function scrollProgress(section: HTMLElement | null) {
  if (!section) return 0;
  const total = section.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);

  // Pausa el shader animado cuando el Hero sale de vista (estás en el dashboard).
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Logo/hint se desvanecen al entrar; al final la nube nos envuelve (whiteout)
  // y, al completarse, saltamos rápido al dashboard para no dejar scroll en blanco.
  const snappedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const autoCancelledRef = useRef(false);

  const cancelAuto = () => {
    autoCancelledRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    const onScroll = () => {
      const p = scrollProgress(sectionRef.current);
      if (overlayRef.current) overlayRef.current.style.opacity = String(1 - p * 1.6);
      // La nube se acerca (zoom) conforme bajas, hasta envolver la pantalla.
      if (cloudRef.current) cloudRef.current.style.transform = `scale(${1 + p * 5})`;
      // El blanco entra en el último tramo del zoom (0.5 -> 0.85).
      if (fogRef.current) fogRef.current.style.opacity = String(Math.max(0, (p - 0.5) / 0.35));

      // Whiteout completo → entregamos al dashboard de inmediato (una sola vez).
      if (p >= 0.85 && !snappedRef.current) {
        snappedRef.current = true;
        cancelAuto(); // que el tween no pelee con el scrollIntoView
        const dash = document.querySelector('.dashboard');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        dash?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
      if (p < 0.5) snappedRef.current = false; // rearmar al volver a subir
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-zoom: sin pedir scroll. Tras una pausa la nube se acerca sola y entra al
  // dashboard. Si el usuario toma el control (clic en el logo, rueda, touch) se cancela.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => {
      const section = sectionRef.current;
      if (!section || autoCancelledRef.current) return;
      const total = section.offsetHeight - window.innerHeight;
      const target = total * 0.9; // hasta disparar el whiteout/snap
      if (reduce) return; // accesibilidad: no animamos scroll, dejamos que decida
      const from = window.scrollY;
      const dur = 1700;
      const t0 = performance.now();
      const tick = (now: number) => {
        if (autoCancelledRef.current) return;
        const k = Math.min(1, (now - t0) / dur);
        const eased = k * k * (3 - 2 * k); // smoothstep
        window.scrollTo(0, from + (target - from) * eased);
        if (k < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(start, 1100);
    const opts = { passive: true } as const;
    window.addEventListener('wheel', cancelAuto, opts);
    window.addEventListener('touchstart', cancelAuto, opts);
    window.addEventListener('keydown', cancelAuto);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', cancelAuto);
      window.removeEventListener('touchstart', cancelAuto);
      window.removeEventListener('keydown', cancelAuto);
    };
  }, []);

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero__sticky">
        {/* Fondo animado: gradiente shader oscuro con rojos y verdes profundos */}
        <MeshGradient
          className="hero__gradient"
          colors={['#000000', '#000000', '#1a0505', '#3a0a0a', '#06140d', '#0a2417']}
          speed={active ? 0.3 : 0}
          distortion={0.8}
          swirl={0.5}
          maxPixelCount={1280 * 720}
        />
        <div className="hero__canvas" ref={cloudRef}>
          {/* Copia borrosa detrás: difumina el contorno para un borde espumoso de nube real */}
          <img src={nubeFlai} alt="" aria-hidden className="hero__cloud hero__cloud--foam" />
          <img src={nubeFlai} alt="" aria-hidden className="hero__cloud hero__cloud--main" />
          {/* Niebla animada recortada con la silueta de la nube: movimiento interno */}
          <div className="hero__cloud hero__cloud-fx" aria-hidden />
        </div>

        <div className="hero__overlay" ref={overlayRef}>
          <div className="hero__brands">
            <img src={hechoEnMexico} alt="Hecho en México" className="hero__brand hero__brand--hem" />
            <img src={logoMayia} alt="MAYIA" className="hero__brand hero__brand--mayia" />
          </div>

          <img
            className="hero__logo"
            src={logoFlai}
            alt="FLAI"
            onClick={cancelAuto}
          />
          <div className="hero__hint">
            <span className="hero__hint-label">Desliza para conocer más sobre esta nube soberana</span>
            <span className="hero__hint-track" aria-hidden>
              <span className="hero__hint-beam" />
            </span>
          </div>
        </div>

        {/* Whiteout: la nube nos envuelve al final del zoom y entrega a la siguiente sección */}
        <div className="hero__fog" ref={fogRef} aria-hidden />
      </div>
    </section>
  );
}
