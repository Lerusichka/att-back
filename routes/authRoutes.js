const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect, sql } = require('../db'); // Подключаем БД

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connect(); // Получаем подключение

        // Проверяем, есть ли уже такой пользователь
        const userCheck = await pool.request()
            .input('Username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Добавляем пользователя в базу
        await pool.request()
            .input('Username', sql.NVarChar, username)
            .input('Password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Users (Username, Password) VALUES (@Username, @Password)');

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Логин пользователя
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connect();

        // Ищем пользователя
        const result = await pool.request()
            .input('Username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = result.recordset[0];

        // Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Генерируем JWT-токен
        const token = jwt.sign(
            { userId: user.ID, username: user.Username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;