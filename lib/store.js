/**
 * TorqueTitles persistent store — port of the Phase-1 JSON store
 * (build/torquetitles/store.py).
 *
 * State lives in one JSON file under the data dir:
 *   torquetitles.json — {"intakes": {id: record}}
 * Writes are serialized through a promise chain (the lock) and are atomic
 * (write-then-rename), mirroring the Python lock-guarded store. Intakes
 * are the fulfillment pipeline's front door: every record carries contact,
 * vehicle, the six screen answers, the server-computed verdict, and the
 * Montana disclosure attestation.
 *
 * Data dir: $TORQUETITLES_DATA_DIR, default ./data under the app root.
 * (On a serverless host this filesystem is ephemeral — deploy on a host
 * with a persistent disk, or swap this module for a database with the
 * same four methods. See BUILD-REPORT.md.)
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR =
  process.env.TORQUETITLES_DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "torquetitles.json");

let chain = Promise.resolve();
function withLock(fn) {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readDb() {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const db = JSON.parse(raw);
    if (!db || typeof db !== "object" || !db.intakes) return { intakes: {} };
    return db;
  } catch {
    return { intakes: {} };
  }
}

async function writeDb(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(tmp, DB_FILE);
}

export const store = {
  async createIntake(rec) {
    return withLock(async () => {
      const db = await readDb();
      db.intakes[rec.id] = rec;
      await writeDb(db);
      return rec;
    });
  },

  async getIntake(intakeId) {
    return withLock(async () => {
      const db = await readDb();
      return db.intakes[intakeId] ?? null;
    });
  },

  async listIntakes({ status = null, verdict = null, limit = 100 } = {}) {
    return withLock(async () => {
      const db = await readDb();
      let rows = Object.values(db.intakes);
      rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      if (status) rows = rows.filter((r) => r.status === status);
      if (verdict) rows = rows.filter((r) => r.verdict === verdict);
      return rows.slice(0, limit);
    });
  },

  async count() {
    return withLock(async () => {
      const db = await readDb();
      return Object.keys(db.intakes).length;
    });
  },
};
