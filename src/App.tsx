import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BooksPage from "./pages/BooksPage";
import AuthorsPage from "./pages/AuthorsPage";
import CategoriesPage from "./pages/CategoriesPage";
import "./App.css";

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link to="/books">Livros</Link>
        <Link to="/authors">Autores</Link>
        <Link to="/categories">Categorias</Link>
      </nav>
      <Routes>
        <Route path="/books" element={<BooksPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="*" element={<BooksPage />} />
      </Routes>
    </Router>
  );
}

export default App;
