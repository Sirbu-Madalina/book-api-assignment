import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { Application } from 'express';

// Setup Swagger
export function setupDocs(app: Application) {

  // Swagger definition
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'book-api-assignment',
      version: '1.0.0',
      description: 'Book library API',
    },
    servers: [
      {
        url: 'http://localhost:4000/api/',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'auth-token',
        },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            image: { type: 'string' },
            description: { type: 'string' },
            publishedYear: { type: 'number' },
            genre: { type: 'string' },
            price: { type: 'number' },
            inStock: { type: 'boolean' },
          },
        },
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
      },
    },
  };

  // Swagger options
  const options = {
    definition: swaggerDefinition,
    apis: ['./src/**/*.ts'],
  };

  // Swagger specification
  const swaggerSpec = swaggerJSDoc(options);

  // Create docs route
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}