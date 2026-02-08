
// ================================
// RUTAS AUTH
// ================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { leerArchivo, escribirArchivo } = require('../fileFunctions/functions');
const { SECRET_KEY } = require('../middleware/auth');

const FILE = 'usuarios.json';

async function obtenerUsuarios() {
  return await leerArchivo(FILE);
}

async function guardarUsuarios(usuarios) {
  await escribirArchivo(FILE, usuarios);
}

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuarios = await obtenerUsuarios();

    const existe = usuarios.find(u => u.username === username);
    if (existe) return res.status(400).json({ mensaje: 'Usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);

    usuarios.push({ username, password: hash });

    await guardarUsuarios(usuarios);

    res.status(201).json({ mensaje: 'Usuario registrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuarios = await obtenerUsuarios();

    const user = usuarios.find(u => u.username === username);
    if (!user) return res.status(400).json({ mensaje: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;