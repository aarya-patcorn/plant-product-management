const GOOGLE_SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbyCGI_CSruWEfYdO6qcPOYkEODP9Tp0a6U4JqbGlVZKRjRZ2hrgRXLeE_BcGVvVMJCh0g/exec";

type SheetFormType = "purchase" | "manufacturing" | "dispatch";
type FormPayload = Record<string, unknown>;
type SheetApiResponse = { message?: string; success?: boolean; status?: string; data?: unknown } | null;
type SheetAction =
  | SheetFormType
  | "loginUser"
  | "updatePurchaseEntry"
  | "updateManufacturingEntry"
  | "updateDispatchEntry"
  | "deletePurchaseEntry"
  | "deleteManufacturingEntry"
  | "deleteDispatchEntry";

type LoginPayload = {
  userId: string;
  password: string;
};

function getSheetApiErrorMessage(responseData: SheetApiResponse, fallback: string) {
  if (!responseData) {
    return fallback;
  }

  if (typeof responseData.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData.data === "string" && responseData.data.trim()) {
    return responseData.data;
  }

  return fallback;
}

export type PurchaseEntry = {
  id: string;
  serialNo: string;
  date: string;
  time: string;
  rawMaterialName: string;
  packagingType: string;
  level2: string;
  level3: string;
  packagingBag: string;
  bucketSize: string;
  quantityPurchased: string;
  purchaseStock: string;
  unit: string;
  supplierName: string;
  invoiceNo: string;
  unloadBy: string;
  currentStock: string;
  usedInProduction: string;
  attachFile: string;
  remarks: string;
};

export type ManufacturingEntry = {
  id: string;
  productionDate: string;
  tphBatch: string;
  batchNo: string;
  productCategory: string;
  token: string;
  color: string;
  finishedProductName: string;
  bagSize: string;
  totalBagsProduced: string;
  wastageQty: string;
  wastageReason: string;
  rawMaterialNames: string;
  rawMaterialQty: string;
  rawMaterialUnits: string;
  remarks: string;
};

export type ProductionMaterialLog = {
  id: string;
  productionDate: string;
  tphBatch: string;
  batchNo: string;
  productCategory: string;
  productColor: string;
  productName: string;
  token: string;
  bagSize: string;
  currentQuantity: string;
  shippedQuantity: string;
  remarks: string;
};

export type DispatchEntry = {
  id: string;
  date: string;
  time: string;
  challanNo: string;
  challanName: string;
  vehicleNo: string;
  driverName: string;
  driverContact: string;
  dispatchTime: string;
  dispatchSite: string;
  todayVehicleNo: string;
  token: string;
  productCategory: string;
  bagSize: string;
  productColor: string;
  productName: string;
  quantity: string;
  totalBags: string;
};


export async function submitSheetEntry(formType: SheetFormType, payload: FormPayload) {
  return postSheetAction(formType, payload, "Unable to save entry.");
}

export async function updatePurchaseEntry(payload: PurchaseEntry) {
  return postSheetAction("updatePurchaseEntry", payload, "Unable to update purchase entry.");
}

export async function updateManufacturingEntry(payload: ManufacturingEntry) {
  return postSheetAction("updateManufacturingEntry", payload, "Unable to update manufacturing entry.");
}

export async function updateDispatchEntry(payload: DispatchEntry) {
  return postSheetAction("updateDispatchEntry", payload, "Unable to update dispatch entry.");
}

export async function deletePurchaseEntry(entryId: string) {
  return postSheetAction("deletePurchaseEntry", { id: entryId }, "Unable to delete purchase entry.");
}

export async function deleteManufacturingEntry(entryId: string) {
  return postSheetAction("deleteManufacturingEntry", { id: entryId }, "Unable to delete manufacturing entry.");
}

export async function deleteDispatchEntry(entryId: string) {
  return postSheetAction("deleteDispatchEntry", { id: entryId }, "Unable to delete dispatch entry.");
}

