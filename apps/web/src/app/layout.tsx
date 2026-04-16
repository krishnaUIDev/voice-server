import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Saffron - Pulao Web",
    description: "The web interface for the Pulao project",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
