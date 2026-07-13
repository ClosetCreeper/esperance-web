// A self-contained set of file-type icons in the "folded corner document"
// style, plus a folder icon. Colors are per-type (kept close to familiar
// conventions like red=PDF, green=spreadsheet) but the folder uses the
// brand's gold gradient so it visually anchors as "home turf."

function DocBase({ fill, children }) {
  return (
    <>
      <path
        d="M8 3C8 1.9 8.9 1 10 1H27L38 12V37C38 38.1 37.1 39 36 39H10C8.9 39 8 38.1 8 37V3Z"
        fill={fill}
      />
      <path d="M27 1L38 12H29C27.9 12 27 11.1 27 10V1Z" fill="rgba(255,255,255,0.55)" />
      {children}
    </>
  );
}

function Label({ text, size = 10 }) {
  return (
    <text
      x="23" y="29"
      textAnchor="middle"
      fontFamily="'Baloo 2', sans-serif"
      fontWeight="700"
      fontSize={size}
      fill="#FFFFFF"
    >
      {text}
    </text>
  );
}

function wrap(inner) {
  return function Icon({ size = 28 }) {
    return (
      <svg width={size} height={size} viewBox="0 0 46 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {inner}
      </svg>
    );
  };
}

export const PdfIcon = wrap(
  <DocBase fill="#D9503D"><Label text="PDF" /></DocBase>
);

export const WordIcon = wrap(
  <DocBase fill="#2F6FE0"><Label text="DOC" /></DocBase>
);

export const ExcelIcon = wrap(
  <DocBase fill="#1E8E5A"><Label text="XLS" /></DocBase>
);

export const PowerPointIcon = wrap(
  <DocBase fill="#D9722F"><Label text="PPT" /></DocBase>
);

export const ZipIcon = wrap(
  <DocBase fill="#8A7A63"><Label text="ZIP" /></DocBase>
);

export const TextIcon = wrap(
  <DocBase fill="#8A8F9E"><Label text="TXT" /></DocBase>
);

export const CodeIcon = wrap(
  <DocBase fill="#3A3F55">
    <text x="23" y="29" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="500" fontSize="12" fill="#FFFFFF">
      {'</>'}
    </text>
  </DocBase>
);

export const VideoIcon = wrap(
  <DocBase fill="#D9527A">
    <path d="M20 21L28 25.5L20 30V21Z" fill="#FFFFFF" />
  </DocBase>
);

export const AudioIcon = wrap(
  <DocBase fill="#2FA8A0">
    <path
      d="M18 30V20.5L28 18.5V27M18 30C18 31.1 17.1 32 16 32C14.9 32 14 31.1 14 30C14 28.9 14.9 28 16 28C17.1 28 18 28.9 18 30ZM28 27C28 28.1 27.1 29 26 29C24.9 29 24 28.1 24 27C24 25.9 24.9 25 26 25C27.1 25 28 25.9 28 27Z"
      stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  </DocBase>
);

export const ImageIcon = wrap(
  <DocBase fill="#3FA9E0">
    <circle cx="18" cy="22" r="2.2" fill="#FFFFFF" />
    <path d="M14 31L20 25L24 28L30 22L34 31H14Z" fill="#FFFFFF" />
  </DocBase>
);

export const GenericFileIcon = wrap(
  <DocBase fill="#A9ACB8">
    <line x1="14" y1="20" x2="27" y2="20" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="14" y1="25" x2="27" y2="25" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="14" y1="30" x2="22" y2="30" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
  </DocBase>
);

export function FolderIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="folder-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE9B0" />
          <stop offset="45%" stopColor="#FFD766" />
          <stop offset="100%" stopColor="#E8A93D" />
        </linearGradient>
      </defs>
      <path d="M4 10C4 8.9 4.9 8 6 8H18L22 12H40C41.1 12 42 12.9 42 14V32C42 33.1 41.1 34 40 34H6C4.9 34 4 33.1 4 32V10Z" fill="url(#folder-gold)" />
      <path d="M4 14H42V32C42 33.1 41.1 34 40 34H6C4.9 34 4 33.1 4 32V14Z" fill="url(#folder-gold)" opacity="0.85" />
    </svg>
  );
}

const EXT_TO_ICON = {
  pdf: PdfIcon,
  doc: WordIcon, docx: WordIcon, rtf: WordIcon,
  xls: ExcelIcon, xlsx: ExcelIcon, csv: ExcelIcon,
  ppt: PowerPointIcon, pptx: PowerPointIcon, key: PowerPointIcon,
  zip: ZipIcon, rar: ZipIcon, tar: ZipIcon, gz: ZipIcon, '7z': ZipIcon,
  txt: TextIcon, md: TextIcon, log: TextIcon,
  js: CodeIcon, jsx: CodeIcon, ts: CodeIcon, tsx: CodeIcon, json: CodeIcon,
  html: CodeIcon, css: CodeIcon, py: CodeIcon, java: CodeIcon, swift: CodeIcon, sh: CodeIcon,
  mp4: VideoIcon, mov: VideoIcon, webm: VideoIcon, m4v: VideoIcon, avi: VideoIcon,
  mp3: AudioIcon, wav: AudioIcon, m4a: AudioIcon, ogg: AudioIcon, flac: AudioIcon,
  png: ImageIcon, jpg: ImageIcon, jpeg: ImageIcon, gif: ImageIcon, webp: ImageIcon, svg: ImageIcon, heic: ImageIcon
};

/** Returns the right icon component for a filename (or FolderIcon if isFolder is true). */
export function FileTypeIcon({ filename, isFolder, size = 28 }) {
  if (isFolder) return <FolderIcon size={size} />;
  const ext = filename?.split('.').pop()?.toLowerCase();
  const IconComponent = EXT_TO_ICON[ext] || GenericFileIcon;
  return <IconComponent size={size} />;
}
