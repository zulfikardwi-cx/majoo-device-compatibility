import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { logout } from "@/app/admin/actions";
import { getCategoriesWithCounts } from "@/lib/data";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
  const categories = await getCategoriesWithCounts();

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Admin — Kategori</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--color-primary)]"
          >
            Keluar
          </button>
        </form>
      </div>

      <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-white">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/admin/dashboard/${cat.slug}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-muted)]"
          >
            <span>
              <span className="block font-medium text-[var(--foreground)]">{cat.name}</span>
              <span className="block text-sm text-[var(--color-text-muted)]">
                {cat.deviceCount} device
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </main>
  );
}
