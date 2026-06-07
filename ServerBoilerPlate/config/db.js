/*
 * Alright, let's talk about the database. Don't be intimidated.
 * A database is just a place to keep stuff that should survive
 * after your server stops.
 *
 * If you store data in a JavaScript variable, it disappears the
 * moment you hit Ctrl+C. Poof. Gone. A database writes it to
 * a file on your hard drive, so it's still there tomorrow.
 *
 * We're using SQLite -- the friendliest database there is.
 * No installation. No server to configure. No passwords.
 * It's literally just a file. One single file that gets
 * created in this folder when the server starts for the first
 * time. You can even open it with a tool like DB Browser
 * for SQLite if you want to see your data with a nice GUI.
 *
 * better-sqlite3 is the npm package that lets Node.js talk
 * to that file. The best part about it: it's synchronous.
 * You call a method, you get the result. No async. No await.
 * No promises. Just code that runs top to bottom, like you
 * learned on day one.
 */

const Database = require('better-sqlite3');
const path = require('path');

/*
 * Where does the database file live? Right here, in the project
 * root, next to server.js. We'll call it serverboilerplate.sqlite.
 *
 * __dirname is a Node.js built-in that tells us "what folder
 * is THIS file in?" It's always the folder of the file that
 * contains it -- not where you ran node from.
 *
 * path.join() safely builds file paths that work on Windows,
 * Mac, and Linux. No guessing about slashes or backslashes.
 */
const dbPath = path.join(__dirname, '..', 'database', 'serverboilerplate.sqlite');
const db = new Database(dbPath);

/*
 * PRAGMA -- Fancy database settings.
 *
 * WAL mode (Write-Ahead Logging): Normally, when you write to
 * a database, everything else has to wait. WAL mode lets reads
 * and writes happen at the same time. It's faster. It's better.
 * Just always turn it on. You won't regret it.
 *
 * Foreign keys ON: This one is sneaky important. SQLite has
 * foreign key enforcement OFF by default (I know, I know).
 * Turning it ON means: if Table A references Table B, you
 * can't delete something from B that A still needs. It keeps
 * your data from getting messy. Always turn it on.
 */
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/*
 * SCHEMA -- This is where you define your tables.
 *
 * Think of a table like a spreadsheet. Columns are the headers.
 * Rows are the actual data. Simple as that.
 *
 * CREATE TABLE IF NOT EXISTS is your safety net. It means
 * "make this table, but ONLY if it doesn't already exist."
 * That way, you can restart the server a thousand times and
 * your data is safe. No accidental wiping.
 *
 * Add your own CREATE TABLE statements inside db.exec().
 * This project doesn't ship with a built-in table — it's
 * meant for you to practice adding your own schema.
 */
/*
 * EXPORT -- Share this connection with the whole project.
 *
 * Every other file that needs the database will use:
 *   const db = require('../config/db');
 *
 * And every single one gets the SAME connection object.
 * Node.js caches require() calls, so even if ten files
 * all require this file, they all share one connection.
 *
 * If every file made its own connection, you'd have ten
 * copies of SQLite all fighting over the same file, and
 * you'd get "database is locked" errors. Nobody wants that.
 * One connection. Shared everywhere. Trust me on this one.
 */
module.exports = db;
