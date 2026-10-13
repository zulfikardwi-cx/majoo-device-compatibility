export type CompatibilityStatus = "compatible" | "not_compatible" | "untested";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type DeviceWithCategory = Device & {
  category_slug: string;
  category_name: string;
};

export type Device = {
  id: string;
  category_id: string;
  merk: string;
  type: string;
  kategori_sub: string | null;
  os: string | null;
  setting: string | null;
  device_tac: boolean | null;
  app_version: string | null;
  compatibility_status: CompatibilityStatus;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};
