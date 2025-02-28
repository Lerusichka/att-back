const express = require('express');
const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Конфигурация подключения к SQL Server
const dbConfig = {
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        trustServerCertificate: true // Отключить проверку сертификатов для локальных соединений
    }
};

// Подключаемся к базе данных
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log("Connected to SQL Server");
    } catch (err) {
        console.error("Error connecting to SQL Server:", err);
    }
}

// Middleware для парсинга JSON
app.use(express.json());

// Маршрут для регистрации и аутентификации пользователей
app.use('/api/auth', require('./routes/authRoutes'));

app.listen(PORT, () => {
    connectDB(); // Подключаемся к базе данных при старте сервера
    console.log(`Server running on port ${PORT}`);
});

