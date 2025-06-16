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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface Author {
  id: number;
  name: string;
}

const AuthorsPage = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [formError, setFormError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/authors`);
      const data = await res.json();
      setAuthors(data);
    } catch (e) {
      setFormError("Erro ao buscar autores.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleOpen = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setForm({ name: author.name });
    } else {
      setEditingAuthor(null);
      setForm({ name: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAuthor(null);
    setForm({ name: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      setFormError("Por favor, preencha o nome antes de salvar.");
      return;
    }
    setFormError("");
    try {
      if (editingAuthor) {
        // Update
        const res = await fetch(`${API_URL}/api/authors/${editingAuthor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Erro ao atualizar autor");
      } else {
        // Create
        const res = await fetch(`${API_URL}/api/authors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Erro ao criar autor");
        }
      }
      handleClose();
      fetchAuthors();
    } catch (e: any) {
      setFormError(e.message || "Erro ao salvar autor.");
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/api/authors/${id}`, {
      method: "DELETE",
    });
    fetchAuthors();
  };

  return (
    <div className="page-container">
      <h2>CRUD de Autores</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        style={{ marginBottom: 16 }}
      >
        Novo Autor
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3}>Carregando...</TableCell>
              </TableRow>
            ) : authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>Nenhum autor encontrado.</TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>{author.id}</TableCell>
                  <TableCell>{author.name}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(author)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(author.id)}
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
        <DialogTitle>
          {editingAuthor ? "Editar Autor" : "Novo Autor"}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <div style={{ color: '#b71c1c', marginBottom: 12, fontWeight: 500 }}>
              {formError}
            </div>
          )}
          <TextField
            margin="dense"
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
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

export default AuthorsPage;
