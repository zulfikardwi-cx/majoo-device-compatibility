import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCategoriesWithCounts } from "@/lib/data";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-xl font-bold text-[var(--foreground)]">Kelola Kategori</h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Pilih kategori untuk upload foto device atau ubah status compatibility.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/admin/dashboard/${cat.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-muted)] text-[var(--color-primary-dark)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-[var(--foreground)]">
                    {cat.name}
                  </span>
                  <span className="block text-sm text-[var(--color-text-muted)]">
                    {cat.deviceCount} device
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
