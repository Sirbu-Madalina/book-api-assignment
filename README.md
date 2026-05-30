# Book API Assignment

Book API Assignment is a full-stack book tracking application. Users can log in, manage a personal library, track reading progress, mark favorites, organize books into bookshelves, and record reading sessions.

## Links

- Live website: https://book-api-assignment-1.onrender.com
- API: https://book-api-assignment.onrender.com
- Swagger Docs: https://book-api-assignment.onrender.com/api/docs/
- GitHub: https://github.com/Sirbu-Madalina/book-api-assignment

## Demo Login

Use these credentials to test the deployed application:

```text
Email: john.smith@example.com
Password: 12345678
```

The demo user is intended to be seeded with example books, reading progress, favorites, and bookshelves.

## Project Overview

The project solves the problem of keeping track of personal reading activity in one place. Instead of only storing book titles, the application lets users follow their progress, separate books by reading status, save favorites, create bookshelves, and view reading goal progress.

Main features:

- User registration and login
- JWT-based authentication
- Add, edit, delete, and view books
- Track reading status: want to read, currently reading, finished
- Track current page and total pages
- Mark books as favorites
- Create and manage bookshelves
- Record reading sessions
- Dashboard with reading goal progress
- Swagger API documentation

## Tech Stack

Frontend:

- Vue 3
- TypeScript
- Vite
- Playwright for E2E testing

Backend:

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Joi validation
- Swagger documentation
- Playwright API testing

Deployment and CI/CD:

- GitHub Actions
- Render web service for backend
- Render static site for frontend

## API

The backend base URL is:

```text
https://book-api-assignment.onrender.com
```

The API routes are mounted under:

```text
/api
```

Example:

```text
https://book-api-assignment.onrender.com/api
```

Swagger documentation is available at:

```text
https://book-api-assignment.onrender.com/api/docs/
```

## Running Locally

Clone the repository:

```bash
git clone https://github.com/Sirbu-Madalina/book-api-assignment.git
cd book-api-assignment
```

Install and run the backend:

```bash
cd book-backend
npm install
npm run dev
```

Install and run the frontend in a second terminal:

```bash
cd book-ui
npm install
npm run dev
```

Frontend local URL:

```text
http://localhost:5173
```

Backend local URL:

```text
http://localhost:4000/api
```

Swagger local URL:

```text
http://localhost:4000/api/docs
```

## Environment Variables

The backend needs environment variables for database connection and authentication.

Typical backend variables:

```text
DBHOST=your_mongodb_connection_string
TOKEN_SECRET=your_jwt_secret
PORT=4000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

On Render, these values are configured as service environment variables or secrets.

## Seed Data

The backend includes a seed script that creates the demo user and example data.

From the backend folder:

```bash
cd book-backend
npm run seed
```

Seeded user:

```text
Email: john.smith@example.com
Password: 12345678
```

Seeded content includes example books, reading statuses, favorites, yearly reading goal data, and bookshelves.

## Testing

Run backend API tests:

```bash
cd book-backend
npm test
```

Run frontend E2E tests:

```bash
cd book-ui
npm run test:e2e
```

For frontend E2E tests, keep both the backend and frontend running:

```text
Backend: http://localhost:4000/api
Frontend: http://localhost:5173
```

## CI/CD

The project uses GitHub Actions for backend CI/CD.

The workflow:

- Runs on push and pull request to `main`
- Installs backend dependencies
- Builds the backend
- Runs Playwright API tests
- Deploys the backend to Render after successful checks on `main`

The frontend is deployed as a Render static site.

## Conclusion

This project demonstrates a working full-stack application with authentication, CRUD functionality, API documentation, testing, deployment, and CI/CD. The backend is structured with routes, controllers, services, models, and database logic, while the frontend provides a usable interface for managing reading activity.
