import { Pool } from 'pg'

declare global {
    // eslint-disable-next-line no-var
    var pool: Pool | undefined
}

let pool: Pool

if (!global.pool) {
    global.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Allow self-signed certs for internal Docker networks
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
    })
}
pool = global.pool

export default pool
