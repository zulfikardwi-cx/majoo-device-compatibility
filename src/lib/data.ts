import { getSupabase } from "@/lib/supabase/server";
import { CATEGORY_DEFS } from "@/lib/categories";
import type { Category, Device } from "@/lib/types";

export async function getCategoriesWithCounts() {
  const supabase = getSupabase();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  const { data: devices } = await supabase.from("devices").select("category_id");

  const counts = new Map<string, number>();
  for (const d of devices ?? []) {
    counts.set(d.category_id, (counts.get(d.category_id) ?? 0) + 1);
  }

  const bySlug = new Map((categories ?? []).map((c: Category) => [c.slug, c]));

  // Always render all 10 known categories, even if not yet seeded in the DB.
  return CATEGORY_DEFS.map((def) => {
    const row = bySlug.get(def.slug);
    return {
      slug: def.slug,
      name: def.name,
      icon: def.icon,
      id: row?.id ?? null,
      deviceCount: row ? counts.get(row.id) ?? 0 : 0,
    };
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = getSupabase();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getDevicesByCategory(categoryId: string): Promise<Device[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("devices")
    .select("*")
    .eq("category_id", categoryId)
    .order("merk")
    .order("type");
  return data ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}
