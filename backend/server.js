const app = require('./app');
const { dbConfig } = require('./config/CRJ');
const oracledb = require('oracledb');

const PORT = process.env.PORT || 3000;

// Verificar conexión a la base de datos al iniciar
async function startServer() {
  try {
    // Crear pool de conexiones
    await oracledb.createPool(dbConfig);
    console.log('Conexión a Oracle establecida correctamente');
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();

// Manejo de cierre elegante
process.on('SIGTERM', async () => {
  console.log('Cerrando pool de conexiones Oracle...');
  try {
    await oracledb.getPool().close();
    console.log('Pool de conexiones cerrado');
    process.exit(0);
  } catch (err) {
    console.error('Error cerrando pool de conexiones:', err);
    process.exit(1);
  }
});