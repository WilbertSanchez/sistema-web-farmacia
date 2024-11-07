require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { conexion } = require('./config/db.conection');
const sequelize = require('./config/database'); // Importa sequelize para sincronización
const Rol = require('./models/Rol'); 
const Usuario = require('./models/Usuario');
const http = require('http');
const socketIo = require('socket.io');

// Importar Rutas
const rolRoutes = require('./routes/roles.routes');
const usuarioRoutes = require('./routes/usuarios.routes');
const productoRoutes = require('./routes/productos.routes'); 
const medicamentoRoutes = require('./routes/medicamentos.routes');
const ventaRoutes = require('./routes/ventas.routes');
const ingresoRoutes = require('./routes/ingresos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const gastosRoustes = require('./routes/gastos.routes');
const cajaRoutes = require('./routes/caja.routes');

// Inicialización de la app y el servidor HTTP
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Inicializar socket.io

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Rutas principales
app.use('/api', rolRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', productoRoutes);
app.use('/api', medicamentoRoutes);
app.use('/api', ventaRoutes);
app.use('/api', ingresoRoutes);
app.use('/api', gastosRoustes);
app.use('/api', cajaRoutes);
app.use('/api', dashboardRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de la farmacia Por Tu Salud" });
});

// Escucha cada vez que un nuevo ingreso se registra y envía el total actualizado
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('actualizarIngresos', async () => {
    const totalIngresos = await Ingreso.sum('monto');
    io.emit('ingresosActualizados', { totalIngresos });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Conexión a la base de datos
conexion();

// Sincronización de modelos y carga inicial de roles
sequelize.sync({ force: false }).then(async () => {
  console.log('Tablas sincronizadas');

  // Carga inicial de roles si no existen
  await Rol.findOrCreate({ where: { nombre: 'Administrador' } });
  await Rol.findOrCreate({ where: { nombre: 'Caja' } });

}).catch((error) => console.log('Error al sincronizar tablas:', error));

// Iniciar el servidor con server.listen en lugar de app.listen
server.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
