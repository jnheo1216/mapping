import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://voxel-terrain-explorer.vercel.app"),
  title: {
    default: "Voxel Terrain Explorer",
    template: "%s | Voxel Terrain Explorer"
  },
  description:
    "Seeded noise로 3D voxel 지형을 생성하고 데스크탑/모바일에서 탐험하는 웹 앱.",
  applicationName: "Voxel Terrain Explorer",
  keywords: [
    "voxel",
    "terrain",
    "procedural generation",
    "noise map",
    "react three fiber",
    "webgl"
  ],
  category: "game",
  authors: [{ name: "Voxel Terrain Team" }],
  creator: "Voxel Terrain Team",
  publisher: "Voxel Terrain Team",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }]
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Voxel Terrain Explorer",
    title: "Voxel Terrain Explorer",
    description:
      "Procedural 3D voxel terrain explorer with seeded world generation and cross-device controls.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Voxel Terrain Explorer logo and voxel world artwork"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Voxel Terrain Explorer",
    description:
      "Generate and explore seeded 3D voxel terrain worlds in your browser.",
    images: ["/og-image.svg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: "#133447"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
