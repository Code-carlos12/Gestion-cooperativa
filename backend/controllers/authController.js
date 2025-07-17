const { executeQuery } = require('../config/CRJ');
const { generateTokens } = require('../config/auth');

exports.login = async (req, res) => {
  const { nombre_usuario, clave } = req.body;

  try {
    const result = await executeQuery(
      `SELECT usuario_id, nombre_usuario, clave, rol_id 
       FROM usuario 
       WHERE nombre_usuario = :nombre_usuario`,
      [nombre_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (clave !== user.CLAVE) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const tokens = generateTokens({
      usuario_id: user.USUARIO_ID,
      nombre_usuario: user.NOMBRE_USUARIO,
      rol_id: user.ROL_ID
    });

    res.json({
      usuario: {
        id: user.USUARIO_ID,
        username: user.NOMBRE_USUARIO,
        rol: user.ROL_ID
      },
      token: tokens.token,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
