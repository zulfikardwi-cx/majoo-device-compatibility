import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/admin/actions";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2"
          aria-label="Admin — Dashboard"
        >
          <Image src="/majoo-wordmark.svg" alt="majoo" width={100} height={30} priority />
          <span className="hidden rounded-full bg-[var(--color-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary-dark)] sm:inline">
            Admin
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/"
            target="_blank"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)] transition-colors"
          >
            Lihat situs publik
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-[var(--foreground)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
            >
              Keluar
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
