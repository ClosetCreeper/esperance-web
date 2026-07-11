export default function LogoMark({ size = 22, gradientId = 'esperance-holo' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9EDB" />
          <stop offset="26%" stopColor="#C9A6FF" />
          <stop offset="52%" stopColor="#7FCFFF" />
          <stop offset="74%" stopColor="#7FF0D0" />
          <stop offset="100%" stopColor="#FFE38A" />
        </linearGradient>
      </defs>
      <path
        d="M55,20 C74,17 88,32 85,50 C82,66 72,76 55,80 C40,84 24,76 20,60 C16,46 22,28 40,22 C46,20 51,21 55,20 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
