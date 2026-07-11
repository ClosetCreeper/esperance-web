const EXT_MAP = {
  pdf: 'pdf',
  mp4: 'video', mov: 'video', webm: 'video', m4v: 'video',
  mp3: 'audio', wav: 'audio', m4a: 'audio', ogg: 'audio', flac: 'audio',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image',
  txt: 'text', md: 'text', json: 'text', csv: 'text', log: 'text'
};

export function getViewerKind(filename, contentType = '') {
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType.startsWith('text/')) return 'text';

  const ext = filename.split('.').pop()?.toLowerCase();
  return EXT_MAP[ext] || 'unsupported';
}
