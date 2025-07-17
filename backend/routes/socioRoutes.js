const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/CRJ');
const oracledb = require('oracledb');


// Helper para manejo de conexiones directas
async function withConnection(callback) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    return await callback(connection);
  } finally {
    if (connection) await connection.close();
  }
}

// LISTAR SOCIOS
router.get('/public', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT socio_id, nombre, dni, telefono, email
      FROM socio
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener socios:', err);
    res.status(500).json({ message: 'Error al obtener socios' });
  }
});

// CREAR SOCIO
router.post('/', async (req, res) => {
  try {
    const { nombre, dni, telefono, email } = req.body;
    await executeQuery(`
      INSERT INTO socio (
        socio_id, nombre, dni, fecha_ingreso, tipo_socio_id, estado_id, direccion, telefono, email
      ) VALUES (
        SEQ_SOCIO_ID.NEXTVAL, :nombre, :dni, SYSDATE, 1, 1, 'SIN DIRECCION', :telefono, :email
      )
    `, { nombre, dni, telefono, email });

    res.status(201).json({ message: 'Socio insertado correctamente' });
  } catch (err) {
    console.error('Error al insertar socio:', err);
    res.status(500).json({ message: 'Error al insertar socio' });
  }
});

// ACTUALIZAR SOCIO
router.put('/:id', async (req, res) => {
  try {
    const socio_id = req.params.id;
    const { nombre, dni, telefono, email } = req.body;

    await executeQuery(`
      UPDATE socio
      SET nombre = :nombre,
          dni = :dni,
          telefono = :telefono,
          email = :email
      WHERE socio_id = :socio_id
    `, { nombre, dni, telefono, email, socio_id });

    res.json({ message: 'Socio actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar socio:', err);
    res.status(500).json({ message: 'Error al actualizar socio' });
  }
});

// ELIMINAR SOCIO
router.delete('/:id', async (req, res) => {
  try {
    const socio_id = req.params.id;
    await executeQuery(`DELETE FROM socio WHERE socio_id = :socio_id`, { socio_id });
    res.json({ message: 'Socio eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar socio:', err);
    res.status(500).json({ message: 'Error al eliminar socio' });
  }
});

// Asignar método de pago al socio
router.post('/asignar-metodo', async (req, res) => {
  const { socio_id, metodo_id, descripcion, monto, tipo_id, categoria_id } = req.body;

  try {
    await withConnection(async (connection) => {
      await connection.execute(`
        INSERT INTO transaccion (transaccion_id, fecha, descripcion, tipo_id, monto, socio_id, categoria_id, metodo_id)
        VALUES (transaccion_seq.NEXTVAL, SYSDATE, :descripcion, :tipo_id, :monto, :socio_id, :categoria_id, :metodo_id)
      `, { descripcion, tipo_id, monto, socio_id, categoria_id, metodo_id });

      await connection.commit();
      res.json({ message: 'Método de pago asignado correctamente' });
    });
  } catch (err) {
    console.error('Error al asignar método de pago:', err);
    res.status(500).json({ message: 'Error al asignar método de pago' });
  }
});

// Registrar aportacion inicial
router.post('/aportacion-inicial', async (req, res) => {
  const { socio_id, monto, tipo_aportacion_id } = req.body;

  try {
    await withConnection(async (connection) => {
      await connection.execute(`
        INSERT INTO aportacion (aportacion_id, socio_id, fecha, monto, tipo_aportacion_id)
        VALUES (aportacion_seq.NEXTVAL, :socio_id, SYSDATE, :monto, :tipo_aportacion_id)
      `, { socio_id, monto, tipo_aportacion_id });

      await connection.commit();
      res.json({ message: 'Aportación inicial registrada' });
    });
  } catch (err) {
    console.error('Error al registrar aportación:', err);
    res.status(500).json({ message: 'Error al registrar aportación' });
  }
});


module.exports = router;
