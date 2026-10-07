// Phones get the phone site only: a touch-only device whose screen is phone-sized in either orientation.
window.isPhone = matchMedia('(hover: none) and (pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
