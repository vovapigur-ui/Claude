import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RECOMP',
    short_name: 'RECOMP',
    description: 'Body recomposition tracker — 206 → 175',
    start_url: '/today',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait',
    categories: ['health', 'fitness'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        // @ts-expect-error purpose is valid
        purpose: 'any maskable',
      },
    ],
  };
}
