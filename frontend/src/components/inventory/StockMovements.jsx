// frontend/src/components/inventory/StockMovements.jsx - SIN PROVEEDORES (TEMPORAL)

import React, { useState, useEffect } from 'react';
import {
  getInventoryMovements,
  createInventoryMovement,
} from '../../services/inventoryService';
import { getProducts } from '../../services/productService';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Plus,
  AlertCircle,
} from 'lucide-react';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Notification from '../common/Notification';

const MovementForm = ({ products, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo_movimiento: 'entrada',
    cantidad: '',
    costo_unitario: '',
    documento_referencia: '',
    motivo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      producto_id,
      tipo_movimiento,
      cantidad,
      costo_unitario,
      documento_referencia,
      motivo,
    } = formData;

    // Validación de Datos
    const parsedCantidad = parseInt(cantidad, 10);
    const parsedCosto = costo_unitario ? parseFloat(costo_unitario) : undefined;

    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      setError('La cantidad debe ser un número positivo.');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        producto_id: parseInt(producto_id, 10),
        tipo_movimiento: tipo_movimiento,
        cantidad: parsedCantidad,
        costo_unitario: parsedCosto,
        documento_referencia: documento_referencia,
        motivo: motivo,
      };

      await createInventoryMovement(dataToSend);
      onSave();
    } catch (err) {
      console.error('Error al crear movimiento:', err);
      setError(
        err.response?.data?.message ||
          'Error al registrar el movimiento. Verifica los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">ℹ️ Información</p>
            <p>
              Los movimientos de inventario se registran automáticamente. 
              Para registrar compras con proveedores y NCF (Reporte 606), 
              espera a que se implemente el módulo de Compras.
            </p>
          </div>
        </div>
      </div>

      <Select
        label="Producto"
        name="producto_id"
        value={formData.producto_id}
        onChange={handleChange}
        options={[
          { value: '', label: 'Seleccione un producto' },
          ...products.map(p => ({
            value: String(p.id),
            label: `${p.codigo} - ${p.nombre} (Stock: ${p.stock_actual || 0})`,
          })),
        ]}
        required
      />

      <Select
        label="Tipo de Movimiento"
        name="tipo_movimiento"
        value={formData.tipo_movimiento}
        onChange={handleChange}
        options={[
          { value: 'entrada', label: '📦 Entrada (Aumentar Stock)' },
          { value: 'salida', label: '📤 Salida (Disminuir Stock)' },
          { value: 'ajuste', label: '⚙️ Ajuste (Inventario Físico)' },
        ]}
        required
      />

      <Input
        label="Cantidad"
        name="cantidad"
        type="number"
        min="1"
        value={formData.cantidad}
        onChange={handleChange}
        required
      />

      <Input
        label="Costo Unitario (Opcional)"
        name="costo_unitario"
        type="number"
        step="0.01"
        min="0"
        value={formData.costo_unitario}
        onChange={handleChange}
        placeholder="Para actualizar el costo promedio"
      />

      <Input
        label="Documento de Referencia"
        name="documento_referencia"
        value={formData.documento_referencia}
        onChange={handleChange}
        placeholder="Ej: OC-001, Factura-123"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivo <span className="text-red-500">*</span>
        </label>
        <textarea
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          rows={3}
          required
          placeholder="Describa el motivo de este movimiento..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Movimiento'}
        </Button>
      </div>
    </form>
  );
};

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtros
  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [productFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Solo cargar movimientos y productos (SIN proveedores por ahora)
      const [movementsData, productsData] = await Promise.all([
        getInventoryMovements({
          producto_id: productFilter || undefined,
          tipo_movimiento: typeFilter || undefined,
          limit: 50,
        }),
        getProducts({ activo: true }),
      ]);

      setMovements(movementsData?.data || []);
      setProducts(productsData?.products || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar movimientos o productos. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovementSaved = () => {
    setShowModal(false);
    setSuccess('✓ Movimiento registrado exitosamente');
    setTimeout(() => setSuccess(null), 3000);
    loadData();
  };

  const getMovementIcon = type => {
    switch (type) {
      case 'entrada':
        return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
      case 'salida':
        return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
      case 'ajuste':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMovementBadge = type => {
    const badges = {
      entrada: 'bg-green-100 text-green-800',
      salida: 'bg-red-100 text-red-800',
      ajuste: 'bg-blue-100 text-blue-800',
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {error && <Notification type="error" message={error} />}
      {success && <Notification type="success" message={success} />}

      {/* Filtros y Acciones */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Filtrar por Producto"
            name="product"
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los productos' },
              ...products.map(p => ({
                value: String(p.id),
                label: `${p.codigo} - ${p.nombre}`,
              })),
            ]}
          />

          <Select
            label="Filtrar por Tipo"
            name="type"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'entrada', label: 'Entradas' },
              { value: 'salida', label: 'Salidas' },
              { value: 'ajuste', label: 'Ajustes' },
            ]}
          />

          <div className="flex items-end">
            <Button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Movimiento</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando movimientos...
          </div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">No hay movimientos registrados</p>
            <p className="text-sm">Crea tu primer movimiento de inventario</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map(movement => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(movement.fecha_movimiento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.tipo_movimiento)}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getMovementBadge(movement.tipo_movimiento)}`}
                        >
                          {movement.tipo_movimiento.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {movement.product?.nombre}
                        </div>
                        <div className="text-gray-500">
                          {movement.product?.codigo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                      {movement.tipo_movimiento === 'entrada' && '+'}
                      {movement.tipo_movimiento === 'salida' && '-'}
                      {formatNumber(movement.cantidad)}{' '}
                      {movement.product?.unidad_medida}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{movement.motivo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.user?.nombre_completo || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Registrar Movimiento de Inventario"
        >
          <MovementForm
            products={products}
            onSave={handleMovementSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default StockMovements;