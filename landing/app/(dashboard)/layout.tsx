import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <DashboardNav />
      <main className="container flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}