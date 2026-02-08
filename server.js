// ================================
// API REST Tareas + Auth + JSON FS
// server.js
// ================================

const express = require('express');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// ===== Config =====
const ARCHIVO_TAREAS = 'tareas.json';
const ARCHIVO_USUARIOS = 'usuarios.json';
const SECRET_KEY = 'clave_secreta';

app.use(express.json());

// ================================
// FUNCIONES FS (asincrónicas)
// ================================

async function leerArchivo(ruta) {
  try {
    const data = await fs.readFile(ruta, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function escribirArchivo(ruta, contenido) {
  await fs.writeFile(ruta, JSON.stringify(contenido, null, 2));
}

async function obtenerTareas() {
  return await leerArchivo(ARCHIVO_TAREAS);
}

async function guardarTareas(tareas) {
  await escribirArchivo(ARCHIVO_TAREAS, tareas);
}

async function obtenerUsuarios() {
  return await leerArchivo(ARCHIVO_USUARIOS);
}

async function guardarUsuarios(usuarios) {
  await escribirArchivo(ARCHIVO_USUARIOS, usuarios);
}

// ================================
// MIDDLEWARE AUTENTICACIÓN
// ================================

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ mensaje: 'Acceso denegado' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ mensaje: 'Token inválido' });

    req.user = user;
    next();
  });
}

// ================================
// RUTAS AUTH
// ================================

// Registro
app.post('/register', async (req, res) => {
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
app.post('/login', async (req, res) => {
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

// ================================
// RUTAS TAREAS (PROTEGIDAS)
// ================================

// GET todas
app.get('/tareas', autenticarToken, async (req, res) => {
  const tareas = await obtenerTareas();
  res.json(tareas);
});

// POST nueva
app.post('/tareas', autenticarToken, async (req, res) => {
  const { titulo, descripcion } = req.body;

  const tareas = await obtenerTareas();

  const nueva = {
    id: Date.now(),
    titulo,
    descripcion
  };

  tareas.push(nueva);

  await guardarTareas(tareas);

  res.status(201).json(nueva);
});

// PUT actualizar
app.put('/tareas/:id', autenticarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const tareas = await obtenerTareas();

  const index = tareas.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ mensaje: 'No encontrada' });

  tareas[index] = { ...tareas[index], ...req.body };

  await guardarTareas(tareas);

  res.json(tareas[index]);
});

// DELETE
app.delete('/tareas/:id', autenticarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const tareas = await obtenerTareas();

  const nuevas = tareas.filter(t => t.id !== id);

  await guardarTareas(nuevas);

  res.json({ mensaje: 'Tarea eliminada' });
});

// ================================
// MANEJO DE ERRORES GLOBAL
// ================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ================================
// SERVER
// ================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
