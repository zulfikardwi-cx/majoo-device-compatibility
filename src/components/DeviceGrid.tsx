"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, ImageOff, ChevronDown } from "lucide-react";
import type { Device } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

export function DeviceGrid({ devices }: { devices: Device[] }) {
  const [query, setQuery] = useState("");
  const [osFilter, setOsFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const osOptions = useMemo(() => {
    const set = new Set(devices.map((d) => d.os).filter((v): v is string => !!v));
    return Array.from(set).sort();
  }, [devices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((d) => {
      if (q && !`${d.merk} ${d.type}`.toLowerCase().includes(q)) return false;
      if (osFilter !== "all" && d.os !== osFilter) return false;
      if (statusFilter !== "all" && d.compatibility_status !== statusFilter) return false;
      return true;
    });
  }, [devices, query, osFilter, statusFilter]);

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
        <select
          value={osFilter}
          onChange={(e) => setOsFilter(e.target.value)}
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">Semua OS</option>
          {osOptions.map((os) => (
            <option key={os} value={os}>
              {os}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">Semua Status</option>
          <option value="compatible">Compatible</option>
          <option value="not_compatible">Tidak Compatible</option>
          <option value="untested">Belum Diuji</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
          Tidak ada device yang cocok dengan filter ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((device) => {
            const expanded = expandedId === device.id;
            return (
              <div
                key={device.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-muted)]">
                    {device.photo_url ? (
                      <Image
                        src={device.photo_url}
                        alt={`${device.merk} ${device.type}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-[var(--color-text-muted)]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--foreground)]">{device.merk}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {device.type || "—"}
                      {device.os ? ` · ${device.os}` : ""}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={device.compatibility_status} />
                    </div>
                  </div>
                </div>

                {(device.setting || device.notes || device.kategori_sub || device.app_version) && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : device.id)}
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
                  <dl className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3 text-xs">
                    {device.kategori_sub && (
                      <Row label="Kategori" value={device.kategori_sub} />
                    )}
                    {device.setting && <Row label="Setting" value={device.setting} />}
                    {device.app_version && (
                      <Row label="Versi aplikasi" value={device.app_version} />
                    )}
                    {device.notes && <Row label="Catatan" value={device.notes} />}
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
