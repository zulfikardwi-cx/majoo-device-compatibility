"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ChevronDown, Save } from "lucide-react";
import type { Device } from "@/lib/types";
import { groupDevices, type DeviceGroup } from "@/lib/group-devices";
import { uploadDevicePhoto, updateDeviceStatus } from "@/app/admin/actions";

export function AdminDeviceGrid({
  devices,
  categorySlug,
}: {
  devices: Device[];
  categorySlug: string;
}) {
  const groups = useMemo(() => groupDevices(devices), [devices]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <AdminDeviceCard key={group.key} group={group} categorySlug={categorySlug} />
      ))}
    </div>
  );
}

function AdminDeviceCard({
  group,
  categorySlug,
}: {
  group: DeviceGroup;
  categorySlug: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const photoFormRef = useRef<HTMLFormElement>(null);
  const deviceIds = group.variants.map((v) => v.id).join(",");

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex gap-4">
        <form ref={photoFormRef} action={uploadDevicePhoto}>
          <input type="hidden" name="deviceIds" value={deviceIds} />
          <input type="hidden" name="categorySlug" value={categorySlug} />
          <label className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[var(--color-muted)]">
            {group.photo_url ? (
              <Image
                src={group.photo_url}
                alt={`${group.merk} ${group.type}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-5 w-5 text-[var(--color-text-muted)]" aria-hidden="true" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="hidden"
              onChange={() => photoFormRef.current?.requestSubmit()}
            />
          </label>
        </form>
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

      <div className="mt-3 space-y-2">
        {group.variants.map((v) => (
          <VariantEditRow key={v.id} device={v} categorySlug={categorySlug} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-muted)]"
      >
        {expanded ? "Sembunyikan info lain" : "Info lain (setting, versi, catatan)"}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-[var(--color-border)] pt-3 text-xs">
          {group.variants.map((v) => {
            if (!v.setting && !v.app_version) return null;
            return (
              <div key={v.id} className="space-y-1.5">
                {group.variants.length > 1 && (
                  <p className="font-semibold text-[var(--foreground)]">{v.os}</p>
                )}
                {v.setting && (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Setting</dt>
                    <dd className="mt-0.5 text-[var(--foreground)]">{v.setting}</dd>
                  </div>
                )}
                {v.app_version && (
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Versi aplikasi</dt>
                    <dd className="mt-0.5 text-[var(--foreground)]">{v.app_version}</dd>
                    <dd className="text-[var(--color-text-muted)]">atau versi lebih baru</dd>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VariantEditRow({
  device,
  categorySlug,
}: {
  device: Device;
  categorySlug: string;
}) {
  return (
    <form
      action={updateDeviceStatus}
      className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-muted)] px-3 py-2"
    >
      <input type="hidden" name="deviceId" value={device.id} />
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <span className="w-20 shrink-0 text-sm font-medium text-[var(--foreground)]">
        {device.os ?? "—"}
      </span>
      <select
        name="status"
        defaultValue={device.compatibility_status}
        className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
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
        className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
      />
      <button
        type="submit"
        aria-label="Simpan"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-white hover:opacity-90"
      >
        <Save className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </form>
  );
}
