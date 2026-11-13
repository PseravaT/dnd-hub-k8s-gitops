import React, { useRef } from 'react';
import { gsap, useGSAP, MOTION } from '../../lib/motion';

export const RevealGroup = ({
  children,
  className = '',
  stagger = MOTION.stagger,
  y = MOTION.yOffset,
  triggerKey,
}) => {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = root.current?.querySelectorAll('[data-reveal]');
        if (!targets || targets.length === 0) return;

        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: MOTION.durationReveal,
          ease: MOTION.easeOut,
          stagger,
          clearProps: 'transform,opacity,visibility',
        });
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [triggerKey] }
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
};

export default RevealGroup;

