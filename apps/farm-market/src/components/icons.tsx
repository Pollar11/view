// Small hand-rolled stroke icons, matching the style already used for the
// header's search/cart/menu icons (24 viewBox, strokeWidth 2, currentColor)
// instead of emoji — consistent across platforms and tintable to match the
// site palette.

export function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 3h13v13H1z" strokeLinejoin="round" />
      <path d="M14 8h4l4 4v4h-8V8z" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M4 20c8-1 15-6 16-16C10 5 5 12 4 20z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 20c2-4 5-7 9-9" strokeLinecap="round" />
    </svg>
  );
}

export function KnifeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21l7-7" strokeLinecap="round" />
      <path d="M10 14L20 4c1 3 1 6-1 8s-5 2-8 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l8 3.5v6c0 5-3.4 8.3-8 10.5-4.6-2.2-8-5.5-8-10.5v-6L12 2z" strokeLinejoin="round" />
      <path d="M8.5 12l2.3 2.3L15.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
