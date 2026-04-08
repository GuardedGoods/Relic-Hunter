import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001;
const SALT_ROUNDS = 10;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'relic-hunter.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    depth INTEGER NOT NULL,
    kills INTEGER DEFAULT 0,
    gold INTEGER DEFAULT 0,
    zone TEXT DEFAULT 'ashveil',
    duration_seconds INTEGER DEFAULT 0,
    died INTEGER DEFAULT 0,
    killed_by TEXT DEFAULT '',
    highest_damage INTEGER DEFAULT 0,
    class TEXT DEFAULT 'slayer',
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migrate existing databases: add new columns if they don't exist
try {
  db.exec(`ALTER TABLE scores ADD COLUMN killed_by TEXT DEFAULT ''`);
} catch (_) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE scores ADD COLUMN highest_damage INTEGER DEFAULT 0`);
} catch (_) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE scores ADD COLUMN class TEXT DEFAULT 'slayer'`);
} catch (_) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE scores ADD COLUMN level INTEGER DEFAULT 1`);
} catch (_) { /* column already exists */ }

// ---------------------------------------------------------------------------
// Prepared statements
// ---------------------------------------------------------------------------

const stmts = {
  findUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  insertUser: db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)'),
  insertSession: db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)'),
  findSession: db.prepare('SELECT s.user_id, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?'),
  insertScore: db.prepare(`
    INSERT INTO scores (user_id, username, depth, kills, gold, zone, duration_seconds, died, killed_by, highest_damage, class, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  leaderboard: db.prepare(`
    SELECT username, depth, kills, gold, zone, killed_by, highest_damage, class, level, created_at
    FROM scores
    ORDER BY depth DESC, kills DESC, gold DESC
    LIMIT 50
  `),
  personalRuns: db.prepare(`
    SELECT depth, kills, gold, zone, duration_seconds, died, killed_by, highest_damage, class, created_at
    FROM scores
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `),
  personalBestDepth: db.prepare('SELECT MAX(depth) AS best FROM scores WHERE user_id = ?'),
  personalTotalRuns: db.prepare('SELECT COUNT(*) AS total FROM scores WHERE user_id = ?'),
  personalTotalKills: db.prepare('SELECT COALESCE(SUM(kills), 0) AS total FROM scores WHERE user_id = ?'),
  totalRuns: db.prepare('SELECT COUNT(*) AS total FROM scores'),
  totalPlayers: db.prepare('SELECT COUNT(*) AS total FROM users'),
  deepestRun: db.prepare('SELECT MAX(depth) AS deepest FROM scores'),
};

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USERNAME_RE = /^[a-zA-Z0-9_]{2,20}$/;

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function formatDate(isoString) {
  if (!isoString) return null;
  return isoString.slice(0, 10);
}

/** Middleware: extract and validate auth token, attach user info to req. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = header.slice(7);
  const session = stmts.findSession.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.userId = session.user_id;
  req.username = session.username;
  next();
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// --- Register ---------------------------------------------------------------
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Username must be 2-20 characters (letters, numbers, underscores).' });
    }
    if (!password || typeof password !== 'string' || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const existing = stmts.findUserByUsername.get(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = stmts.insertUser.run(username, hash);

    const token = generateToken();
    stmts.insertSession.run(token, result.lastInsertRowid);

    res.status(201).json({ token, username });
  } catch (err) {
    console.error('POST /api/register error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Login ------------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = stmts.findUserByUsername.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken();
    stmts.insertSession.run(token, user.id);

    res.json({ token, username: user.username });
  } catch (err) {
    console.error('POST /api/login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Submit score -----------------------------------------------------------
app.post('/api/scores', requireAuth, (req, res) => {
  try {
    const { depth, kills, gold, zone, durationSeconds, died, killedBy, highestDamage } = req.body || {};

    if (depth == null || typeof depth !== 'number' || !Number.isInteger(depth) || depth < 0) {
      return res.status(400).json({ error: 'depth must be a non-negative integer.' });
    }

    const safeKills = (typeof kills === 'number' && Number.isInteger(kills) && kills >= 0) ? kills : 0;
    const safeGold = (typeof gold === 'number' && Number.isInteger(gold) && gold >= 0) ? gold : 0;
    const safeZone = (typeof zone === 'string' && zone.length > 0 && zone.length <= 50) ? zone : 'ashveil';
    const safeDuration = (typeof durationSeconds === 'number' && Number.isInteger(durationSeconds) && durationSeconds >= 0) ? durationSeconds : 0;
    const safeDied = died ? 1 : 0;
    const safeKilledBy = (typeof killedBy === 'string' && killedBy.length <= 100) ? killedBy : '';
    const safeHighestDamage = (typeof highestDamage === 'number' && Number.isInteger(highestDamage) && highestDamage >= 0) ? highestDamage : 0;
    const safeClass = (typeof req.body.class === 'string' && req.body.class.length <= 30) ? req.body.class : 'slayer';
    const safeLevel = (typeof req.body.level === 'number' && Number.isInteger(req.body.level) && req.body.level >= 1) ? req.body.level : 1;

    stmts.insertScore.run(
      req.userId,
      req.username,
      depth,
      safeKills,
      safeGold,
      safeZone,
      safeDuration,
      safeDied,
      safeKilledBy,
      safeHighestDamage,
      safeClass,
      safeLevel,
    );

    res.status(201).json({ message: 'Score recorded.' });
  } catch (err) {
    console.error('POST /api/scores error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Public leaderboard -----------------------------------------------------
app.get('/api/leaderboard', (_req, res) => {
  try {
    const rows = stmts.leaderboard.all();
    const leaderboard = rows.map((row, idx) => ({
      rank: idx + 1,
      username: row.username,
      depth: row.depth,
      kills: row.kills,
      gold: row.gold,
      zone: row.zone,
      killed_by: row.killed_by || '',
      highest_damage: row.highest_damage || 0,
      class: row.class || 'slayer',
      level: row.level || 1,
      date: formatDate(row.created_at),
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Personal leaderboard ---------------------------------------------------
app.get('/api/leaderboard/personal', requireAuth, (req, res) => {
  try {
    const rows = stmts.personalRuns.all(req.userId);
    const runs = rows.map((row) => ({
      depth: row.depth,
      kills: row.kills,
      gold: row.gold,
      zone: row.zone,
      durationSeconds: row.duration_seconds,
      died: row.died === 1,
      killed_by: row.killed_by || '',
      highest_damage: row.highest_damage || 0,
      date: formatDate(row.created_at),
    }));

    const bestRow = stmts.personalBestDepth.get(req.userId);
    const totalRunsRow = stmts.personalTotalRuns.get(req.userId);
    const totalKillsRow = stmts.personalTotalKills.get(req.userId);

    res.json({
      runs,
      bestDepth: bestRow.best || 0,
      totalRuns: totalRunsRow.total,
      totalKills: totalKillsRow.total,
    });
  } catch (err) {
    console.error('GET /api/leaderboard/personal error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Global stats -----------------------------------------------------------
app.get('/api/stats', (_req, res) => {
  try {
    const totalRunsRow = stmts.totalRuns.get();
    const totalPlayersRow = stmts.totalPlayers.get();
    const deepestRow = stmts.deepestRun.get();

    res.json({
      totalRuns: totalRunsRow.total,
      totalPlayers: totalPlayersRow.total,
      deepestRun: deepestRow.deepest || 0,
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Relic Hunter API listening on port ${PORT}`);
});
