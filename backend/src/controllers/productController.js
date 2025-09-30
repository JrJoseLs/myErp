import { Product, Category } from '../models/index.js';
import { Op } from 'sequelize';

const EXCLUDE_FIELDS = ['created_at', 'updated_at'];

// ============================================
// Funciones para CATEGORIAS (CRUD)
// ============================================

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: { exclude: EXCLUDE_FIELDS },
      // Incluir la categoría padre para mostrar la jerarquía
      include: [
        { 
            model: Category, 
            as: 'parentCategory', 
            attributes: ['id', 'nombre'] 
        },
      ],
      order: [['nombre', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { nombre, descripcion, categoria_padre_id } = req.body;

  try {
    const categoryExists = await Category.findOne({ where: { nombre } });

    if (categoryExists) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }

    const newCategory = await Category.create({
      nombre,
      descripcion,
      categoria_padre_id: categoria_padre_id || null,
      activo: true,
    });

    res.status(201).json({ 
      message: 'Categoría creada exitosamente',
      category: newCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { nombre, descripcion, categoria_padre_id, activo } = req.body;

  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Validar duplicado de nombre (excluyendo el actual)
    if (nombre && nombre !== category.nombre) {
      const nameExists = await Category.findOne({
        where: { nombre, id: { [Op.not]: req.params.id } },
      });
      if (nameExists) {
        return res.status(400).json({ message: 'Ya existe otra categoría con ese nombre' });
      }
    }

    // Actualizar campos
    category.nombre = nombre || category.nombre;
    category.descripcion = descripcion !== undefined ? descripcion : category.descripcion;
    category.categoria_padre_id = categoria_padre_id === undefined ? category.categoria_padre_id : categoria_padre_id;
    category.activo = activo !== undefined ? activo : category.activo;

    await category.save();

    res.json({
        message: 'Categoría actualizada exitosamente',
        category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la categoría', error: error.message });
  }
};


// ============================================
// Funciones para PRODUCTOS (CRUD)
// ============================================

export const getProducts = async (req, res) => {
  try {
    // Filtros opcionales
    const where = {};
    if (req.query.categoria_id) where.categoria_id = req.query.categoria_id;
    if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

    const products = await Product.findAll({
      where,
      attributes: { exclude: EXCLUDE_FIELDS },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'nombre'],
        },
      ],
      order: [['nombre', 'ASC']],
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

/**
 * @desc Obtener producto por ID
 * @route GET /api/v1/products/:id
 * @access Private/Inventory/Admin/Sales
 */
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            attributes: { exclude: EXCLUDE_FIELDS },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'nombre'],
                },
            ],
        });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};


export const createProduct = async (req, res) => {
  const { 
    codigo, nombre, descripcion, categoria_id, unidad_medida, 
    precio_compra, precio_venta, precio_mayorista, 
    itbis_aplicable, tasa_itbis, stock_minimo, stock_maximo, 
    imagen_url, stock_actual
  } = req.body;

  try {
    const productExists = await Product.findOne({ where: { codigo } });
    if (productExists) {
      return res.status(400).json({ message: `Ya existe un producto con el código: ${codigo}` });
    }

    // Lógica de ITBIS
    const finalItbisAplicable = itbis_aplicable !== undefined ? itbis_aplicable : true;
    let finalTasaItbis = finalItbisAplicable ? parseFloat(tasa_itbis) || 18.00 : 0.00;
    
    // Validación de tasa
    if (finalItbisAplicable && (isNaN(finalTasaItbis) || finalTasaItbis < 0 || finalTasaItbis > 100)) {
        return res.status(400).json({ message: 'Tasa ITBIS inválida. Debe ser un valor entre 0 y 100.' });
    }

    const newProduct = await Product.create({
      codigo, nombre, descripcion, categoria_id, unidad_medida, 
      precio_compra: precio_compra || 0, 
      precio_venta: precio_venta || 0, 
      precio_mayorista: precio_mayorista || null, 
      itbis_aplicable: finalItbisAplicable, 
      tasa_itbis: finalTasaItbis, 
      stock_actual: stock_actual || 0, 
      stock_minimo: stock_minimo || 0, 
      stock_maximo: stock_maximo || 0, 
      costo_promedio: precio_compra || 0, // Se inicializa con el precio de compra
      activo: true, 
      imagen_url
    });

    const productWithCategory = await Product.findByPk(newProduct.id, {
        attributes: { exclude: EXCLUDE_FIELDS },
        include: [{ model: Category, as: 'category', attributes: ['id', 'nombre'] }],
    });

    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      product: productWithCategory
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { 
    codigo, nombre, descripcion, categoria_id, unidad_medida, 
    precio_compra, precio_venta, precio_mayorista, 
    itbis_aplicable, tasa_itbis, stock_minimo, stock_maximo, 
    activo, imagen_url 
  } = req.body;

  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Validar duplicado de código (excluyendo el actual)
    if (codigo && codigo !== product.codigo) {
      const codeExists = await Product.findOne({
        where: { codigo, id: { [Op.not]: req.params.id } },
      });
      if (codeExists) {
        return res.status(400).json({ message: `Otro producto ya tiene el código: ${codigo}` });
      }
    }
    
    // Lógica de ITBIS
    const newItbisAplicable = itbis_aplicable !== undefined ? itbis_aplicable : product.itbis_aplicable;
    let finalTasaItbis = product.tasa_itbis;

    if (newItbisAplicable) {
        const tasa = parseFloat(tasa_itbis !== undefined ? tasa_itbis : product.tasa_itbis);
        if (isNaN(tasa) || tasa < 0 || tasa > 100) {
            return res.status(400).json({ message: 'Tasa ITBIS inválida. Debe ser un valor entre 0 y 100.' });
        }
        finalTasaItbis = tasa;
    } else {
        finalTasaItbis = 0.00; // Forzar a 0 si no aplica ITBIS
    }

    // Actualizar campos
    product.codigo = codigo || product.codigo;
    product.nombre = nombre || product.nombre;
    product.descripcion = descripcion !== undefined ? descripcion : product.descripcion;
    product.categoria_id = categoria_id !== undefined ? categoria_id : product.categoria_id;
    product.unidad_medida = unidad_medida || product.unidad_medida;
    product.precio_compra = precio_compra !== undefined ? precio_compra : product.precio_compra;
    product.precio_venta = precio_venta !== undefined ? precio_venta : product.precio_venta;
    product.precio_mayorista = precio_mayorista !== undefined ? precio_mayorista : product.precio_mayorista;
    
    product.itbis_aplicable = newItbisAplicable;
    product.tasa_itbis = finalTasaItbis;

    product.stock_minimo = stock_minimo !== undefined ? stock_minimo : product.stock_minimo;
    product.stock_maximo = stock_maximo !== undefined ? stock_maximo : product.stock_maximo;
    // Note: stock_actual NO se actualiza aquí, sino en los movimientos de inventario
    product.activo = activo !== undefined ? activo : product.activo;
    product.imagen_url = imagen_url !== undefined ? imagen_url : product.imagen_url;

    await product.save();

    res.json({
        message: 'Producto actualizado exitosamente',
        product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

/**
 * @desc Alternar estado activo/inactivo (Soft-delete/Deactivate)
 * @route PATCH /api/v1/products/toggle-status/:id
 * @access Private/Inventory/Admin
 */
export const toggleProductStatus = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        // Alternar el estado activo
        product.activo = !product.activo;
        await product.save();

        res.json({ 
            message: `Producto ${product.activo ? 'activado' : 'desactivado'} correctamente`,
            id: product.id,
            activo: product.activo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al alternar el estado del producto', error: error.message });
    }
};