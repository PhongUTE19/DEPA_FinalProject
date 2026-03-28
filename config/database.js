import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Guard: catch missing env vars early with a clear error message
// instead of letting Postgres fail with the cryptic SASL error.
const required = ['DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n` +
    `Create a .env file in the project root. See .env.example for reference.`
  );
}

// SINGLETON PATTERN
class DatabaseSingleton {
  static #instance = null;

  static getInstance() {
    if (!DatabaseSingleton.#instance) {
      DatabaseSingleton.#instance = knex({
        client: 'pg',
        connection: {
          host:     process.env.DB_HOST,
          port:     Number(process.env.DB_PORT),
          database: process.env.DB_DATABASE,
          user:     process.env.DB_USER,
          password: String(process.env.DB_PASSWORD), // must be a string, never undefined
        },
        pool: { min: 0, max: 15 }
      });
    }
    return DatabaseSingleton.#instance;
  }
}

const db = DatabaseSingleton.getInstance();
export default db;