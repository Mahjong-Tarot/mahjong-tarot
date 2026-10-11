// Public-site line icons: 1.5px stroke, square caps, mitred joins (style
// guide, Iconography). Decorative only: the button that holds an icon
// carries the aria-label. Colour inherits via currentColor.
const PATHS = {
  menu:    'M3 6h14M3 10h14M3 14h14',
  close:   'M5 5l10 10M15 5L5 15',
  caret:   'M5 8l5 5 5-5',
};

export default function Icon({ name, size = 20, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
