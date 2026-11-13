import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const MOTION = {
  durationFast: 0.25,
  durationBase: 0.4,
  durationReveal: 0.55,
  easeOut: 'power3.out',
  easeDice: 'back.out(1.7)',
  stagger: 0.06,
  yOffset: 16,
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Movimento assinatura: Rolagem tátil dos dados (4d6 / d20)
 */
export function animateDiceNodes(elements) {
  if (!elements || elements.length === 0 || prefersReducedMotion()) return;

  gsap.fromTo(
    elements,
    { scale: 0.82, rotation: -12, autoAlpha: 0.4 },
    {
      scale: 1,
      rotation: 0,
      autoAlpha: 1,
      duration: 0.45,
      stagger: 0.05,
      ease: MOTION.easeDice,
      clearProps: 'transform',
    }
  );
}

/**
 * Contador numérico animado para métricas e resultados de dados
 */
export function animateCounter(element, targetValue, prefix = '') {
  if (!element) return;
  const numericTarget = Number(targetValue) || 0;

  if (prefersReducedMotion()) {
    element.textContent = `${prefix}${numericTarget}`;
    return;
  }

  const counter = { val: 0 };
  gsap.to(counter, {
    val: numericTarget,
    duration: 0.5,
    ease: 'power2.out',
    snap: { val: 1 },
    onUpdate: () => {
      element.textContent = `${prefix}${Math.round(counter.val)}`;
    },
  });
}

export { gsap, ScrollTrigger, useGSAP };

