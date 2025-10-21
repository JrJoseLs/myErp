// frontend/src/components/inventory/StockMovements.jsx
// VERSIÓN COMPLETA: Con soporte para proveedores formales E informales

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
  ShoppingCart,
  Package,
  User,
  Building2,
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
    // Campos de compra
    tipo_proveedor: 'formal', // 'formal' | 'informal'
    proveedor_id: '',
    ncf_proveedor: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    // Campos para proveedor informal
    proveedor_informal_nombre: '',
    proveedor_informal_cedula: '',
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
      tipo_proveedor,
      proveedor_id,
      ncf_proveedor,
      fecha_compra,
      proveedor_informal_nombre,
      proveedor_informal_cedula,
    } = formData;

    // Validación de cantidad
    const parsedCantidad = parseInt(cantidad, 10);
    const parsedCosto = costo_unitario ? parseFloat(costo_unitario) : undefined;

    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      setError('La cantidad debe ser un número positivo.');
      setLoading(false);
      return;
    }

    // Validaciones para ENTRADA
    if (tipo_movimiento === 'entrada') {
      if (!parsedCosto) {
        setError('El costo unitario es obligatorio para entradas.');
        setLoading(false);
        return;
      }

      if (tipo_proveedor === 'formal') {
        // Validar proveedor formal
        if (!proveedor_id) {
          setError('Debe seleccionar un proveedor registrado.');
          setLoading(false);
          return;
        }
        if (!ncf_proveedor || ncf_proveedor.trim() === '') {
          setError('El NCF del proveedor es obligatorio.');
          setLoading(false);
          return;
        }
      } else {
        // Validar proveedor informal
        if (!proveedor_informal_nombre || proveedor_informal_nombre.trim() === '') {
          setError('El nombre del proveedor informal es obligatorio.');
          setLoading(false);
          return;
        }
        if (!proveedor_informal_cedula || proveedor_informal_cedula.trim() === '') {
          setError('La cédula del proveedor informal es obligatoria.');
          setLoading(false);
          return;
        }
        // Validar formato de cédula (11 dígitos con guiones: 402-1234567-8)
        const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
        if (!cedulaRegex.test(proveedor_informal_cedula)) {
          setError('La cédula debe tener el formato: 402-1234567-8');
          setLoading(false);
          return;
        }
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
        // Si es entrada, siempre es una compra
        es_compra: tipo_movimiento === 'entrada',
        tipo_proveedor: tipo_movimiento === 'entrada' ? tipo_proveedor : undefined,
        proveedor_id: tipo_movimiento === 'entrada' && tipo_proveedor === 'formal' 
          ? parseInt(proveedor_id, 10) 
          : undefined,
        ncf_proveedor: tipo_movimiento === 'entrada' && tipo_proveedor === 'formal' 
          ? ncf_proveedor 
          : undefined,
        fecha_compra: tipo_movimiento === 'entrada' ? fecha_compra : undefined,
        // Datos de proveedor informal
        proveedor_informal_nombre: tipo_movimiento === 'entrada' && tipo_proveedor === 'informal' 
          ? proveedor_informal_nombre 
          : undefined,
        proveedor_informal_cedula: tipo_movimiento === 'entrada' && tipo_proveedor === 'informal' 
          ? proveedor_informal_cedula 
          : undefined,
      };

      const response = await createInventoryMovement(dataToSend);
      
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

  const esEntrada = formData.tipo_movimiento === 'entrada';
  const esMovimientoInterno = ['salida', 'ajuste'].includes(formData.tipo_movimiento);
  const esProveedorFormal = formData.tipo_proveedor === 'formal';

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
        label="Tipo de Movimiento"
        name="tipo_movimiento"
        value={formData.tipo_movimiento}
        onChange={handleChange}
        options={[
          { value: 'entrada', label: '🛒 Entrada (Compra)' },
          { value: 'salida', label: '📤 Salida (Uso Interno)' },
          { value: 'ajuste', label: '⚙️ Ajuste (Inventario Físico)' },
        ]}
        required
      />

      {/* Alerta informativa */}
      {esEntrada && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start">
            <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">📋 Compra a Proveedor</p>
              <p>
                Esta entrada se registrará como <strong>compra</strong> y aparecerá en el <strong>Reporte 606 de DGII</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {esMovimientoInterno && (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
          <div className="flex items-start">
            <Package className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-gray-800">
              <p className="font-semibold mb-1">📦 Movimiento Interno</p>
              <p>Este movimiento es para control interno y NO se registrará como compra.</p>
            </div>
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

      {/* CAMPOS DE COMPRA - Solo en entradas */}
      {esEntrada && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-green-900">
              Información de Compra (Reporte 606)
            </h3>
          </div>

          {/* Selector: Tipo de Proveedor */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo_proveedor: 'formal' }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                esProveedorFormal
                  ? 'border-green-500 bg-green-100'
                  : 'border-gray-300 bg-white hover:border-green-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className={`w-5 h-5 ${esProveedorFormal ? 'text-green-600' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className={`font-semibold text-sm ${esProveedorFormal ? 'text-green-900' : 'text-gray-700'}`}>
                    Proveedor Formal
                  </div>
                  <div className="text-xs text-gray-600">Con RNC registrado</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo_proveedor: 'informal' }))}
              className={`p-3 rounded-lg border-2 transition-all ${
                !esProveedorFormal
                  ? 'border-green-500 bg-green-100'
                  : 'border-gray-300 bg-white hover:border-green-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className={`w-5 h-5 ${!esProveedorFormal ? 'text-green-600' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className={`font-semibold text-sm ${!esProveedorFormal ? 'text-green-900' : 'text-gray-700'}`}>
                    Proveedor Informal
                  </div>
                  <div className="text-xs text-gray-600">Sin RNC (con cédula)</div>
                </div>
              </div>
            </button>
          </div>

          {/* Campos para proveedor FORMAL */}
          {esProveedorFormal && (
            <>
              <Select
                label="Proveedor"
                name="proveedor_id"
                value={formData.proveedor_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Seleccione un proveedor' },
                  ...suppliers.map(s => ({
                    value: String(s.id),
                    label: `${s.codigo_proveedor} - ${s.nombre_comercial} (RNC: ${s.numero_identificacion})`,
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

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <strong>NCF B01/B02:</strong> El proveedor debe entregarte la factura con NCF válido.
                </p>
              </div>
            </>
          )}

          {/* Campos para proveedor INFORMAL */}
          {!esProveedorFormal && (
            <>
              <Input
                label="Nombre Completo del Proveedor"
                name="proveedor_informal_nombre"
                value={formData.proveedor_informal_nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
              />

              <Input
                label="Cédula del Proveedor"
                name="proveedor_informal_cedula"
                value={formData.proveedor_informal_cedula}
                onChange={handleChange}
                placeholder="402-1234567-8"
                maxLength={13}
                required
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 space-y-2">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ NCF E41 (Proveedores Informales):</strong>
                </p>
                <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
                  <li>El sistema generará automáticamente el NCF E41</li>
                  <li>Se aplicarán las retenciones de ITBIS e ISR según normativa</li>
                  <li>Esta compra será deducible y aparecerá en el Reporte 606</li>
                </ul>
              </div>
            </>
          )}

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
        label={esEntrada ? 'Costo Unitario (Requerido)' : 'Costo Unitario (Opcional)'}
        name="costo_unitario"
        type="number"
        step="0.01"
        min="0"
        value={formData.costo_unitario}
        onChange={handleChange}
        placeholder="0.00"
        required={esEntrada}
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
          placeholder={
            esEntrada 
              ? 'Ej: Compra de materiales para proyecto X'
              : 'Describa el motivo de este movimiento...'
          }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : esEntrada ? 'Registrar Compra' : 'Registrar Movimiento'}
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

  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [productFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
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
      setError('Error al cargar datos.');
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
              { value: 'entrada', label: 'Entradas (Compras)' },
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando movimientos...</div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMovementBadge(movement.tipo_movimiento)}`}>
                          {movement.tipo_movimiento === 'entrada' ? 'COMPRA' : movement.tipo_movimiento.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{movement.product?.nombre}</div>
                        <div className="text-gray-500">{movement.product?.codigo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                      {movement.tipo_movimiento === 'entrada' && '+'}
                      {movement.tipo_movimiento === 'salida' && '-'}
                      {formatNumber(movement.cantidad)} {movement.product?.unidad_medida}
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