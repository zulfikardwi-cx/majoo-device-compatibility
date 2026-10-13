"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, ImageOff, ChevronDown } from "lucide-react";
import type { Device } from "@/lib/types";
import { groupDevices, type DeviceGroup } from "@/lib/group-devices";
import { StatusBadge } from "@/components/StatusBadge";

export function DeviceGrid({ devices }: { devices: Device[] }) {
  const [query, setQuery] = useState("");
  const [osFilter, setOsFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const osOptions = useMemo(() => {
    const set = new Set(devices.map((d) => d.os).filter((v): v is string => !!v));
    return Array.from(set).sort();
  }, [devices]);

  const groups = useMemo(() => groupDevices(devices), [devices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (q && !`${g.merk} ${g.type}`.toLowerCase().includes(q)) return false;
      if (osFilter !== "all" && !g.variants.some((v) => v.os === osFilter)) return false;
      if (
        statusFilter !== "all" &&
        !g.variants.some((v) => v.compatibility_status === statusFilter)
      )
        return false;
      return true;
    });
  }, [groups, query, osFilter, statusFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari merk atau tipe device..."
            className="w-full rounded-full border border-[var(--color-border)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <div className="relative">
          <select
            value={osFilter}
            onChange={(e) => setOsFilter(e.target.value)}
            className="appearance-none rounded-full border border-[var(--color-border)] bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="all">Semua OS</option>
            {osOptions.map((os) => (
              <option key={os} value={os}>
                {os}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-full border border-[var(--color-border)] bg-white py-2.5 pl-4 pr-9 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="all">Semua Status</option>
            <option value="compatible">Compatible</option>
            <option value="not_compatible">Tidak Compatible</option>
            <option value="untested">Belum Diuji</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
          Tidak ada device yang cocok dengan filter ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((group) => (
            <DeviceGroupCard
              key={group.key}
              group={group}
              expanded={expandedKey === group.key}
              onToggle={() =>
                setExpandedKey(expandedKey === group.key ? null : group.key)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceGroupCard({
  group,
  expanded,
  onToggle,
}: {
  group: DeviceGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasDetails = group.variants.some(
    (v) => v.setting || v.notes || v.app_version
  );

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-muted)]">
          {group.photo_url ? (
            <Image
              src={group.photo_url}
              alt={`${group.merk} ${group.type}`}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageOff className="h-6 w-6 text-[var(--color-text-muted)]" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[var(--foreground)]">
            {group.merk}
            <span className="font-normal text-[var(--color-text-muted)]"> — {group.type || "—"}</span>
          </p>
          {group.kategori_sub && (
            <p className="text-xs text-[var(--color-text-muted)]">{group.kategori_sub}</p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {group.variants.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-muted)] px-3 py-1.5"
          >
            <span className="text-sm font-medium text-[var(--foreground)]">
              {v.os ?? "OS tidak diketahui"}
            </span>
            <StatusBadge status={v.compatibility_status} />
          </div>
        ))}
      </div>

      {hasDetails && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-muted)]"
        >
          {expanded ? "Sembunyikan detail" : "Lihat detail"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-[var(--color-border)] pt-3 text-xs">
          {group.variants.map((v) => {
            if (!v.setting && !v.notes && !v.app_version) return null;
            return (
              <div key={v.id} className="space-y-1.5">
                {group.variants.length > 1 && (
                  <p className="font-semibold text-[var(--foreground)]">{v.os}</p>
                )}
                {v.setting && <Row label="Setting" value={v.setting} />}
                {v.app_version && (
                  <Row label="Versi aplikasi" value={v.app_version} suffix="atau versi lebih baru" />
                )}
                {v.notes && <Row label="Catatan" value={v.notes} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-0.5 text-[var(--foreground)]">{value}</dd>
      {suffix && <dd className="text-[var(--color-text-muted)]">{suffix}</dd>}
    </div>
  );
}
