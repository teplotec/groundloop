import type { Metadata } from 'next';
import { HydrationMarker } from './HydrationMarker';
import './globals.css';

export const metadata: Metadata = {
  title: 'GroundLoop · TeploTEC',
  description: 'Ground-loop hydraulic sizing and geothermal design configurator.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        <HydrationMarker />
        {children}
      </body>
    </html>
  );
}
