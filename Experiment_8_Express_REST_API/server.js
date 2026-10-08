const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

let books = [
    { id: 1, title: "Clean Code", author: "Robert C. Martin", year: 2008 },
    { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt", year: 1999 },
    { id: 3, title: "JavaScript: The Good Parts", author: "Douglas Crockford", year: 2008 }
];

app.get("/", (req, res) => {
    res.json({
        message: "Book Management REST API is running",
        student: "Pyata Sai Pranathi",
        rollNo: "160124748016"
    });
});

app.get("/books", (req, res) => {
    res.json(books);
});

app.get("/books/:id", (req, res) => {
    const book = books.find(b => b.id === Number(req.params.id));
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
});

app.post("/books", (req, res) => {
    const { title, author, year } = req.body;

    if (!title || !author || !Number.isInteger(Number(year))) {
        return res.status(400).json({ message: "Title, author and year are required" });
    }

    const newBook = {
        id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title,
        author,
        year: Number(year)
    };

    books.push(newBook);
    res.status(201).json(newBook);
});

app.put("/books/:id", (req, res) => {
    const index = books.findIndex(b => b.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: "Book not found" });
    }

    const { title, author, year } = req.body;
    books[index] = {
        ...books[index],
        title: title || books[index].title,
        author: author || books[index].author,
        year: year || books[index].year: Number(year)
    };

    res.json(books[index]);
});

app.delete("/books/:id", (req, res) => {
    const index = books.findIndex(b => b.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ message: "Book not found" });
    }

    const deletedBook = books.splice(index, 1)[0];
    res.json({ message: "Book deleted successfully", book: deletedBook });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
