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

interface Category {
  id: number;
  name: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [formError, setFormError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      let data = await res.json();
      // Ordena por ID crescente
      data = data.sort((a: Category, b: Category) => a.id - b.id);
      setCategories(data);
    } catch (e) {
      setFormError("Erro ao buscar categorias.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name });
    } else {
      setEditingCategory(null);
      setForm({ name: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
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
      if (editingCategory) {
        // Update
        const res = await fetch(
          `${API_URL}/api/categories/${editingCategory.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        if (!res.ok) throw new Error("Erro ao atualizar categoria");
      } else {
        // Create
        const res = await fetch(`${API_URL}/api/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Erro ao criar categoria");
        }
      }
      handleClose();
      fetchCategories();
    } catch (e: any) {
      setFormError(e.message || "Erro ao salvar categoria.");
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:8080/api/categories/${id}`, {
      method: "DELETE",
    });
    fetchCategories();
  };

  return (
    <div className="page-container">
      <h2>CRUD de Categorias</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        style={{ marginBottom: 16 }}
      >
        Nova Categoria
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
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>Nenhuma categoria encontrada.</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(category)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category.id)}
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
          {editingCategory ? "Editar Categoria" : "Nova Categoria"}
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

export default CategoriesPage;
