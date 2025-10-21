// frontend/src/components/inventory/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../services/productService';
import { createInventoryMovement } from '../../services/inventoryService';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Notification from '../common/Notification';
import { AlertCircle } from 'lucide-react';

const ProductForm = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    unidad_medida: 'UND',
    precio_compra: '',
    precio_venta: '',
    precio_mayorista: '',
    itbis_aplicable: true,
    tasa_itbis: '18.00',
    stock_actual: '0',
    stock_minimo: '0',
    stock_maximo: '0',
    imagen_url: '',
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 🆕 Estado para controlar si el stock cambió
  const [stockOriginal, setStockOriginal] = useState(0);
  const [stockCambio, setStockCambio] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo || '',
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        categoria_id: product.categoria_id || '',
        unidad_medida: product.unidad_medida || 'UND',
        precio_compra: product.precio_compra || '',
        precio_venta: product.precio_venta || '',
        precio_mayorista: product.precio_mayorista || '',
        itbis_aplicable: product.itbis_aplicable !== undefined ? product.itbis_aplicable : true,
        tasa_itbis: product.tasa_itbis || '18.00',
        stock_actual: product.stock_actual || '0',
        stock_minimo: product.stock_minimo || '0',
        stock_maximo: product.stock_maximo || '0',
        imagen_url: product.imagen_url || '',
        activo: product.activo !== undefined ? product.activo : true,
      });
      
      // 🆕 Guardar stock original para detectar cambios
      setStockOriginal(product.stock_actual || 0);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'itbis_aplicable') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        tasa_itbis: checked ? '18.00' : '0.00',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      
      // 🆕 Detectar si cambió el stock
      if (name === 'stock_actual' && product) {
        const nuevoStock = parseInt(value) || 0;
        setStockCambio(nuevoStock !== stockOriginal);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.codigo || !formData.nombre || !formData.categoria_id) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      if (parseFloat(formData.precio_venta) < parseFloat(formData.precio_compra)) {
        throw new Error('El precio de venta no puede ser menor que el precio de compra');
      }

      // Convertir valores numéricos
      const dataToSend = {
        ...formData,
        categoria_id: parseInt(formData.categoria_id),
        precio_compra: parseFloat(formData.precio_compra) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
        precio_mayorista: formData.precio_mayorista ? parseFloat(formData.precio_mayorista) : null,
        tasa_itbis: parseFloat(formData.tasa_itbis) || 0,
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        stock_maximo: parseInt(formData.stock_maximo) || 0,
      };

      if (product) {
        // ACTUALIZAR PRODUCTO
        await updateProduct(product.id, dataToSend);
        
        // 🆕 Si el stock cambió, crear un movimiento de ajuste
        if (stockCambio) {
          const nuevoStock = parseInt(formData.stock_actual) || 0;
          
          await createInventoryMovement({
            producto_id: product.id,
            tipo_movimiento: 'ajuste',
            cantidad: nuevoStock,
            motivo: `Ajuste manual desde edición de producto. Stock anterior: ${stockOriginal}, Stock nuevo: ${nuevoStock}`,
            documento_referencia: 'AJUSTE-MANUAL',
          });
          
          console.log('✅ Movimiento de ajuste creado automáticamente');
        }
      } else {
        // CREAR PRODUCTO NUEVO
        const response = await createProduct(dataToSend);
        
        // 🆕 Si tiene stock inicial, crear movimiento de entrada
        if (dataToSend.stock_actual > 0) {
          await createInventoryMovement({
            producto_id: response.product.id,
            tipo_movimiento: 'entrada',
            cantidad: dataToSend.stock_actual,
            motivo: 'Inventario inicial al crear producto',
            documento_referencia: 'INV-INICIAL',
          });
          
          console.log('✅ Movimiento de inventario inicial creado');
        }
      }

      onSave();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Notification type="error" message={error} />}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Código"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          required
          disabled={!!product}
        />
        <Select
          label="Categoría"
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleChange}
          options={[
            { value: '', label: 'Seleccione una categoría' },
            ...categories.map(cat => ({ value: cat.id, label: cat.nombre }))
          ]}
          required
        />
      </div>

      <Input
        label="Nombre del Producto"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Descripción detallada del producto..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Unidad de Medida"
          name="unidad_medida"
          value={formData.unidad_medida}
          onChange={handleChange}
          options={[
            { value: 'UND', label: 'Unidad' },
            { value: 'KG', label: 'Kilogramo' },
            { value: 'LB', label: 'Libra' },
            { value: 'LT', label: 'Litro' },
            { value: 'GAL', label: 'Galón' },
            { value: 'MT', label: 'Metro' },
            { value: 'CAJA', label: 'Caja' },
            { value: 'PAQUETE', label: 'Paquete' },
          ]}
          required
        />
        <Input
          label="Imagen URL"
          name="imagen_url"
          type="url"
          value={formData.imagen_url}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Precio Compra"
          name="precio_compra"
          type="number"
          step="0.01"
          value={formData.precio_compra}
          onChange={handleChange}
          required
        />
        <Input
          label="Precio Venta"
          name="precio_venta"
          type="number"
          step="0.01"
          value={formData.precio_venta}
          onChange={handleChange}
          required
        />
        <Input
          label="Precio Mayorista"
          name="precio_mayorista"
          type="number"
          step="0.01"
          value={formData.precio_mayorista}
          onChange={handleChange}
          placeholder="Opcional"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Configuración de ITBIS</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="itbis_aplicable"
              checked={formData.itbis_aplicable}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm text-gray-700">
              Aplicar ITBIS a este producto
            </label>
          </div>
          {formData.itbis_aplicable && (
            <Input
              label="Tasa ITBIS (%)"
              name="tasa_itbis"
              type="number"
              step="0.01"
              value={formData.tasa_itbis}
              onChange={handleChange}
              required
            />
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Control de Inventario</h3>
        
        {/* 🆕 ALERTA si el stock va a cambiar en edición */}
        {product && stockCambio && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">⚠️ Cambio de Stock Detectado</p>
                <p>
                  Stock actual: <strong>{stockOriginal}</strong> → Nuevo: <strong>{formData.stock_actual}</strong>
                </p>
                <p className="mt-1">
                  Se creará automáticamente un <strong>movimiento de ajuste</strong> para mantener trazabilidad.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Stock Actual"
            name="stock_actual"
            type="number"
            value={formData.stock_actual}
            onChange={handleChange}
            disabled={false}  // 🆕 AHORA ESTÁ HABILITADO
            placeholder="0"
          />
          <Input
            label="Stock Mínimo"
            name="stock_minimo"
            type="number"
            value={formData.stock_minimo}
            onChange={handleChange}
          />
          <Input
            label="Stock Máximo"
            name="stock_maximo"
            type="number"
            value={formData.stock_maximo}
            onChange={handleChange}
          />
        </div>
        
        {/* 🆕 NOTA INFORMATIVA */}
        <p className="text-xs text-gray-500 mt-2">
          {product 
            ? '💡 Al cambiar el stock manualmente, se creará automáticamente un movimiento de ajuste para trazabilidad.'
            : '💡 El stock inicial se registrará como un movimiento de entrada.'}
        </p>
      </div>

      {product && (
        <div className="flex items-center space-x-2 border-t pt-4">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700">
            Producto activo
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;