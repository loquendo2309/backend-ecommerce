const express = require('express');
const config = require('./config');
console.log('>>> Config leída:', config);
const MongoProductRepository = require('./infraestructure/repositories/MongoProductRepository');
const MySQLProductRepository = require('./infraestructure/repositories/MySQLProductRepository');
const ProductController = require('./adapters/controllers/ProductController');
const productRoutes = require('./adapters/routes/productRoutes');
const { verifyToken } = require('./adapters/middlewares/authJwt');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./infraestructure/docs/swaggerConfig');

const app = express();
const port = config.port;

// Dependencies
const dbType = config.DB_TYPE || 'mongodb'; // 'mongo' o 'mysql'
let productRepository;
console.log('>>> DB_TYPE:', dbType);
if (dbType === 'mysql') {
  productRepository = new MySQLProductRepository();
} else {
  productRepository = new MongoProductRepository();
}


const productController = new ProductController(productRepository);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Configuración de Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
// Routes
app.use('/api/v1/products', verifyToken, productRoutes(productController));

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// Start Server
app.listen(port, () => {
  console.log(`E-commerce server running on port http://localhost:${port}`);
});