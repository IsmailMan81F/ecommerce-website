interface VisitorRecord {
  visitorId: string;
  date: string;
}

const VISITOR_ID_KEY = "kord_store_visitor_id_v1";
const VISITOR_RECORDS_KEY = "kord_store_visitor_records_v1";

const dayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthKey = (date: Date) => dayKey(date).slice(0, 7);

function readVisitorRecords(): VisitorRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(VISITOR_RECORDS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (record): record is VisitorRecord =>
        typeof record?.visitorId === "string" && typeof record?.date === "string"
    );
  } catch {
    return [];
  }
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function recordStoreVisit(now = new Date()): void {
  if (typeof window === "undefined") return;

  try {
    const visitorId = getVisitorId();
    const today = dayKey(now);
    const retentionStart = dayKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const records = readVisitorRecords().filter((record) => record.date >= retentionStart);

    if (!records.some((record) => record.visitorId === visitorId && record.date === today)) {
      records.push({ visitorId, date: today });
    }

    localStorage.setItem(VISITOR_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Visitor metrics are optional when browser storage is unavailable.
  }
}

export function getStoreVisitorStats(now = new Date()) {
  const records = readVisitorRecords();
  const today = dayKey(now);
  const previousMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  return {
    today: new Set(records.filter((record) => record.date === today).map((record) => record.visitorId)).size,
    lastMonth: new Set(
      records.filter((record) => record.date.startsWith(previousMonth)).map((record) => record.visitorId)
    ).size,
  };
}