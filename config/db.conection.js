const {Sequelize} = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  dialect: 'postgres',
});

const conexion = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa');
  } catch (error) {
    console.error('Error de conexión:', error);
  }
};



module.exports = {
    conexion, sequelize
}