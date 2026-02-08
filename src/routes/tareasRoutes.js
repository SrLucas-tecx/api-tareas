
// ================================
// RUTAS TAREAS (PROTEGIDAS)
// ================================
const express = require('express');
const router = express.Router();
const { leerArchivo, escribirArchivo } = require('../fileFunctions/functions');
const { autenticarToken } = require('../middleware/auth');

const FILE = 'tareas.json';

async function obtenerTareas() {
  
  return await leerArchivo(FILE);
}

async function guardarTareas(tareas) {
  await escribirArchivo(FILE, tareas);
}

// GET todas
router.get('/', autenticarToken, async (req, res) => {
  const tareas = await obtenerTareas();
  res.json(tareas);
});

// POST nueva
router.post('/', autenticarToken, async (req, res) => {
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
router.put('/:id', autenticarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const tareas = await obtenerTareas();

  const index = tareas.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ mensaje: 'No encontrada' });

  tareas[index] = { ...tareas[index], ...req.body };

  await guardarTareas(tareas);

  res.json(tareas[index]);
});

// DELETE
router.delete('/:id', autenticarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const tareas = await obtenerTareas();

  const nuevas = tareas.filter(t => t.id !== id);

  await guardarTareas(nuevas);

  res.json({ mensaje: 'Tarea eliminada' });
});


module.exports = router;