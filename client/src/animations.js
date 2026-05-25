import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import AOS from 'aos';
import 'aos/dist/aos.css';

gsap.registerPlugin(ScrollTrigger);

export function initAOS() {
  try {
    AOS.init({ duration: 800, easing: 'ease-in-out-cubic', once: false, mirror: true });
  } catch (e) {
    // ignore
  }
}

export function initGSAPAnimations() {
  try {
    // Parallax background on cart section
    gsap.to('.parallax-bg', {
      backgroundPosition: '0% 100%',
      scrollTrigger: {
        trigger: '.cart-section',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
    });

    // Smooth vertical parallax for the parallax element (if present)
    const parallaxEl = document.querySelector('.parallax-bg');
    if (parallaxEl) {
      gsap.to(parallaxEl, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cart-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // Service cards entrance
    gsap.utils.toArray('.service-card').forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.06,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
      });
    });

    // Hero entrance animations
    const hero = document.querySelector('.hero-section');
    if (hero) {
      const title = hero.querySelector('.hero-title');
      const subtitle = hero.querySelector('.hero-subtitle');
      const cta = hero.querySelector('.hero-cta');
      const tl = gsap.timeline();
      tl.from(title, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from(subtitle, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from(cta, { y: 10, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    }

    // Why-choose cards
    gsap.utils.toArray('.why-card').forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        x: -30,
        duration: 0.6,
        delay: index * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
      });
    });
  } catch (e) {
    // fail silently in non-browser environments
  }
}

// Navigation UI is handled by React (`Header` component).
// Avoid attaching global nav listeners here to prevent duplicate handlers.
export function initNavigation() {
  return; // no-op — handled by React
}

export function initScrollProgress() {
  if (typeof document === 'undefined') return;
  function updateScrollProgress() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;
    const progress = scrollHeight > 0 ? (scrollPosition / scrollHeight) * 100 : 0;
    const el = document.getElementById('scroll-progress');
    if (el) el.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();
}

export function initHeroGradient() {
  if (typeof document === 'undefined') return;
  const heroGradient = document.querySelector('.hero-gradient-bg');
  if (!heroGradient) {
    const canvasHero = document.getElementById('canvas-hero');
    if (canvasHero) canvasHero.classList.add('hero-gradient-bg');
  }
}

export function initWaveAnimation() {
  // Wave animation removed per user request.
  // Keep as a no-op to avoid altering initialization flow elsewhere.
  return;
}

export default function initAnimations() {
  initAOS();
  initHeroGradient();
  // initNavigation is a no-op; header handles menu state in React
  initGSAPAnimations();
  initScrollProgress();
  // initWaveAnimation intentionally disabled
}
