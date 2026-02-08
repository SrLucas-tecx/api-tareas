// ================================
// server.js
// ================================
const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const tareasRoutes = require('./src/routes/tareasRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/', authRoutes);
app.use('/tareas', tareasRoutes);


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

app.get('/', (req, res) => {
  res.send('Actividad 3 :D - Equipo 1');
});
