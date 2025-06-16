import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Edit, Delete } from "@mui/icons-material";

interface Book {
  id: number;
  title: string;
  authorName: string;
  categoryName: string;
  isbn: string;
}

interface Author {
  id: number;
  name: string;
}
interface Category {
  id: number;
  name: string;
}

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
  });
  const [formError, setFormError] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/books`);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      setFormError("Erro ao buscar livros.");
    }
    setLoading(false);
  };

  const fetchAuthors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/authors`);
      const data = await res.json();
      setAuthors(data);
    } catch (e) {
      setFormError("Erro ao buscar autores.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      setFormError("Erro ao buscar categorias.");
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchCategories();
  }, []);

  const handleOpen = (book?: Book) => {
    if (book) {
      const author = authors.find((a) => a.name === book.authorName);
      const category = categories.find((c) => c.name === book.categoryName);
      setEditingBook(book);
      setForm({
        title: book.title,
        author: author ? String(author.id) : "",
        category: category ? String(category.id) : "",
        isbn: book.isbn,
      });
    } else {
      setEditingBook(null);
      setForm({ title: "", author: "", category: "", isbn: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBook(null);
    setForm({ title: "", author: "", category: "", isbn: "" });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.category || !form.isbn) {
      setFormError("Por favor, preencha todos os campos antes de salvar.");
      return;
    }
    setFormError("");
    const payload = {
      title: form.title,
      authorId: Number(form.author),
      categoryId: Number(form.category),
      isbn: form.isbn,
    };
    try {
      if (editingBook) {
        // Update
        const res = await fetch(`${API_URL}/api/books/${editingBook.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erro ao atualizar livro");
      } else {
        // Create
        const res = await fetch(`${API_URL}/api/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Erro ao criar livro");
        }
      }
      handleClose();
      fetchBooks();
    } catch (e: any) {
      setFormError(e.message || "Erro ao salvar livro.");
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/api/books/${id}`, { method: "DELETE" });
    fetchBooks();
  };

  return (
    <div className="page-container">
      <h2>CRUD de Livros</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        style={{ marginBottom: 16 }}
      >
        Novo Livro
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Carregando...</TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>Nenhum livro encontrado.</TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.id}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.authorName}</TableCell>
                  <TableCell>{book.categoryName}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(book)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(book.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingBook ? "Editar Livro" : "Novo Livro"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Título"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            fullWidth
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel id="author-label">Autor</InputLabel>
            <Select
              labelId="author-label"
              name="author"
              value={form.author}
              label="Autor"
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>Selecione</em>
              </MenuItem>
              {authors.map((author) => (
                <MenuItem key={author.id} value={author.id}>
                  {author.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl margin="dense" fullWidth>
            <InputLabel id="category-label">Categoria</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={form.category}
              label="Categoria"
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>Selecione</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleInputChange}
            fullWidth
          />
          {formError && (
            <div style={{ color: '#b71c1c', marginBottom: 12, fontWeight: 500 }}>
              {formError}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BooksPage;
