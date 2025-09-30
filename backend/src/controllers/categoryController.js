// backend/src/controllers/categoryController.js
import db from '../models/index.js';
const { Category } = db;

// @desc    Obtener todas las categorías
// @route   GET /api/v1/categorias
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'nombre'], // Solo necesitamos el ID y el nombre
      order: [['nombre', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener categorías.' });
  }
};
// Aquí iría createCategory, updateCategory, etc.