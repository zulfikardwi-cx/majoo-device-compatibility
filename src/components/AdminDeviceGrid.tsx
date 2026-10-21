"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ChevronDown, Save, Trash2, Plus, X } from "lucide-react";
import type { Device } from "@/lib/types";
import { groupDevices, type DeviceGroup } from "@/lib/group-devices";
import {
  uploadDevicePhoto,
  updateDeviceStatus,
  createDevice,
  deleteDevice,
  deleteDeviceGroup,
} from "@/app/admin/actions";

const ALL_OS = ["Android", "Windows", "iOS"];

export function AdminDeviceGrid({
  devices,
  categoryId,
  categorySlug,
}: {
  devices: Device[];
  categoryId: string;
  categorySlug: string;
}) {
  const groups = useMemo(() => groupDevices(devices), [devices]);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {showAddForm ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {showAddForm ? "Batal" : "Tambah Device"}
        </button>
      </div>

      {showAddForm && (
        <AddDeviceForm
          categoryId={categoryId}
          categorySlug={categorySlug}
          onDone={() => setShowAddForm(false)}
        />
      )}

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
          Belum ada device di kategori ini. Klik &quot;Tambah Device&quot; untuk menambahkan.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <AdminDeviceCard
              key={group.key}
              group={group}
              categoryId={categoryId}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OsCheckboxes({ exclude = [] }: { exclude?: string[] }) {
  const options = ALL_OS.filter((os) => !exclude.includes(os));
  if (options.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)]">
        Semua OS (Android/Windows/iOS) sudah ada untuk device ini.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((os) => (
        <label key={os} className="flex items-center gap-1.5 text-sm text-[var(--foreground)]">
          <input type="checkbox" name="os" value={os} className="h-4 w-4 accent-[var(--color-primary)]" />
          {os}
        </label>
      ))}
    </div>
  );
}

function AddDeviceForm({
  categoryId,
  categorySlug,
  onDone,
}: {
  categoryId: string;
  categorySlug: string;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await createDevice(formData);
        formRef.current?.reset();
        onDone();
      }}
      className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="categorySlug" value={categorySlug} />

      <Field label="Merk *">
        <input name="merk" required className={inputClass} />
      </Field>
      <Field label="Type">
        <input name="type" className={inputClass} />
      </Field>
      <Field label="Kategori (sub)">
        <input name="kategoriSub" placeholder="mis. Mobile / Dekstop" className={inputClass} />
      </Field>
      <Field label="OS yang compatible (boleh lebih dari satu)" full>
        <OsCheckboxes />
      </Field>
      <Field label="Status">
        <select name="status" className={inputClass} defaultValue="untested">
          <option value="compatible">Compatible</option>
          <option value="not_compatible">Tidak Compatible</option>
          <option value="untested">Belum Diuji</option>
        </select>
      </Field>
      <Field label="Versi aplikasi">
        <input name="appVersion" placeholder="mis. 3.2.22610" className={inputClass} />
      </Field>
      <Field label="Setting" full>
        <input name="setting" placeholder="mis. Driver: ... | Kertas 80mm" className={inputClass} />
      </Field>
      <Field label="Catatan" full>
        <input name="notes" className={inputClass} />
      </Field>

      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Simpan Device Baru
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]";

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-xs font-medium text-[var(--color-text-muted)] ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function AddVariantForm({
  group,
  categoryId,
  categorySlug,
  onDone,
}: {
  group: DeviceGroup;
  categoryId: string;
  categorySlug: string;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const existingOs = group.variants.map((v) => v.os).filter((v): v is string => !!v);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await createDevice(formData);
        formRef.current?.reset();
        onDone();
      }}
      className="mt-3 space-y-2 rounded-lg border border-dashed border-[var(--color-border)] p-3"
    >
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <input type="hidden" name="merk" value={group.merk} />
      <input type="hidden" name="type" value={group.type} />
      <input type="hidden" name="kategoriSub" value={group.kategori_sub ?? ""} />

      <p className="text-xs font-medium text-[var(--color-text-muted)]">Tambah OS baru</p>
      <OsCheckboxes exclude={existingOs} />

      {existingOs.length < ALL_OS.length && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            name="status"
            defaultValue="untested"
            className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
          >
            <option value="compatible">Compatible</option>
            <option value="not_compatible">Tidak Compatible</option>
            <option value="untested">Belum Diuji</option>
          </select>
          <input
            type="text"
            name="notes"
            placeholder="Catatan (opsional)"
            className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Simpan
          </button>
        </div>
      )}
    </form>
  );
}

function AdminDeviceCard({
  group,
  categoryId,
  categorySlug,
}: {
  group: DeviceGroup;
  categoryId: string;
  categorySlug: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);
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
        <form
          action={deleteDeviceGroup}
          onSubmit={(e) => {
            if (!confirm(`Hapus seluruh varian OS untuk ${group.merk} ${group.type}?`)) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="deviceIds" value={deviceIds} />
          <input type="hidden" name="categorySlug" value={categorySlug} />
          <button
            type="submit"
            aria-label={`Hapus ${group.merk} ${group.type}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="mt-3 space-y-2">
        {group.variants.map((v) => (
          <VariantEditRow key={v.id} device={v} categorySlug={categorySlug} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowAddVariant((v) => !v)}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-muted)]"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        {showAddVariant ? "Batal tambah OS" : "Tambah OS (update kompatibilitas)"}
      </button>

      {showAddVariant && (
        <AddVariantForm
          group={group}
          categoryId={categoryId}
          categorySlug={categorySlug}
          onDone={() => setShowAddVariant(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-muted)]"
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
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-muted)] px-3 py-2">
      <form
        action={updateDeviceStatus}
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
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
      <form
        action={deleteDevice}
        onSubmit={(e) => {
          if (!confirm(`Hapus baris ${device.os ?? ""} untuk ${device.merk} ${device.type}?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="deviceId" value={device.id} />
        <input type="hidden" name="categorySlug" value={categorySlug} />
        <button
          type="submit"
          aria-label="Hapus baris ini"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
