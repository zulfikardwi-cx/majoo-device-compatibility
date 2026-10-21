import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCategoryBySlug, getDevicesByCategory } from "@/lib/data";
import { CATEGORY_DEFS } from "@/lib/categories";
import { AdminDeviceGrid } from "@/components/AdminDeviceGrid";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminCategoryPage({
  params,
}: PageProps<"/admin/dashboard/[slug]">) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
  const { slug } = await params;
  const def = CATEGORY_DEFS.find((c) => c.slug === slug);
  if (!def) notFound();

  const category = await getCategoryBySlug(slug);
  const devices = category ? await getDevicesByCategory(category.id) : [];

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Semua kategori
        </Link>
        <h1 className="text-xl font-bold text-[var(--foreground)]">{def.name}</h1>
        <p className="mb-6 mt-1 text-sm text-[var(--color-text-muted)]">
          {devices.length} baris device. Klik foto untuk upload, ubah status/catatan per OS,
          atau tambah/hapus device.
        </p>

        {category ? (
          <AdminDeviceGrid devices={devices} categoryId={category.id} categorySlug={slug} />
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
            Kategori ini belum ada di database. Jalankan script import sheet dulu.
          </p>
        )}
      </main>
    </>
  );
}
