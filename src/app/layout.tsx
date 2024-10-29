import type { Metadata } from "next";
import "./globals.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line react/no-unescaped-entities
export const metadata: Metadata = {
  title: "Sync Box",
  description: "Sincroniza series e filmes em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
