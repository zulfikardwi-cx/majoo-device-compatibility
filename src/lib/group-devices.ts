import type { Device, DeviceWithCategory } from "@/lib/types";

export type DeviceGroup = {
  key: string;
  merk: string;
  type: string;
  kategori_sub: string | null;
  photo_url: string | null;
  category_slug?: string;
  category_name?: string;
  variants: Device[];
};

export function groupDevices(devices: Device[]): DeviceGroup[] {
  const groups = new Map<string, DeviceGroup>();
  for (const d of devices) {
    const key = `${d.merk.trim().toLowerCase()}|${d.type.trim().toLowerCase()}|${
      d.kategori_sub?.trim().toLowerCase() ?? ""
    }`;
    const existing = groups.get(key);
    if (existing) {
      existing.variants.push(d);
      if (!existing.photo_url && d.photo_url) existing.photo_url = d.photo_url;
    } else {
      groups.set(key, {
        key,
        merk: d.merk,
        type: d.type,
        kategori_sub: d.kategori_sub,
        photo_url: d.photo_url,
        variants: [d],
      });
    }
  }
  return Array.from(groups.values());
}

/** Same grouping, but keyed per category too (merging all categories can repeat merk+type). */
export function groupDevicesWithCategory(devices: DeviceWithCategory[]): DeviceGroup[] {
  const groups = new Map<string, DeviceGroup>();
  for (const d of devices) {
    const key = `${d.category_slug}|${d.merk.trim().toLowerCase()}|${d.type
      .trim()
      .toLowerCase()}|${d.kategori_sub?.trim().toLowerCase() ?? ""}`;
    const existing = groups.get(key);
    if (existing) {
      existing.variants.push(d);
      if (!existing.photo_url && d.photo_url) existing.photo_url = d.photo_url;
    } else {
      groups.set(key, {
        key,
        merk: d.merk,
        type: d.type,
        kategori_sub: d.kategori_sub,
        photo_url: d.photo_url,
        category_slug: d.category_slug,
        category_name: d.category_name,
        variants: [d],
      });
    }
  }
  return Array.from(groups.values());
}