async function postSheetAction(action: SheetAction, payload: FormPayload, fallbackMessage: string) {
  const formattedPayload = formatPayloadTimes(payload);

  console.log("Submitting payload to Google Sheet API:", { action, payload: formattedPayload });

  const response = await fetch(GOOGLE_SHEET_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action,
      ...formattedPayload,
    }),
  });

  const responseText = await response.text();
  const responseData = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    throw new Error(getSheetApiErrorMessage(responseData, responseText || fallbackMessage));
  }

  if (responseData?.success === false || responseData?.status === "error") {
    throw new Error(getSheetApiErrorMessage(responseData, fallbackMessage));
  }

  return responseData;
}

export async function loginUser(payload: LoginPayload) {
  return postSheetAction("loginUser", payload, "Invalid user ID or password.");
}

export async function fetchPurchaseEntries() {
  const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getPurchaseEntries`);
  const responseText = await response.text();
  const responseData = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    throw new Error(responseData?.message || responseText || "Unable to fetch purchase entries.");
  }

  if (!responseData?.success) {
    throw new Error(responseData?.message || "Unable to fetch purchase entries.");
  }

  const entries = Array.isArray(responseData.data) ? responseData.data : [];
  return entries.map(normalizePurchaseEntry);
}

export async function fetchInventory() {
  const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getInventory`);
  const responseText = await response.text();
  const responseData = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    throw new Error(responseData?.message || responseText || "Unable to fetch inventory.");
  }

  if (!responseData?.success) {
    throw new Error(responseData?.message || "Unable to fetch inventory.");
  }

  const entries = Array.isArray(responseData.data) ? responseData.data : [];
  return entries.map(normalizePurchaseEntry);
}

export async function fetchManufacturingEntries() {
  const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getManufacturingEntries`);
  const responseText = await response.text();
  const responseData = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    throw new Error(responseData?.message || responseText || "Unable to fetch manufacturing entries.");
  }

  if (!responseData?.success) {
    throw new Error(responseData?.message || "Unable to fetch manufacturing entries.");
  }

  const entries = Array.isArray(responseData.data) ? responseData.data : [];
  return entries.map(normalizeManufacturingEntry);
}

export async function fetchProductionMaterialLogs() {
  const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getProductionMaterialLogs`);
  const responseText = await response.text();
  const responseData = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    throw new Error(responseData?.message || responseText || "Unable to fetch production material logs.");
  }

  if (!responseData?.success) {
    throw new Error(responseData?.message || "Unable to fetch production material logs.");
  }

  const entries = Array.isArray(responseData.data) ? responseData.data : [];
  return entries.map(normalizeProductionMaterialLog);
}

export async function fetchDispatchEntries() {
  const response = await fetch(`${GOOGLE_SHEET_API_URL}?action=getDispatchEntries`);
  const responseText = await response.text();
  const responseData = responseText ? safeParseJson(responseText) : null;

  if (!response.ok) {
    throw new Error(responseData?.message || responseText || "Unable to fetch dispatch entries.");
  }

  if (!responseData?.success) {
    throw new Error(responseData?.message || "Unable to fetch dispatch entries.");
  }

  const entries = Array.isArray(responseData.data) ? responseData.data : [];
  return entries.map(normalizeDispatchEntry);
}

function formatPayloadTimes(payload: FormPayload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      key.toLowerCase().includes("time") && typeof value === "string" ? formatTimeToAmPm(value) : value,
    ]),
  );
}

