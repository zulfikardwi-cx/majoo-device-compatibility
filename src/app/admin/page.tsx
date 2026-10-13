import { redirect } from "next/navigation";
import Image from "next/image";
import { isAdminAuthenticated } from "@/lib/auth";
import { login } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin">) {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-[var(--color-muted)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image src="/majoo-wordmark.svg" alt="majoo" width={120} height={36} />
        </div>
        <h1 className="mb-1 text-center text-lg font-semibold text-[var(--foreground)]">
          Admin Login
        </h1>
        <p className="mb-6 text-center text-sm text-[var(--color-text-muted)]">
          Kelola foto &amp; status device compatibility.
        </p>
        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              Password salah. Coba lagi.
            </p>
          )}
          <button
            type="submit"
            className="gradient-brand w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}
