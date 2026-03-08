import type { Metadata } from "next";
import "@/styles/global.scss";
import localFont from "next/font/local";
import AuthOverlay from "@/components/AuthOverlay/authOverlay";

// Cấu hình font Integral CF
const integralCF = localFont({
  src: "../../public/fonts/IntegralCF-Bold.woff2",
  variable: "--font-integral",
  weight: "700",
  display: "swap",
});

// Cấu hình font Satoshi
const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Next.js App",
  description: "Created with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${integralCF.variable} ${satoshi.variable}`}
      >
        {children}
        <AuthOverlay />
      </body>
    </html>
  );
}
