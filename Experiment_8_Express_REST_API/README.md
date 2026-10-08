# Experiment 8 - RESTful Book Management API

## Install
```bash
npm install
```

## Run
```bash
npm start
```

Server:
`http://localhost:3000`

## API Endpoints

GET `/books` - Get all books

GET `/books/:id` - Get a book by ID

POST `/books` - Add a new book

PUT `/books/:id` - Update a book

DELETE `/books/:id` - Delete a book

## POST/PUT JSON
```json
{
  "title": "Web Development Basics",
  "author": "Aarav Mehta",
  "year": 2026
}
```

Test all endpoints using Postman.
