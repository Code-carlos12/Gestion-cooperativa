const { verifyToken } = require('../config/auth');
const { executeQuery } = require('../config/CRJ');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    // Verificar si el usuario existe en la base de datos
    const result = await executeQuery(
      'SELECT usuario_id, nombre_usuario, rol_id FROM usuario WHERE usuario_id = :id',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = {
      id: result.rows[0].USUARIO_ID,
      username: result.rows[0].NOMBRE_USUARIO,
      rol: result.rows[0].ROL_ID
    };

    next();
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    res.status(500).json({ message: 'Error de autenticación' });
  }
}

function authorize(roles = []) {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorize
};