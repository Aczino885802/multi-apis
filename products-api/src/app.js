import express from "express";
import cors from "cors";
import { pool } from "./dbp.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;

// Health DB
app.get("/db/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Crear producto (INSERT real)
app.post("/products", async (req, res) => {
  const { name, precio } = req.body ?? {};
  if (!name || !precio) {
    return res.status(400).json({ error: "name & precio required" });
  }

  try {
    const r = await pool.query(
      "INSERT INTO products_schema.products(name, precio) VALUES($1, $2) RETURNING id, name, precio",
      [name, precio]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "insert failed", detail: String(e) });
  }
});

// Listar productos
app.get("/products", async (_req, res) => {
  try {
    const r = await pool.query("SELECT id, name, precio FROM products_schema.products ORDER BY id ASC");
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

// Obtener un producto por ID
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query(
      "SELECT id, name, precio FROM products_schema.products WHERE id=$1",
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

// Editar producto (UPDATE)
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, precio } = req.body ?? {};
  if (!name || !precio) {
    return res.status(400).json({ error: "name & precio required" });
  }

  try {
    const r = await pool.query(
      "UPDATE products_schema.products SET name=$1, precio=$2 WHERE id=$3 RETURNING id, name, precio",
      [name, precio, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "update failed", detail: String(e) });
  }
});

// Eliminar producto (DELETE)
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query(
      "DELETE FROM products_schema.products WHERE id=$1 RETURNING id",
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "product not found" });
    res.json({ msg: "product deleted", id });
  } catch (e) {
    res.status(500).json({ error: "delete failed", detail: String(e) });
  }
});

// Health service
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "products-api" })
);

app.listen(PORT, () =>
  console.log(`✅ products-api on http://localhost:${PORT}`)
);

