import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImageOff } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadDevicePhoto, updateDeviceStatus } from "@/app/admin/actions";
import { getCategoryBySlug, getDevicesByCategory } from "@/lib/data";
import { CATEGORY_DEFS } from "@/lib/categories";

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
    <main className="mx-auto max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/admin/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Semua kategori
      </Link>
      <h1 className="mb-6 text-xl font-bold text-[var(--foreground)]">{def.name}</h1>

      {devices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
          Belum ada device di kategori ini. Jalankan script import sheet dulu.
        </p>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:flex-row"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-muted)]">
                {device.photo_url ? (
                  <Image
                    src={device.photo_url}
                    alt={`${device.merk} ${device.type}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-7 w-7 text-[var(--color-text-muted)]" aria-hidden="true" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {device.merk} {device.type}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">{device.os}</p>
                </div>

                <form
                  action={uploadDevicePhoto}
                  className="flex flex-wrap items-center gap-2"
                  encType="multipart/form-data"
                >
                  <input type="hidden" name="deviceId" value={device.id} />
                  <input type="hidden" name="categorySlug" value={slug} />
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Upload Foto
                  </button>
                </form>

                <form action={updateDeviceStatus} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="deviceId" value={device.id} />
                  <input type="hidden" name="categorySlug" value={slug} />
                  <select
                    name="status"
                    defaultValue={device.compatibility_status}
                    className="rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs"
                  >
                    <option value="compatible">Compatible</option>
                    <option value="not_compatible">Tidak Compatible</option>
                    <option value="untested">Belum Diuji</option>
                  </select>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={device.notes ?? ""}
                    placeholder="Catatan"
                    className="flex-1 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--color-primary)]"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
