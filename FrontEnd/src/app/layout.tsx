import type { Metadata } from "next";
import "@/styles/global.scss";
import { Montserrat, Manrope } from "next/font/google";
import AuthOverlay from "@/components/AuthOverlay/authOverlay";

// Thay thế font local bị thiếu bằng Google Font ổn định.
// Vẫn giữ nguyên CSS variable name để không phải sửa toàn bộ SCSS.
const integralCF = Montserrat({
  subsets: ["latin"],
  variable: "--font-integral",
  weight: ["700", "800", "900"],
  display: "swap",
});

const satoshi = Manrope({
  subsets: ["latin"],
  variable: "--font-satoshi",
  weight: ["400", "500", "600", "700", "800"],
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
