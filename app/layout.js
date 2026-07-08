import './globals.css';

export const metadata = {
  title: 'Esperance',
  description: 'File storage for the Esperance project'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