function formatTimeToAmPm(value: string) {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) {
    return value;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${period}`;
}

function normalizePurchaseEntry(entry: unknown): PurchaseEntry {
  const record = typeof entry === "object" && entry !== null ? entry as Record<string, unknown> : {};

  return {
    id: stringifyValue(record.id),
    serialNo: stringifyValue(record.serialNo ?? record.serial_no),
    date: normalizeSheetDate(record.date),
    time: normalizeSheetTime(record.time),
    rawMaterialName: stringifyValue(record.rawMaterialName),
    packagingType: stringifyValue(record.packagingType),
    level2: stringifyValue(record.level2),
    level3: stringifyValue(record.level3),
    packagingBag: stringifyValue(record.packagingBag),
    bucketSize: stringifyValue(record.bucketSize),
    quantityPurchased: stringifyValue(record.quantityPurchased ?? record.purchaseStock),
    purchaseStock: stringifyValue(record.purchaseStock ?? record.quantityPurchased),
    unit: stringifyValue(record.unit),
    supplierName: stringifyValue(record.supplierName),
    invoiceNo: stringifyValue(record.invoiceNo),
    unloadBy: stringifyValue(record.unloadBy),
    currentStock: stringifyValue(record.currentStock ?? record.current_quantity ?? record.availableStock),
    usedInProduction: stringifyValue(
      record.usedInProduction ?? record.usedInProductionStock ?? record.used_stock,
    ),
    attachFile: stringifyValue(record.attachFile),
    remarks: stringifyValue(record.remarks),
  };
}

function normalizeManufacturingEntry(entry: unknown): ManufacturingEntry {
  const record = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {};

  return {
    id: stringifyValue(record.id),
    productionDate: normalizeSheetDate(record.productionDate ?? record.date),
    tphBatch: stringifyValue(record.tphBatch),
    batchNo: stringifyValue(record.batchNo),
    productCategory: stringifyValue(record.productCategory),
    token: stringifyValue(record.token),
    color: stringifyValue(record.color ?? record.productColor),
    finishedProductName: stringifyValue(record.finishedProductName ?? record.productName),
    bagSize: stringifyValue(record.bagSize),
    totalBagsProduced: stringifyValue(record.totalBagsProduced),
    wastageQty: stringifyValue(record.wastageQty),
    wastageReason: stringifyValue(record.wastageReason),
    rawMaterialNames: stringifyValue(record.rawMaterialNames),
    rawMaterialQty: stringifyValue(record.rawMaterialQty),
    rawMaterialUnits: stringifyValue(record.rawMaterialUnits),
    remarks: stringifyValue(record.remarks),
  };
}


function normalizeProductionMaterialLog(entry: any): ProductionMaterialLog {
  return {
    id: String(entry.id ?? ""),
    productionDate: normalizeSheetDate(entry.productionDate ?? entry.date),
    tphBatch: String(entry.tphBatch ?? ""),
    batchNo: String(entry.batchNo ?? ""),
    productCategory: String(entry.productCategory ?? ""),
    productColor: String(entry.productColor ?? entry.color ?? ""),
    productName: String(entry.productName ?? ""),
    token: String(entry.token ?? ""),
    bagSize: String(entry.bagSize ?? ""),
    currentQuantity: String(entry.currentQuantity ?? 0),
    shippedQuantity: String(entry.shippedQuantity ?? 0),
    remarks: String(entry.remarks ?? ""),
  };
}

function normalizeDispatchEntry(entry: unknown): DispatchEntry {
  const record = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {};

  return {
    id: stringifyValue(record.id),
    date: normalizeSheetDate(record.date),
    time: normalizeSheetTime(record.time),
    challanNo: stringifyValue(record.challanNo),
    challanName: stringifyValue(record.challanName),
    vehicleNo: stringifyValue(record.vehicleNo),
    driverName: stringifyValue(record.driverName),
    driverContact: stringifyValue(record.driverContact),
    dispatchTime: normalizeSheetTime(record.dispatchTime),
    dispatchSite: stringifyValue(record.dispatchSite),
    todayVehicleNo: stringifyValue(record.todayVehicleNo),
    token: stringifyValue(record.token),
    productCategory: stringifyValue(record.productCategory),
    bagSize: stringifyValue(record.bagSize),
    productColor: stringifyValue(record.productColor),
    productName: stringifyValue(record.productName),
    quantity: stringifyValue(record.quantity),
    totalBags: stringifyValue(record.totalBags),
  };
}
function stringifyValue(value: unknown) {
  return value == null ? "" : String(value);
}

function normalizeSheetDate(value: unknown) {
  const text = stringifyValue(value);

  if (!text) {
    return "";
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleDateString("en-CA", {
    timeZone: "UTC",
  });
}

function normalizeSheetTime(value: unknown) {
  const text = stringifyValue(value);

  if (!text) {
    return "";
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

function safeParseJson(text: string): SheetApiResponse {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
