// src/motion/motionVariants.js

export const easing = [0.22, 1, 0.36, 1];

export const durations = {
  fast: 0.25,
  normal: 0.4,
};

export const cardFlip = {
  front: {
    rotateY: 0,
    z: 0,
    transition: {
      duration: durations.normal,
      ease: easing,
    },
  },
  back: {
    rotateY: 180,
    z: 20,
    transition: {
      duration: durations.normal,
      ease: easing,
    },
  },
};

export const modal = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.fast,
      ease: easing,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: durations.fast,
      ease: easing,
    },
  },
};
