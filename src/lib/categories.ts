import {
  Monitor,
  Printer,
  Bluetooth,
  Barcode,
  Network,
  ScanLine,
  FileText,
  MonitorSmartphone,
  Camera,
  Archive,
  type LucideIcon,
} from "lucide-react";

export type CategoryDef = {
  slug: string;
  name: string;
  sheetTab: string;
  icon: LucideIcon;
  order: number;
};

/** Source of truth mapping each Google Sheet tab to a website category. */
export const CATEGORY_DEFS: CategoryDef[] = [
  { slug: "desktop-customer-display", name: "Desktop + Customer Display", sheetTab: "Desktop + Customer Display", icon: Monitor, order: 1 },
  { slug: "printer-label-fnb", name: "Printer Label F&B", sheetTab: "Printer Label FnB", icon: FileText, order: 2 },
  { slug: "printer-bluetooth", name: "Printer Bluetooth", sheetTab: "Printer Bluetooth", icon: Bluetooth, order: 3 },
  { slug: "printer-barcode", name: "Printer Barcode", sheetTab: "Printer Barcode", icon: Barcode, order: 4 },
  { slug: "printer-lan", name: "Printer LAN", sheetTab: "Printer LAN", icon: Network, order: 5 },
  { slug: "barcode-scanner", name: "Barcode Scanner", sheetTab: "Barcode Scanner", icon: ScanLine, order: 6 },
  { slug: "printer-dot-matrix", name: "Printer Dot Matrix", sheetTab: "Printer Dot Matrix", icon: Printer, order: 7 },
  { slug: "customer-display-bluetooth", name: "Customer Display Bluetooth", sheetTab: "Customer Display Bluetooth", icon: MonitorSmartphone, order: 8 },
  { slug: "webcam", name: "Webcam", sheetTab: "Webcam", icon: Camera, order: 9 },
  { slug: "cash-drawer", name: "Cash Drawer", sheetTab: "Cash Drawer", icon: Archive, order: 10 },
];
