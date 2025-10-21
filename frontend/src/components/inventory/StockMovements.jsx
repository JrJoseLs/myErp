// frontend/src/components/inventory/StockMovements.jsx

import React, { useState, useEffect } from 'react';
import {
  getInventoryMovements,
  createInventoryMovement,
} from '../../services/inventoryService';
import { getProducts } from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Notification from '../common/Notification';

const MovementForm = ({ products, suppliers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo_movimiento: 'entrada',
    cantidad: '',
    costo_unitario: '',
    documento_referencia: '',
    motivo: '',
    // 🆕 NUEVOS CAMPOS PARA COMPRA
    es_compra: false,
    proveedor_id: '',
    ncf_proveedor: '',
    fecha_compra: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 🆕 Resetear campos de compra si se cambia el tipo de movimiento
  useEffect(() => {
    if (formData.tipo_movimiento !== 'entrada') {
      setFormData(prev => ({
        ...prev,
        es_compra: false,
        proveedor_id: '',
        ncf_proveedor: '',
      }));
    }
  }, [formData.tipo_movimiento]);

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
      es_compra,
      proveedor_id,
      ncf_proveedor,
      fecha_compra,
    } = formData;

    // Validación de Datos
    const parsedCantidad = parseInt(cantidad, 10);
    const parsedCosto = costo_unitario ? parseFloat(costo_unitario) : undefined;

    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      setError('La cantidad debe ser un número positivo.');
      setLoading(false);
      return;
    }

    // 🆕 VALIDACIÓN: Si es compra, verificar campos requeridos
    if (es_compra && tipo_movimiento === 'entrada') {
      if (!proveedor_id) {
        setError('Debe seleccionar un proveedor para registrar la compra.');
        setLoading(false);
        return;
      }
      if (!ncf_proveedor || ncf_proveedor.trim() === '') {
        setError('Debe ingresar el NCF del proveedor para Reporte 606.');
        setLoading(false);
        return;
      }
      if (!parsedCosto) {
        setError('Debe ingresar el costo unitario para registrar la compra.');
        setLoading(false);
        return;
      }
    }

    try {
      const dataToSend = {
        producto_id: parseInt(producto_id, 10),
        tipo_movimiento: tipo_movimiento,
        cantidad: parsedCantidad,
        costo_unitario: parsedCosto,
        documento_referencia: documento_referencia,
        motivo: motivo,
        // 🆕 INCLUIR CAMPOS DE COMPRA
        es_compra: es_compra && tipo_movimiento === 'entrada',
        proveedor_id: es_compra && tipo_movimiento === 'entrada' ? parseInt(proveedor_id, 10) : undefined,
        ncf_proveedor: es_compra && tipo_movimiento === 'entrada' ? ncf_proveedor : undefined,
        fecha_compra: es_compra && tipo_movimiento === 'entrada' ? fecha_compra : undefined,
      };

      const response = await createInventoryMovement(dataToSend);
      
      // Mostrar mensaje de éxito con información adicional si es compra
      if (response.purchase) {
        console.log('✅ Compra creada:', response.purchase.numero_compra);
      }
      
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

  // 🆕 Mostrar u ocultar el checkbox según el tipo de movimiento
  const mostrarCheckboxCompra = formData.tipo_movimiento === 'entrada';

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

      {/* 🆕 CHECKBOX "ES UNA COMPRA" - Solo visible en ENTRADA */}
      {mostrarCheckboxCompra && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="es_compra"
              checked={formData.es_compra}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="flex-1">
              <label className="text-sm font-semibold text-blue-900 cursor-pointer">
                ¿Es una compra a proveedor?
              </label>
              <p className="text-xs text-blue-700 mt-1">
                Marque esta opción si desea que esta entrada aparezca en el <strong>Reporte 606 (DGII)</strong>. 
                Deberá proporcionar el proveedor y su NCF.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 CAMPOS DE COMPRA - Solo visible si checkbox está marcado */}
      {formData.es_compra && mostrarCheckboxCompra && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-green-900">
              Información de Compra (Reporte 606)
            </h3>
          </div>

          <Select
            label="Proveedor"
            name="proveedor_id"
            value={formData.proveedor_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Seleccione un proveedor' },
              ...suppliers.map(s => ({
                value: String(s.id),
                label: `${s.codigo_proveedor} - ${s.nombre_comercial} (${s.numero_identificacion})`,
              })),
            ]}
            required
          />

          <Input
            label="NCF del Proveedor"
            name="ncf_proveedor"
            value={formData.ncf_proveedor}
            onChange={handleChange}
            placeholder="B0100000001"
            maxLength={19}
            required
          />

          <Input
            label="Fecha de Compra"
            name="fecha_compra"
            type="date"
            value={formData.fecha_compra}
            onChange={handleChange}
            required
          />
        </div>
      )}

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
        label={formData.es_compra ? 'Costo Unitario (Requerido para compra)' : 'Costo Unitario (Opcional)'}
        name="costo_unitario"
        type="number"
        step="0.01"
        min="0"
        value={formData.costo_unitario}
        onChange={handleChange}
        placeholder="Para actualizar el costo promedio"
        required={formData.es_compra}
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
  const [suppliers, setSuppliers] = useState([]);
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
      // 🆕 Cargar movimientos, productos Y proveedores
      const [movementsData, productsData, suppliersData] = await Promise.all([
        getInventoryMovements({
          producto_id: productFilter || undefined,
          tipo_movimiento: typeFilter || undefined,
          limit: 50,
        }),
        getProducts({ activo: true }),
        getSuppliers({ activo: true }),
      ]);

      setMovements(movementsData?.data || []);
      setProducts(productsData?.products || []);
      setSuppliers(suppliersData?.suppliers || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos. Verifica la conexión con el backend.');
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
            suppliers={suppliers}
            onSave={handleMovementSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default StockMovements;