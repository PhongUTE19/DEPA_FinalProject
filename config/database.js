import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton Pattern — Database Connection
 *
 * Đảm bảo chỉ có DUY NHẤT một instance Knex được tạo trong suốt vòng đời app.
 * Tất cả module import `db` đều dùng chung connection pool này.
 */
class Database {
    static #instance = null;

    static getInstance() {
        if (!Database.#instance) {
            Database.#instance = knex({
                client: 'pg',
                connection: {
                    host:     process.env.DB_HOST,
                    port:     process.env.DB_PORT,
                    database: process.env.DB_DATABASE,
                    user:     process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                },
                pool: { min: 0, max: 15 },
            });
            console.log('[Database] Singleton instance created.');
        }
        return Database.#instance;
    }
}

const db = Database.getInstance();
export default db;
