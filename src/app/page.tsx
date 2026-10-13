import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCategoriesWithCounts } from "@/lib/data";

export default async function Home() {
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="gradient-brand">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Device Compatibility majoo
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-balance text-white/90">
              Cek printer, scanner, cash drawer, dan perangkat lain yang sudah teruji
              compatible dengan sistem kasir majoo.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="mb-6 text-lg font-semibold text-[var(--foreground)]">
            Pilih kategori device
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
