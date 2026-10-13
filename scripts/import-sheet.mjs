// One-time import: reads every tab of the device-compatibility Google Sheet
// and inserts categories + devices into Supabase.
//
// Requires env vars:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
// Usage: node scripts/import-sheet.mjs

import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const SPREADSHEET_ID = "1mwcHuDvZ1Zw-R1OOlBmwrIZjvAnEL4OoUpZDfXdygXY";

const CATEGORY_DEFS = [
  { slug: "desktop-customer-display", name: "Desktop + Customer Display", sheetTab: "Desktop + Customer Display", order: 1 },
  { slug: "printer-label-fnb", name: "Printer Label F&B", sheetTab: "Printer Label FnB", order: 2 },
  { slug: "printer-bluetooth", name: "Printer Bluetooth", sheetTab: "Printer Bluetooth", order: 3 },
  { slug: "printer-barcode", name: "Printer Barcode", sheetTab: "Printer Barcode", order: 4 },
  { slug: "printer-lan", name: "Printer LAN", sheetTab: "Printer LAN", order: 5 },
  { slug: "barcode-scanner", name: "Barcode Scanner", sheetTab: "Barcode Scanner", order: 6 },
  { slug: "printer-dot-matrix", name: "Printer Dot Matrix", sheetTab: "Printer Dot Matrix", order: 7 },
  { slug: "customer-display-bluetooth", name: "Customer Display Bluetooth", sheetTab: "Customer Display Bluetooth", order: 8 },
  { slug: "webcam", name: "Webcam", sheetTab: "Webcam", order: 9 },
  { slug: "cash-drawer", name: "Cash Drawer", sheetTab: "Cash Drawer", order: 10 },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function normalizeStatus(raw) {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "compatible") return "compatible";
  if (value === "tidak compatible" || value === "not compatible") return "not_compatible";
  return "untested";
}

function toBoolOrNull(raw) {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/** Drop a leading blank column some tabs have, and map the rest by header name. */
function rowsToDevices(rows) {
  if (!rows || rows.length === 0) return [];
  let [header, ...dataRows] = rows;

  // If the first header cell is empty, the whole sheet is shifted right by one column.
  if (header[0] === "") {
    header = header.slice(1);
    dataRows = dataRows.map((r) => r.slice(1));
  }

  const col = (row, name) => {
    const idx = header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
    return idx === -1 ? "" : (row[idx] ?? "").toString().trim();
  };

  // The "version" header differs per tab (e.g. "3.2.22608" / "3.2.22607"). The column
  // literally named after that version holds this row's compatibility status for it;
  // "Hotfix" holds an extra version note (when a hotfix was needed), not the status.
  const versionHeaderIdx = header.findIndex((h) => /^\d/.test(h.trim()));
  const versionHeader = versionHeaderIdx === -1 ? null : header[versionHeaderIdx];

  return dataRows
    .filter((row) => row.some((cell) => (cell ?? "").toString().trim() !== ""))
    .map((row) => {
      const statusRaw = versionHeader ? col(row, versionHeader) : "";
      const hotfixNote = col(row, "Hotfix");
      const userNote = col(row, "User yang menggunakan printer ini");
      const notes = [hotfixNote ? `Hotfix: ${hotfixNote}` : null, userNote || null]
        .filter(Boolean)
        .join(" | ") || null;

      return {
        merk: col(row, "Merk"),
        type: col(row, "Type"),
        kategori_sub: col(row, "Kategori") || null,
        os: col(row, "OS") || null,
        setting: col(row, "Setting") || null,
        device_tac: toBoolOrNull(col(row, "Device TAC")),
        app_version: versionHeader,
        compatibility_status: normalizeStatus(statusRaw),
        notes,
      };
    })
    .filter((d) => d.merk !== "");
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const clientEmail = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");

  const supabase = createClient(supabaseUrl, serviceKey);

  const auth = new google.auth.JWT(clientEmail, undefined, privateKey, [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ]);
  const sheets = google.sheets({ version: "v4", auth });

  for (const def of CATEGORY_DEFS) {
    console.log(`\n=== ${def.name} ===`);

    const { data: category, error: catErr } = await supabase
      .from("categories")
      .upsert({ slug: def.slug, name: def.name, sort_order: def.order }, { onConflict: "slug" })
      .select()
      .single();
    if (catErr) {
      console.error("Failed to upsert category:", catErr.message);
      continue;
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${def.sheetTab}'!A1:Z1000`,
    });
    const devices = rowsToDevices(res.data.values ?? []);
    console.log(`  ${devices.length} device rows found`);

    if (devices.length === 0) continue;

    // Clear previous import for this category to keep this script idempotent,
    // then re-insert. Photos are stored by device id, so re-running before any
    // photo upload is safe; after photos are uploaded, avoid re-running this import.
    await supabase.from("devices").delete().eq("category_id", category.id);

    const { error: insertErr } = await supabase
      .from("devices")
      .insert(devices.map((d) => ({ ...d, category_id: category.id })));
    if (insertErr) {
      console.error("  Failed to insert devices:", insertErr.message);
    } else {
      console.log(`  Inserted ${devices.length} devices.`);
    }
  }

  console.log("\nImport finished.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
