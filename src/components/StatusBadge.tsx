import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import type { CompatibilityStatus } from "@/lib/types";

const CONFIG: Record<
  CompatibilityStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  compatible: {
    label: "Compatible",
    icon: CheckCircle2,
    className: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  },
  not_compatible: {
    label: "Tidak Compatible",
    icon: XCircle,
    className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  },
  untested: {
    label: "Belum Diuji",
    icon: HelpCircle,
    className: "bg-[var(--color-neutral-bg)] text-[var(--color-neutral)]",
  },
};

export function StatusBadge({ status }: { status: CompatibilityStatus }) {
  const { label, icon: Icon, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
