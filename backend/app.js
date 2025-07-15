const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { authConfig } = require('./config/auth');

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Limitar peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde'
});
app.use(limiter);

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión Cooperativa',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const socioRoutes = require('./routes/socioRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/socios', socioRoutes);
app.use('/api/admin', adminRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;