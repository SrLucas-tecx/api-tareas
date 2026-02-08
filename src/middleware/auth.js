// ================================
// MIDDLEWARE AUTENTICACIÓN
// ================================
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'clave_secreta';

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

module.exports = { autenticarToken, SECRET_KEY };