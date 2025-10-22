import mongoose from "mongoose";

// Definimos el esquema del producto
const ProductSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  // Puedes agregar más campos si quieres (p.ej. category, stock, etc.)
}, { 
  timestamps: true,  // agrega createdAt y updatedAt automáticamente
  versionKey: false  // quita el campo "__v"
});

// Exporta el modelo "Product" ligado a la colección "products"
export const Product = mongoose.model("Product", ProductSchema, "products");


