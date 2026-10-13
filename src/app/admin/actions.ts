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

  const deviceId = String(formData.get("deviceId") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const file = formData.get("photo") as File | null;
  if (!deviceId || !file || file.size === 0) return;

  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${deviceId}-${Date.now()}.${ext}`;

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
    .eq("id", deviceId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/admin/dashboard/${categorySlug}`);
  revalidatePath(`/kategori/${categorySlug}`);
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
  revalidatePath(`/kategori/${categorySlug}`);
}
