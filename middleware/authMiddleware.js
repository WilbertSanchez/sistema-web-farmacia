const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded; // Asegúrate de que contiene tanto el ID como el rol
    next();
  });
};

const checkRole = (roles) => (req, res, next) => {
  const userRole = req.user && req.user.rol;
  console.log(`Roles permitidos: ${roles}`);
  console.log(`Rol del usuario: ${userRole}`);

  if (!roles.includes(userRole)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

module.exports = {
  verificarToken,
  checkRole
};
