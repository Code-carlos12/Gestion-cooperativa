const oracledb = require('oracledb');
require('dotenv').config();

// Configuracion del pool de conexiones
const dbConfig = {
  user: process.env.DB_USER || 'cooperativa',
  password: process.env.DB_PASSWORD || 'cooperativa123',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/ORCLPDB',
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  queueTimeout: 60000,
  stmtCacheSize: 30
};

// Inicializar el cliente Oracle (solo necesario si estás en Windows y usas Oracle Instant Client)
try {
  if (process.env.ORACLE_CLIENT_PATH) {
    oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
    console.log('Oracle client initialized');
  }
} catch (err) {
  console.error('Error initializing Oracle client:', err);
}

// Obtener una conexion del pool
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Error al obtener conexión:', err);
    throw err;
  }
}

// Ejecutar una consulta individual (SELECT, INSERT, UPDATE, DELETE)
async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    options.outFormat = oracledb.OUT_FORMAT_OBJECT;
    if (options.autoCommit === undefined) {
      options.autoCommit = true; // Auto-commit por defecto
    }
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Error en executeQuery:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
}

// Ejecutar una serie de transacciones (si necesitas múltiples pasos antes de hacer commit)
async function executeTransaction(queries) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute('BEGIN');

    const results = [];
    for (const query of queries) {
      const result = await connection.execute(query.sql, query.binds, query.options || {});
      results.push(result);
    }

    await connection.execute('COMMIT');
    return results;
  } catch (err) {
    if (connection) {
      try {
        await connection.execute('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error en rollback:', rollbackErr);
      }
    }
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
}

module.exports = {
  dbConfig,
  getConnection,
  executeQuery,
  executeTransaction,
  oracledb
};
