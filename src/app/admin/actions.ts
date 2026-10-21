"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkAdminPassword,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  isAdminAuthenticated,
} from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { CompatibilityStatus } from "@/lib/types";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    redirect("/admin?error=1");
  }
  await setAdminSessionCookie();
  redirect("/admin/dashboard");
}

export async function logout() {
  await clearAdminSessionCookie();
  redirect("/admin");
}

export async function uploadDevicePhoto(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authenticated");
  }

  // One physical device can have several rows (one per OS) — the photo applies
  // to all of them, so deviceIds is a comma-separated list of every variant's id.
  const deviceIds = String(formData.get("deviceIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const file = formData.get("photo") as File | null;
  if (deviceIds.length === 0 || !file || file.size === 0) return;

  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${deviceIds[0]}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("device-photos")
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from("device-photos").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("devices")
    .update({ photo_url: publicUrl.publicUrl, updated_at: new Date().toISOString() })
    .in("id", deviceIds);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/admin/dashboard/${categorySlug}`);
  revalidatePath("/");
}

export async function createDevice(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authenticated");
  }

  const categoryId = String(formData.get("categoryId") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const merk = String(formData.get("merk") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const kategoriSub = String(formData.get("kategoriSub") ?? "").trim();
  const os = String(formData.get("os") ?? "").trim();
  const setting = String(formData.get("setting") ?? "").trim();
  const appVersion = String(formData.get("appVersion") ?? "").trim();
  const status = String(formData.get("status") ?? "untested") as CompatibilityStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!categoryId || !merk) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("devices").insert({
    category_id: categoryId,
    merk,
    type,
    kategori_sub: kategoriSub || null,
    os: os || null,
    setting: setting || null,
    app_version: appVersion || null,
    compatibility_status: status,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/dashboard/${categorySlug}`);
  revalidatePath("/");
}

export async function deleteDevice(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authenticated");
  }

  const deviceId = String(formData.get("deviceId") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  if (!deviceId) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("devices").delete().eq("id", deviceId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/dashboard/${categorySlug}`);
  revalidatePath("/");
}

export async function deleteDeviceGroup(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authenticated");
  }

  const deviceIds = String(formData.get("deviceIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const categorySlug = String(formData.get("categorySlug") ?? "");
  if (deviceIds.length === 0) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("devices").delete().in("id", deviceIds);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/dashboard/${categorySlug}`);
  revalidatePath("/");
}

export async function updateDeviceStatus(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authenticated");
  }

  const deviceId = String(formData.get("deviceId") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const status = String(formData.get("status") ?? "") as CompatibilityStatus;
  const notes = String(formData.get("notes") ?? "");
  if (!deviceId) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("devices")
    .update({
      compatibility_status: status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deviceId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/dashboard/${categorySlug}`);
  revalidatePath("/");
}
