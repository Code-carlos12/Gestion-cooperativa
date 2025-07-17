const express = require('express');
const router = express.Router();

//Ruta temporal para pruebas
router.get('/prueba', (req, res) => {
  res.json({ message: 'Ruta de prueba de admin funcionando' });
});

module.exports = router;