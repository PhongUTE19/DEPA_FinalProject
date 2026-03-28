import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// SINGLETON PATTERN
// Ensures only one database connection pool exists for the entire application.
// The static instance is preserved across all imports thanks to ES module caching,
// but the explicit class makes the intent clear and matches the design pattern spec.
class DatabaseSingleton {
  static #instance = null;

  static getInstance() {
    if (!DatabaseSingleton.#instance) {
      DatabaseSingleton.#instance = knex({
        client: 'pg',
        connection: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_DATABASE,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        },
        pool: { min: 0, max: 15 }
      });
    }
    return DatabaseSingleton.#instance;
  }
}

// Export the single instance — all imports share the same connection pool
const db = DatabaseSingleton.getInstance();
export default db;