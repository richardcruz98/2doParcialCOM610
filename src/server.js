require('dotenv').config();
const { crearApp } = require('./app');

const PORT = process.env.PORT || 3000;
const app = crearApp();

app.listen(PORT, () => {
  console.log(`API de libros escuchando en el puerto ${PORT}`);
});
