# api-tareas
Actividad 3
npm install express body-parser jsonwebtoken bcryptjs.
const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
app.get('/', (req, res) => {
  res.send('API de Tareas funcionando en el puerto 3000');
});
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});
