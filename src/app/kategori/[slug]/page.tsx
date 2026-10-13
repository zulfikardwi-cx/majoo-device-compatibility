import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DeviceGrid } from "@/components/DeviceGrid";
import { getCategoryBySlug, getDevicesByCategory } from "@/lib/data";
import { CATEGORY_DEFS } from "@/lib/categories";

export default async function CategoryPage({
  params,
}: PageProps<"/kategori/[slug]">) {
  const { slug } = await params;
  const def = CATEGORY_DEFS.find((c) => c.slug === slug);
  if (!def) notFound();

  const category = await getCategoryBySlug(slug);
  const devices = category ? await getDevicesByCategory(category.id) : [];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Semua kategori
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{def.name}</h1>
          <p className="mb-6 mt-1 text-sm text-[var(--color-text-muted)]">
            {devices.length} device terdaftar di kategori ini.
          </p>

          {devices.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
              Belum ada data device untuk kategori ini.
            </p>
          ) : (
            <DeviceGrid devices={devices} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
