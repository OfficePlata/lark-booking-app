import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";

export const metadata: Metadata = {
  title: "Stay Yokaban | 天文館で過ごす、特別な夜",
  description: "鹿児島・天文館の中心に位置する和風モダンなアパートメント。グルメや観光の中心地で、暮らすような旅を。一棟貸切のプライベート空間。",
  icons: {
    icon: "https://ext.same-assets.com/2412339422/3716179957.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <ClientBody>{children}</ClientBody>
    </html>
  );
}
