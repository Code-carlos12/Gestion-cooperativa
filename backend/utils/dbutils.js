const { executeQuery } = require('../config/CRJ');

class DbUtils {
  static async checkUserExists(username) {
    const result = await executeQuery(
      'SELECT COUNT(*) AS count FROM usuario WHERE nombre_usuario = :username',
      [username]
    );
    return result.rows[0].COUNT > 0;
  }

  static async getUsuarioByUsername(username) {
    const result = await executeQuery(
      `SELECT u.usuario_id, u.nombre_usuario, u.clave, r.nombre as rol 
       FROM usuario u 
       JOIN rol r ON u.rol_id = r.rol_id 
       WHERE u.nombre_usuario = :username`,
      [username]
    );
    return result.rows[0];
  }

  static async logAccess(usuarioId, accion) {
    await executeQuery(
      `INSERT INTO log_acceso (log_id, usuario_id, fecha_hora, accion) 
       VALUES (log_acceso_seq.NEXTVAL, :usuarioId, SYSTIMESTAMP, :accion)`,
      [usuarioId, accion]
    );
  }

  static async getSequenceNextVal(sequenceName) {
    const result = await executeQuery(
      `SELECT ${sequenceName}.NEXTVAL as nextval FROM DUAL`
    );
    return result.rows[0].NEXTVAL;
  }
}

module.exports = DbUtils;