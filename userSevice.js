const { connect, sql } = require('./db');
const bcrypt = require('bcryptjs');

async function registerUser(username, password) {
    const pool = await connect();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input('Username', sql.NVarChar, username)
            .input('Password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO Users (Username, Password) VALUES (@Username, @Password)');

        console.log('User registered successfully');
    } catch (err) {
        console.error('Error registering user:', err);
    }
}

async function loginUser(username, password) {
    const pool = await connect();

    try {
        const result = await pool.request()
            .input('Username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');

        if (result.recordset.length === 0) {
            return console.log('User not found');
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(password, user.Password);
        if (isMatch) {
            console.log('Login successful');
            return user; 
        } else {
            console.log('Invalid credentials');
            return null;
        }
    } catch (err) {
        console.error('Error logging in user:', err);
    }
}

module.exports = { registerUser, loginUser };