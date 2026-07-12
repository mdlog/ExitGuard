import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // OG/Twitter image base. Set NEXT_PUBLIC_SITE_URL to the web app's real domain when deployed;
  // falls back to our own domain (not okx.ai — that would imply OKX hosts it).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://exitguard.mdloglabs.org"),
  applicationName: "ExitGuard",
  title: "ExitGuard — can your agent actually get OUT?",
  description:
    "The seatbelt your trading agent calls before it becomes the exit liquidity. BLOCK / WARN / OK + an auditable depth curve, settled pay-per-call in USDT0 on X Layer via x402. An OKX.AI Agentic Service Provider.",
  openGraph: {
    title: "ExitGuard — the seatbelt before your agent becomes the exit liquidity",
    description:
      "One call proves whether a trading agent can exit at size, and BLOCKs the trades where its own unwind is the market. An OKX.AI A2MCP service.",
    type: "website",
    siteName: "ExitGuard",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExitGuard — can your agent actually get OUT?",
    description:
      "The seatbelt your trading agent calls before it becomes the exit liquidity. Auditable exit-liquidity verdicts, priced per call in USDT0 on X Layer.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
