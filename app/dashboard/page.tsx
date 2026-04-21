import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";
import type { Session } from "next-auth";

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <Navbar user={{ email: session.user.email }} />
      <DashboardClient />
    </>
  );
}
