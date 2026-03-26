import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { Application } from "express";

// Setup Swagger
export function setupDocs(app: Application) {
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Book Tracking API",
      version: "1.0.0",
      description:
        "A personal book tracking API where users can manage books, track reading progress, and organize their reading goals.",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "auth-token",
          description: "JWT token sent in the auth-token header",
        },
      },
      schemas: {
        RegisterUserInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "Madalina Sirbu",
            },
            email: {
              type: "string",
              example: "mada@example.com",
            },
            password: {
              type: "string",
              example: "12345678",
            },
          },
        },

        LoginUserInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "mada@example.com",
            },
            password: {
              type: "string",
              example: "12345678",
            },
          },
        },

        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "67e0d1b52f9c6d0012345678",
            },
            name: {
              type: "string",
              example: "Madalina Sirbu",
            },
            email: {
              type: "string",
              example: "mada@example.com",
            },
            yearlyReadingGoal: {
              type: "number",
              example: 12,
            },
          },
        },

        CreateBookInput: {
          type: "object",
          required: ["title", "author", "coverImage", "genre", "totalPages"],
          properties: {
            title: {
              type: "string",
              example: "Atomic Habits",
            },
            author: {
              type: "string",
              example: "James Clear",
            },
            coverImage: {
              type: "string",
              example: "https://example.com/atomic-habits.jpg",
            },
            description: {
              type: "string",
              example: "A practical book about building good habits.",
            },
            genre: {
              type: "string",
              example: "Self-help",
            },
            totalPages: {
              type: "number",
              example: 320,
            },
            currentPage: {
              type: "number",
              example: 0,
            },
            status: {
              type: "string",
              enum: ["want-to-read", "currently-reading", "finished"],
              example: "want-to-read",
            },
            startedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-22T10:00:00.000Z",
            },
            finishedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-02T18:30:00.000Z",
            },
            targetDate: {
              type: "string",
              format: "date-time",
              example: "2026-04-15T00:00:00.000Z",
            },
            isFavorite: {
              type: "boolean",
              example: false,
            },
          },
        },

        UpdateBookInput: {
          type: "object",
          properties: {
            title: {
              type: "string",
              example: "Atomic Habits",
            },
            author: {
              type: "string",
              example: "James Clear",
            },
            coverImage: {
              type: "string",
              example: "https://example.com/atomic-habits.jpg",
            },
            description: {
              type: "string",
              example: "A practical book about building good habits.",
            },
            genre: {
              type: "string",
              example: "Self-help",
            },
            totalPages: {
              type: "number",
              example: 320,
            },
            currentPage: {
              type: "number",
              example: 145,
            },
            status: {
              type: "string",
              enum: ["want-to-read", "currently-reading", "finished"],
              example: "currently-reading",
            },
            startedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-22T10:00:00.000Z",
            },
            finishedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-02T18:30:00.000Z",
            },
            targetDate: {
              type: "string",
              format: "date-time",
              example: "2026-04-15T00:00:00.000Z",
            },
            isFavorite: {
              type: "boolean",
              example: true,
            },
          },
        },

        Book: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "67e0d1b52f9c6d0012345678",
            },
            title: {
              type: "string",
              example: "Atomic Habits",
            },
            author: {
              type: "string",
              example: "James Clear",
            },
            coverImage: {
              type: "string",
              example: "https://example.com/atomic-habits.jpg",
            },
            description: {
              type: "string",
              example: "A practical book about building good habits.",
            },
            genre: {
              type: "string",
              example: "Self-help",
            },
            totalPages: {
              type: "number",
              example: 320,
            },
            currentPage: {
              type: "number",
              example: 145,
            },
            status: {
              type: "string",
              enum: ["want-to-read", "currently-reading", "finished"],
              example: "currently-reading",
            },
            startedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-22T10:00:00.000Z",
            },
            finishedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-02T18:30:00.000Z",
            },
            targetDate: {
              type: "string",
              format: "date-time",
              example: "2026-04-15T00:00:00.000Z",
            },
            isFavorite: {
              type: "boolean",
              example: true,
            },
            userId: {
              type: "string",
              example: "67e0d1b52f9c6d0099999999",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-22T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-03-25T14:20:00.000Z",
            },
          },
        },
      },
    },
  };

  const options = {
    definition: swaggerDefinition,
    apis: ["./src/**/*.ts"],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}