// Generates sql/seed.sql from a snapshot of the Google Sheet (fetched via MCP tool
// during setup, pasted below) so it can be run once without needing Google service
// account credentials. For future re-imports, use scripts/import-sheet.mjs instead.
import { writeFileSync } from "node:fs";

const CATEGORIES = [
  { slug: "desktop-customer-display", name: "Desktop + Customer Display", order: 1 },
  { slug: "printer-label-fnb", name: "Printer Label F&B", order: 2 },
  { slug: "printer-bluetooth", name: "Printer Bluetooth", order: 3 },
  { slug: "printer-barcode", name: "Printer Barcode", order: 4 },
  { slug: "printer-lan", name: "Printer LAN", order: 5 },
  { slug: "barcode-scanner", name: "Barcode Scanner", order: 6 },
  { slug: "printer-dot-matrix", name: "Printer Dot Matrix", order: 7 },
  { slug: "customer-display-bluetooth", name: "Customer Display Bluetooth", order: 8 },
  { slug: "webcam", name: "Webcam", order: 9 },
  { slug: "cash-drawer", name: "Cash Drawer", order: 10 },
];

const SHEETS = {
  "desktop-customer-display": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Sunmi","T2","Android","Driver: Sunmi | Kertas 80mm","TRUE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["Kassen","XA-923","Android","Driver: Sunmi / Generic 1 | Kertas 80mm","TRUE","Compatible"],["Telpo ","C8","Android","","TRUE","Compatible"],["Telpo ","C9","Android","","FALSE","Compatible"],["Imin ","Swan 1","Android","Driver: Sunmi / Generic 1 | Kertas 80mm","FALSE","Compatible"],["Imin ","Swan 2","Android","Driver: Sunmi / Generic 1 | Kertas 80mm","FALSE","Compatible"],["Imin ","D4","Android","Driver: Sunmi / Generic 1 | Kertas 80mm","TRUE","Compatible"],["Telpo ","M10","Android","Driver: Telpo | Kertas 80mm","FALSE","Compatible"],["Telpo ","C11B / C11","Android","","FALSE","Compatible"],["Imin ","Swan 2 Printer"]],
  "printer-label-fnb": [["","Merk","Type","OS","Setting","Device TAC","3.2.22607","Hotfix","User yang menggunakan printer ini","Gambar device"],["","VSC","LP-9210UB","Android","Driver: VSC LP-9210UB-01 | Kertas 30x20, 40x30","TRUE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["","VSC","LP-9210UB","Windows","Driver: VSC LP-9210UB-01 | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","VSC","LP-9210UB","iOS","Driver: VSC LP-9210UB-01 | Kertas 30x20, 40x30","TRUE"],["","Iware"," IW 385B","Android","Driver: Xprinter XP-365B  | Kertas 30x20, 40x30","TRUE"],["","Iware"," IW 385B","Windows","Driver: Xprinter XP-365B  | Kertas 30x20, 40x30","TRUE"],["","Iware"," IW 385B","iOS","Driver: Xprinter XP-365B  | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","Xprinter  ","Xp-D4610B","Android","Driver:  Xp-D4610B | Kertas 30x20, 40x30","TRUE"],["","Xprinter  ","Xp-D4610B","Windows","Driver:  Xp-D4610B | Kertas 30x20, 40x30","TRUE"],["","Xprinter  ","Xp-D4610B","iOS","Driver:  Xp-D4610B | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","Xprinter  ","XP-420B","Android","Driver:  XP-420B | Kertas 30x20, 40x30","TRUE"],["","Xprinter  ","XP-420B","Windows","Driver:  XP-420B | Kertas 30x20, 40x30","TRUE"],["","Xprinter  ","XP-420B","iOS","Driver:  XP-420B | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","IDPRT ","880","Android","Driver: IDPRT ID880 | Kertas 30x20, 40x30","TRUE","","3.2.22614 / 3.2.22656","KOPI BONO CND"],["","IDPRT ","880","Windows","Driver: IDPRT ID880 | Kertas 30x20, 40x30","TRUE","","3.2.22614 / 3.2.22656"],["","IDPRT ","880","iOS","Driver: IDPRT ID880 | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","Blueprint","EO80BT","Android","Driver:  | Kertas 30x20, 40x30","TRUE","","","SMD"],["","Blueprint","EO80BT","Windows","Driver:  | Kertas 30x20, 40x30","TRUE"],["","Blueprint","EO80BT","iOS","Driver:  | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","VSC ","LP-9250","Android","Driver: VSC LP-9210UB-01 | Kertas 30x20, 40x30","TRUE"],["","VSC ","LP-9250","Windows","Driver: VSC LP-9210UB-01 | Kertas 30x20, 40x30","TRUE"],["","VSC ","LP-9250","iOS","Driver: VSC LP-9210UB-01 | Kertas 30x20, 40x30","TRUE","Tidak Compatible"],["","Panda","PRJ-80BL","Android","Driver: PRJ-80BL | Kertas 80x50","TRUE","Compatible"],["","Panda","PRJ-80BL","Windows","Driver: PRJ-80BL | Kertas 80x50","TRUE"],["","Panda","PRJ-80BL","iOS","Driver: PRJ-80BL | Kertas 80x50","TRUE","Tidak Compatible"],["","Panda","PRJ-R80BL","Android","Driver: PRJ-R80BL | Kertas 80x50","TRUE","Compatible"],["","Panda","PRJ-R80BL","Windows","Driver: PRJ-R80BL | Kertas 80x50","TRUE"],["","Panda","PRJ-R80BL","iOS","Driver: PRJ-R80BL | Kertas 80x50","TRUE","Tidak Compatible"]],
  "printer-bluetooth": [["Merk","Type","Kategori","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Enibit","JZ-SPT12BT","Mobile","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["Enibit","JZ-SPT12BT","Mobile","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Enibit","JZ-SPT12BT","Mobile","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Sano","P5880","Mobile","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Sano","P5880","Mobile","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Sano","P5880","Mobile","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Eppos","POS80L","Mobile","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Eppos","POS80L","Mobile","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Eppos","POS80L","Mobile","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda","PRJ CX-58","Mobile","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda","PRJ CX-58","Mobile","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda","PRJ CX-58","Mobile","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda ","58printer","Dekstop","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda ","58printer","Dekstop","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda ","58printer","Dekstop","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Iware","C58BT","Dekstop","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Iware","C58BT","Dekstop","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Iware","C58BT","Dekstop","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda ","PRJ 58D","Dekstop","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda ","PRJ 58D","Dekstop","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Panda ","PRJ 58D","Dekstop","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Woya ","WP80DX","Dekstop","Android","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Woya ","WP80DX","Dekstop","Windows","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["Woya ","WP80DX","Dekstop","iOS","Driver: Generic 1 | Kertas 58mm","TRUE","Compatible"],["VSC","TM 58D pro","","","","","","","Joy cafe"],["VSC","TM 58D pro"],["VSC","TM 58D pro"]],
  "printer-barcode": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini"]],
  "printer-lan": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini"],["Epson","TMT82","Android","Driver: Epson TMT82 | Kertas 80mm","TRUE","Compatible"],["Epson","TMT82","Windows","Driver: Epson TMT82 | Kertas 80mm","TRUE","Compatible"],["Epson","TMT82","iOS","Driver: Epson TMU220 | Kertas 80mm","TRUE","Compatible"],["Epson","TMU220","Android","Driver: Epson TMU220 | Kertas 80mm","TRUE","Compatible"],["Epson","TMU220","Windows","Driver: Epson TMU220 | Kertas 80mm","TRUE","Compatible"],["Epson","TMU220","iOS","Driver: Epson TMT82 | Kertas 80mm","TRUE","Compatible"],["Janz","PT250","Android","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Janz","PT250","Windows","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Janz","PT250","iOS","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","XS-80UL","Android","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","XS-80UL","Windows","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","XS-80UL","iOS","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","D200N","Android","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","D200N","Windows","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","D200N","iOS","Driver: Generic1 | Kertas 80mm","TRUE","Compatible"],["Iware ","IW-J82ULW","Android"],["Iware ","IW-J82ULW","Windows"],["Iware ","IW-J82ULW","iOS"],["Panda ","PRJ U80300II","Android"],["Panda ","PRJ U80300II","Windows"],["Panda ","PRJ U80300II","iOS"],["Panda ","POS80UL","Android"],["Panda ","POS80UL","Windows"],["Panda ","POS80UL","iOS"],["VSC","TM82UL","Android"],["VSC","TM82UL","Windows"],["VSC","TM82UL","iOS"],["Iware ","IW-8220","Android"],["Iware ","IW-8220","Windows"],["Iware ","IW-8220","iOS"],["Iware ","XH-80UL","Android"],["Iware ","XH-80UL","Windows"],["Iware ","XH-80UL","iOS"],["Epson","TMT83II","Android"],["Epson","TMT83II","Windows"],["Epson","TMT83II","iOS"],["Panda ","PRJ-80USE","Android"],["Panda ","PRJ-80USE","Windows"],["Panda ","PRJ-80USE","iOS"],["Epson","TMT82X","Android"],["Epson","TMT82X","Windows"],["Epson","TMT82X","iOS"]],
  "barcode-scanner": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Panda","BT888","Android","Blutooth HID","FALSE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["Panda","BT888","Windows","Blutooth HID","FALSE","Compatible"],["Panda","BT888","iOS","Blutooth HID","FALSE","Compatible"],["VSC","BT-895s","Android","Blutooth HID","TRUE","Compatible"],["VSC","BT-895s","Windows","Blutooth HID","TRUE","Compatible"],["VSC","BT-895s","iOS","Blutooth HID","TRUE","Compatible"],["Blueprint","OM200","Android","Blutooth HID","TRUE","Compatible"],["Blueprint","OM200","Windows","Blutooth HID","TRUE","Compatible"],["Blueprint","OM200","iOS","Blutooth HID","TRUE","Compatible"],["Minjcode","MJ9220","Android","Blutooth HID","TRUE","Compatible"],["Minjcode","MJ9220","Windows","Blutooth HID","TRUE","Compatible"],["Minjcode","MJ9220","iOS","Blutooth HID","TRUE","Compatible"]],
  "printer-dot-matrix": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Epson","LQ310","Windows","OS - Windows","TRUE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["Epson","LQ310","iOS","OS - MAC","TRUE","Compatible"]],
  "customer-display-bluetooth": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Samsung","A7 Lite","Android","Customer dispay sxternal","TRUE","Compatible"],["Advan","Tab galelea / Tab belajar","Android","Customer dispay sxternal","TRUE","Compatible"]],
  "webcam": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Logitech ","C260","Windows","Logitech C260 (driver)","TRUE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["Logitech ","C260","Android","Logitech C260 (driver)","TRUE","Compatible"]],
  "cash-drawer": [["Merk","Type","OS","Setting","Device TAC","3.2.22608","Hotfix","User yang menggunakan printer ini","Gambar device"],["Panda","4042","Android","RJ11 (pug n play)","TRUE","Compatible","","","https://drive.google.com/drive/folders/1cBZJxMQ27DB5AZYuWti-V3ht8pxMxDju?usp=drive_link"],["Panda","4042","Windows","RJ11 (pug n play)","TRUE","Compatible"],["Panda","4042","iOS","RJ11 (pug n play)","TRUE","Compatible"],["StarMpop","","Android","Driver ( Star mpop )","TRUE","Compatible"],["StarMpop","","iOS","Driver ( Star mpop )","TRUE","Compatible"]],
};

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

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function rowsToDevices(rows) {
  if (!rows || rows.length === 0) return [];
  let [header, ...dataRows] = rows;
  if (header[0] === "") {
    header = header.slice(1);
    dataRows = dataRows.map((r) => r.slice(1));
  }
  const col = (row, name) => {
    const idx = header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
    return idx === -1 ? "" : (row[idx] ?? "").toString().trim();
  };
  const versionHeaderIdx = header.findIndex((h) => /^\d/.test(h.trim()));
  const versionHeader = versionHeaderIdx === -1 ? null : header[versionHeaderIdx];

  return dataRows
    .filter((row) => row.some((cell) => (cell ?? "").toString().trim() !== ""))
    .map((row) => {
      // The column literally named after the app version (e.g. "3.2.22608") holds
      // this row's compatibility status for that version. "Hotfix" holds an extra
      // version note (when a hotfix was needed), not the status itself.
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

let sql = `-- Generated by scripts/generate-seed.mjs — one-time seed from the Google Sheet snapshot.\n\n`;

for (const cat of CATEGORIES) {
  sql += `insert into categories (slug, name, sort_order) values (${esc(cat.slug)}, ${esc(cat.name)}, ${cat.order})\n  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;\n\n`;
}

for (const cat of CATEGORIES) {
  const devices = rowsToDevices(SHEETS[cat.slug] ?? []);
  if (devices.length === 0) continue;
  sql += `-- ${cat.name} (${devices.length} devices)\n`;
  sql += `insert into devices (category_id, merk, type, kategori_sub, os, setting, device_tac, app_version, compatibility_status, notes)\nselect c.id, v.merk, v.type, v.kategori_sub, v.os, v.setting, v.device_tac, v.app_version, v.compatibility_status::compatibility_status, v.notes\nfrom (values\n`;
  sql += devices
    .map(
      (d) =>
        `  (${esc(d.merk)}, ${esc(d.type)}, ${esc(d.kategori_sub)}, ${esc(d.os)}, ${esc(
          d.setting
        )}, ${d.device_tac === null ? "NULL" : d.device_tac}, ${esc(d.app_version)}, ${esc(
          d.compatibility_status
        )}, ${esc(d.notes)})`
    )
    .join(",\n");
  sql += `\n) as v(merk, type, kategori_sub, os, setting, device_tac, app_version, compatibility_status, notes)\ncross join (select id from categories where slug = ${esc(cat.slug)}) as c;\n\n`;
}

writeFileSync(new URL("../sql/seed.sql", import.meta.url), sql);
console.log("Wrote sql/seed.sql");
