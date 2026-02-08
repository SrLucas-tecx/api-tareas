
// ================================
// FUNCIONES FS (asincrónicas)
// ================================

const fs = require('fs').promises;
const path = require('path');

// Esto asegura que los JSON se guarden siempre en src/data/
const DATA_PATH = path.join(__dirname, '..','api-tareas');

async function leerArchivo(nombreArchivo) {
      const ruta = path.join(DATA_PATH, nombreArchivo);

  try {
    const data = await fs.readFile(ruta, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function escribirArchivo(nombreArchivo, contenido) {
    const ruta = path.join(DATA_PATH, nombreArchivo);
  await fs.writeFile(ruta, JSON.stringify(contenido, null, 2));
}


module.exports = {
  leerArchivo,
  escribirArchivo
};