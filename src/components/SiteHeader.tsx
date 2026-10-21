import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Majoo — Home">
          <Image
            src="/majoo-wordmark.svg"
            alt="majoo"
            width={110}
            height={33}
            priority
          />
        </Link>
      </div>
    </header>
  );
}
