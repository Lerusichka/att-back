const sql = require('mssql');
require('dotenv').config();

const config = {
    server: "DESKTOP-4FNLCF2",
    options: {
        instanceName: 'SQLEXPRESS',
        trustServerCertificate: true,
        database: "diplom", 
    }
};

async function connect() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

module.exports = { connect, sql };