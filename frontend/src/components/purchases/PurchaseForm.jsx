// frontend/src/components/purchases/PurchaseForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import { getSuppliers } from '../../services/supplierService';
import { getProducts } from '../../services/productService';
import { createPurchase } from '../../services/purchaseService';

const PurchaseForm = ({ onSave, onCancel }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    proveedor_id: '',
    ncf_proveedor: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    tipo_compra: 'contado',
    productos: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers({ activo: 'true' });
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts({ activo: 'true' });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, {
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0,
        itbis_porcentaje: 18
      }]
    }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }));
  };

  const updateProduct = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createPurchase(formData);
      onSave();
    } catch (error) {
      console.error('Error al guardar compra:', error);
      alert('Error al guardar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Proveedor"
          value={formData.proveedor_id}
          onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
          options={[
            { value: '', label: 'Seleccione un proveedor' },
            ...suppliers.map(s => ({ value: s.id, label: s.nombre_comercial }))
          ]}
          required
        />

        <Input
          label="NCF del Proveedor"
          value={formData.ncf_proveedor}
          onChange={(e) => setFormData({ ...formData, ncf_proveedor: e.target.value })}
          placeholder="B0100000123"
          required
        />

        <Input
          label="Fecha de Compra"
          type="date"
          value={formData.fecha_compra}
          onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
          required
        />

        <Select
          label="Tipo de Compra"
          value={formData.tipo_compra}
          onChange={(e) => setFormData({ ...formData, tipo_compra: e.target.value })}
          options={[
            { value: 'contado', label: 'Contado' },
            { value: 'credito', label: 'Crédito' }
          ]}
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Productos</h3>
          <Button type="button" onClick={addProduct} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {formData.productos.map((producto, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end">
            <div className="col-span-4">
              <Select
                label="Producto"
                value={producto.producto_id}
                onChange={(e) => updateProduct(index, 'producto_id', e.target.value)}
                options={[
                  { value: '', label: 'Seleccione' },
                  ...products.map(p => ({ value: p.id, label: p.nombre }))
                ]}
                required
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Cantidad"
                type="number"
                min="1"
                value={producto.cantidad}
                onChange={(e) => updateProduct(index, 'cantidad', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="col-span-3">
              <Input
                label="Precio Unit."
                type="number"
                step="0.01"
                min="0"
                value={producto.precio_unitario}
                onChange={(e) => updateProduct(index, 'precio_unitario', parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="col-span-2">
              <Input
                label="ITBIS %"
                type="number"
                min="0"
                max="100"
                value={producto.itbis_porcentaje}
                onChange={(e) => updateProduct(index, 'itbis_porcentaje', parseFloat(e.target.value))}
              />
            </div>

            <div className="col-span-1">
              <Button
                type="button"
                onClick={() => removeProduct(index)}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="secondary">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>

        <Button type="submit" disabled={loading || formData.productos.length === 0}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Guardando...' : 'Guardar Compra'}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseForm;