import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import type { Session } from "next-auth";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ideas App",
  description: "Record and store your ideas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession(authOptions)) as Session | null;

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
