// Renders the Esperance image logo. Place the actual logo file at
// /public/esplogo.png (or .svg — update the extension below if so)
// in the project root. It'll then be servable at /esplogo.png.
//
// The `gradientId` prop from older call sites is accepted but unused
// now that the mark is a real image rather than an inline gradient SVG.
export default function LogoMark({ size = 22 }) {
  return (
    <img
      src="/esplogo.png"
      alt="Esperance"
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
