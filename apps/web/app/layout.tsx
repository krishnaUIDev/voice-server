import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import { FloatingRoomBar } from "../components/FloatingRoomBar";
import { CreateRoomModal } from "../components/CreateRoomModal";
import { FullRoomView } from "../components/FullRoomView";
import { VoiceProvider } from "../context/VoiceContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Pulao | Clubhouse Voice Room",
  description: "A premium voice communication platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className={`${nunito.className} h-full font-sans bg-background`}>
        <VoiceProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-y-auto relative">
              {children}
              <FloatingRoomBar />
            </main>
            <CreateRoomModal />
            <FullRoomView />
          </div>
        </VoiceProvider>
      </body>
    </html>
  );
}
