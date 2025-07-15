const jwt = require('jsonwebtoken');
require('dotenv').config();

const authConfig = {
  secret: process.env.JWT_SECRET || 'cooperativa_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: process.env.JWT_ALGORITHM || 'HS256',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'cooperativa_refresh_secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};

// Generar tokens
function generateTokens(user) {
  const payload = {
    userId: user.usuario_id,
    username: user.nombre_usuario,
    rol: user.rol_id
  };

  const token = jwt.sign(payload, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
    algorithm: authConfig.algorithm
  });

  const refreshToken = jwt.sign(payload, authConfig.refreshSecret, {
    expiresIn: authConfig.refreshExpiresIn
  });

  return { token, refreshToken };
}

// Verificar token
function verifyToken(token) {
  try {
    return jwt.verify(token, authConfig.secret);
  } catch (err) {
    console.error('Error verifying token:', err);
    return null;
  }
}

// Verificar refresh token
function verifyRefreshToken(refreshToken) {
  try {
    return jwt.verify(refreshToken, authConfig.refreshSecret);
  } catch (err) {
    console.error('Error verifying refresh token:', err);
    return null;
  }
}

module.exports = {
  authConfig,
  generateTokens,
  verifyToken,
  verifyRefreshToken
};