// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/CRJ');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT usuario_id, nombre_usuario, rol_id FROM usuario
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Registrar un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre_usuario, clave, rol_id } = req.body;
  try {
    await executeQuery(`
  INSERT INTO usuario (usuario_id, nombre_usuario, clave, rol_id)
  VALUES (SEQ_USUARIO_ID.NEXTVAL, :nombre_usuario, :clave, :rol_id)
`, { nombre_usuario, clave, rol_id });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
  console.error('Error al registrar usuario:', err);
  if (err.code === 'ORA-00001') {
    res.status(400).json({ message: 'Ya existe un usuario con ese ID.' });
  } else {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
}

});

// Actualizar un usuario existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, clave, rol_id } = req.body;
  try {
    await executeQuery(`
      UPDATE usuario
      SET nombre_usuario = :nombre_usuario, clave = :clave, rol_id = :rol_id
      WHERE usuario_id = :id
    `, { nombre_usuario, clave, rol_id, id });

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery('DELETE FROM usuario WHERE usuario_id = :id', { id });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
