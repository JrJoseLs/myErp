// frontend/src/pages/Inventory.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProducts, getCategories } from '../services/productService';
import { formatCurrency, formatNumber, getStockBadge } from '../utils/formatters';
import { Package, Search, Plus, Edit, ToggleLeft, ToggleRight, History, LogOut } from 'lucide-react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Notification from '../components/common/Notification';
import ProductForm from '../components/inventory/ProductForm';
import StockMovements from '../components/inventory/StockMovements';

const InventoryPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'movements'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('true');
  const [stockFilter, setStockFilter] = useState('');
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cargar datos
  useEffect(() => {
    if (activeTab === 'products') {
      loadData();
    }
  }, [activeTab, search, categoryFilter, statusFilter, stockFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData.categories || []);
      
      const filters = {
        search: search || undefined,
        categoria_id: categoryFilter || undefined,
        activo: statusFilter || undefined,
        stock_bajo: stockFilter || undefined,
      };
      
      const productsData = await getProducts(filters);
      setProducts(productsData.products || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar los datos del inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleProductSaved = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSuccess('Producto guardado exitosamente');
    setTimeout(() => setSuccess(null), 3000);
    loadData();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.nombre_completo}</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
              {user?.rol}
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      {error && <Notification type="error" message={error} />}
      {success && <Notification type="success" message={success} />}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'products'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Productos</span>
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'movements'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-5 h-5" />
              <span>Movimientos</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido según Tab */}
      {activeTab === 'products' ? (
        <>
          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              
              <Select
                label=""
                name="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...categories.map(cat => ({ value: cat.id, label: cat.nombre }))
                ]}
              />
              
              <Select
                label=""
                name="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'true', label: 'Activos' },
                  { value: 'false', label: 'Inactivos' }
                ]}
              />
              
              <Select
                label=""
                name="stock"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                options={[
                  { value: '', label: 'Todo el stock' },
                  { value: 'true', label: 'Stock bajo' }
                ]}
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreateProduct} className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Nuevo Producto</span>
              </Button>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No se encontraron productos</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ITBIS</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const stockBadge = getStockBadge(product.stock_actual, product.stock_minimo);
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.codigo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category?.nombre || 'Sin categoría'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockBadge.color} text-white`}>
                              {formatNumber(product.stock_actual)} {product.unidad_medida}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                            {formatCurrency(product.precio_venta)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {product.itbis_aplicable ? (
                              <span className="text-green-600 font-medium">{product.tasa_itbis}%</span>
                            ) : (
                              <span className="text-gray-400">Exento</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {product.activo ? (
                              <ToggleRight className="w-6 h-6 text-green-500 mx-auto" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-400 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <StockMovements />
      )}

      {/* Modal de Formulario */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        >
          <ProductForm
            product={selectedProduct}
            categories={categories}
            onSave={handleProductSaved}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;