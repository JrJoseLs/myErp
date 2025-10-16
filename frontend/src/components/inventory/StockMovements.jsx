// frontend/src/components/inventory/StockMovements.jsx - MEJORADO PARA REPORTE 606 (CORREGIDO)

import React, { useState, useEffect } from 'react';
import {
  getInventoryMovements,
  createInventoryMovement,
} from '../../services/inventoryService';
import { createPurchaseWithMovement } from '../../services/purchaseService';
import { getProducts } from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';
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

// Función auxiliar para validar el NCF (puede ser más rigurosa)
const isValidNCF = ncf => {
  // Implementación básica: verifica que no esté vacío y que tenga un formato típico (e.g., B0100000001, 11 dígitos para BXX)
  return ncf && ncf.trim().length >= 11;
};

const MovementForm = ({ products, suppliers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo_movimiento: 'entrada',
    cantidad: '',
    costo_unitario: '',
    proveedor_id: '',
    ncf_proveedor: '',
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
      proveedor_id,
      ncf_proveedor,
      documento_referencia,
      motivo,
    } = formData;

    // --- Validación de Datos ---
    const parsedCantidad = parseInt(cantidad, 10);
    const parsedCosto = costo_unitario ? parseFloat(costo_unitario) : undefined;

    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      setError('La cantidad debe ser un número positivo.');
      setLoading(false);
      return;
    }

    if (tipo_movimiento === 'entrada' && proveedor_id) {
      if (!parsedCosto || isNaN(parsedCosto) || parsedCosto < 0) {
        setError('El costo unitario es requerido para entradas de proveedor.');
        setLoading(false);
        return;
      }
      if (!isValidNCF(ncf_proveedor)) {
        setError(
          'El NCF del proveedor es obligatorio y debe tener un formato válido si selecciona un proveedor.'
        );
        setLoading(false);
        return;
      }
    }

    // Si es salida, la cantidad debe ser positiva, pero la lógica de negocio debe manejar si es suficiente stock
    // Aquí solo nos aseguramos de que sea un número positivo.

    try {
      const dataToSend = {
        producto_id: parseInt(producto_id, 10), // Usamos parseInt con base 10
        tipo_movimiento: tipo_movimiento,
        cantidad: parsedCantidad, // Corregido: Siempre enviar el costo si existe, pero es obligatorio solo en entradas con proveedor
        costo_unitario: parsedCosto,
        documento_referencia: documento_referencia,
        motivo: motivo,
      }; // ✅ Lógica de Compra (Reporte 606)

      if (tipo_movimiento === 'entrada' && proveedor_id && ncf_proveedor) {
        // Corregido: Si hay proveedor, el costo unitario debe estar definido, ya validado arriba.
        dataToSend.proveedor_id = parseInt(proveedor_id, 10);
        dataToSend.ncf_proveedor = ncf_proveedor.trim();
        await createPurchaseWithMovement(dataToSend);
      } else {
        // Si no es compra, eliminamos proveedor_id y ncf_proveedor para no causar errores en la API de movimiento normal
        if (dataToSend.proveedor_id) delete dataToSend.proveedor_id;
        if (dataToSend.ncf_proveedor) delete dataToSend.ncf_proveedor; // Si no, solo crear movimiento de inventario normal

        await createInventoryMovement(dataToSend);
      }

      onSave();
    } catch (err) {
      console.error('Error al crear movimiento:', err); // Mejorar el manejo de errores de validación de la API si es posible
      setError(
        err.response?.data?.message ||
          'Error al registrar el movimiento. Verifica los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isEntrada = formData.tipo_movimiento === 'entrada';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Notification type="error" message={error} />}     {' '}
      {/* Alerta informativa para entradas */}     {' '}
      {isEntrada && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                   {' '}
          <div className="flex items-start">
                       {' '}
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                       {' '}
            <div className="text-sm text-blue-800">
                           {' '}
              <p className="font-semibold mb-1">
                💡 Importante para Reporte 606
              </p>
                           {' '}
              <p>
                Si esta entrada es de un <strong>proveedor con factura</strong>,
                selecciona el Proveedor, introduce el NCF y el Costo Unitario
                para que se registre como una compra.
              </p>
                         {' '}
            </div>
                     {' '}
          </div>
                 {' '}
        </div>
      )}
           {' '}
      <Select
        label="Producto"
        name="producto_id"
        value={formData.producto_id}
        onChange={handleChange}
        options={[
          { value: '', label: 'Seleccione un producto' },
          ...products.map(p => ({
            // Asegurarse de que el `value` es STRING
            value: String(p.id),
            label: `${p.codigo} - ${p.nombre} (Stock: ${p.stock_actual || 0})`,
          })),
        ]}
        required
      />
           {' '}
      <Select
        label="Tipo de Movimiento"
        name="tipo_movimiento"
        value={formData.tipo_movimiento}
        onChange={handleChange}
        options={[
          { value: 'entrada', label: '📦 Entrada (Aumentar Stock)' },
          { value: 'salida', label: '📤 Salida (Disminuir Stock)' }, // Cambiar 'ajuste' por algo más claro para el usuario si es "Establecer Stock"
          {
            value: 'ajuste',
            label: '⚙️ Ajuste (Stock Manual/Inventario Físico)',
          },
        ]}
        required
      />
           {' '}
      <Input
        label="Cantidad"
        name="cantidad"
        type="number" // min para evitar números negativos
        min="1"
        value={formData.cantidad}
        onChange={handleChange}
        required
      />
            {/* ✅ CAMPOS NUEVOS PARA COMPRAS (solo si es ENTRADA) */}     {' '}
      {isEntrada && (
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                   {' '}
          <h4 className="font-semibold text-green-900 text-sm mb-2">
                        📄 Información de Compra (Opcional)          {' '}
          </h4>
                   {' '}
          <Select
            label="Proveedor"
            name="proveedor_id"
            value={formData.proveedor_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Sin proveedor (entrada interna/ajuste)' },
              ...suppliers.map(s => ({
                // Asegurarse de que el `value` es STRING
                value: String(s.id),
                label: `${s.codigo_proveedor} - ${s.nombre_comercial}`,
              })),
            ]}
          />
                   {' '}
          <Input // Ahora es requerido (por el front) si se selecciona proveedor
            label={`NCF del Proveedor ${formData.proveedor_id ? '(Obligatorio)' : '(Opcional)'}`}
            name="ncf_proveedor"
            value={formData.ncf_proveedor}
            onChange={handleChange}
            placeholder="Ej: B0100000001" // Removido el 'required' de HTML para usar la validación JS personalizada
          />
                   {' '}
          <Input // Ahora es requerido (por el front) si se selecciona proveedor
            label={`Costo Unitario ${formData.proveedor_id ? '(Obligatorio)' : '(Opcional)'}`}
            name="costo_unitario"
            type="number"
            step="0.01"
            min="0" // El costo no puede ser negativo
            value={formData.costo_unitario}
            onChange={handleChange}
            placeholder="Precio de compra por unidad" // Removido el 'required' de HTML para usar la validación JS personalizada
          />
                 {' '}
        </div>
      )}
      {/* Corregido: Mostrar Costo Unitario en Salida/Ajuste también si es relevante para el kardex */}
      {/* Si es Salida/Ajuste, el costo_unitario es opcional y solo se usa para el registro interno del Kardex */}
      {!isEntrada && (
        <Input
          label="Costo Unitario (Opcional, para Kardex)"
          name="costo_unitario"
          type="number"
          step="0.01"
          min="0"
          value={formData.costo_unitario}
          onChange={handleChange}
          placeholder="Costo por unidad (para valorizar)"
        />
      )}
           {' '}
      <Input
        label="Documento de Referencia"
        name="documento_referencia"
        value={formData.documento_referencia}
        onChange={handleChange}
        placeholder="Ej: OC-001, Factura-123"
      />
           {' '}
      <div>
               {' '}
        <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo <span className="text-red-500">*</span>       {' '}
        </label>
               {' '}
        <textarea
          name="motivo"
          value={formData.motivo}
          onChange={handleChange}
          rows={3}
          required
          placeholder="Describa el motivo de este movimiento..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
             {' '}
      </div>
           {' '}
      <div className="flex justify-end space-x-3 pt-4 border-t">
               {' '}
        <Button type="button" onClick={onCancel} variant="secondary">
                    Cancelar        {' '}
        </Button>
               {' '}
        <Button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Movimiento'}     
           {' '}
        </Button>
             {' '}
      </div>
         {' '}
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
  const [showModal, setShowModal] = useState(false); // Filtros

  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // Corregido: useEffect solo debe depender de los filtros si se usa un botón de "buscar",
  // pero para recarga automática, la dependencia de los filtros está bien.

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
          tipo_movimiento: typeFilter || undefined, // Limitar la carga de movimientos es una buena práctica
          limit: 50,
        }), // Solo cargar productos y proveedores si no están ya cargados, o siempre para tener la data más reciente
        getProducts({ activo: true }),
        getSuppliers({ activo: true }),
      ]); // Corregido: asegurar que los datos no son null antes de intentar acceder a .data o .products

      setMovements(movementsData?.data || []);
      setProducts(productsData?.products || []);
      setSuppliers(suppliersData?.suppliers || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los movimientos, productos o proveedores.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovementSaved = () => {
    setShowModal(false);
    setSuccess('✓ Movimiento registrado exitosamente');
    setTimeout(() => setSuccess(null), 3000); // Se llama loadData para refrescar la lista de movimientos
    loadData();
  }; // ... Resto del componente StockMovements (sin cambios necesarios en lógica visual)

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
            {error && <Notification type="error" message={error} />}     {' '}
      {success && <Notification type="success" message={success} />}     {' '}
      {/* Filtros y Acciones */}     {' '}
      <div className="bg-white rounded-lg shadow-md p-4">
               {' '}
        <div className="grid grid-cols-3 gap-4">
                   {' '}
          <Select
            label="Filtrar por Producto"
            name="product"
            value={productFilter}
            onChange={e => setProductFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los productos' }, // Corregido: Asegurar que el value es string
              ...products.map(p => ({
                value: String(p.id),
                label: `${p.codigo} - ${p.nombre}`,
              })),
            ]}
          />
                   {' '}
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
                   {' '}
          <div className="flex items-end">
                       {' '}
            <Button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center space-x-2"
            >
                            <Plus className="w-5 h-5" />             {' '}
              <span>Nuevo Movimiento</span>           {' '}
            </Button>
                     {' '}
          </div>
                 {' '}
        </div>
             {' '}
      </div>
            {/* Tabla de Movimientos */}     {' '}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
               {' '}
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando movimientos...
          </div>
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron movimientos
          </div>
        ) : (
          <div className="overflow-x-auto">
                       {' '}
            <table className="min-w-full divide-y divide-gray-200">
                           {' '}
              <thead className="bg-gray-50">
                               {' '}
                <tr>
                                   {' '}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Fecha                  {' '}
                  </th>
                                   {' '}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tipo                  {' '}
                  </th>
                                   {' '}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Producto                  {' '}
                  </th>
                                   {' '}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Cantidad                  {' '}
                  </th>
                                   {' '}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Motivo                  {' '}
                  </th>
                                   {' '}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Usuario                  {' '}
                  </th>
                                 {' '}
                </tr>
                             {' '}
              </thead>
                           {' '}
              <tbody className="bg-white divide-y divide-gray-200">
                               {' '}
                {movements.map(movement => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                                       {' '}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                           {' '}
                      {formatDateTime(movement.fecha_movimiento)}               
                         {' '}
                    </td>
                                       {' '}
                    <td className="px-6 py-4 whitespace-nowrap">
                                           {' '}
                      <div className="flex items-center space-x-2">
                                               {' '}
                        {getMovementIcon(movement.tipo_movimiento)}             
                                 {' '}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getMovementBadge(movement.tipo_movimiento)}`}
                        >
                                                   {' '}
                          {movement.tipo_movimiento.toUpperCase()}             
                                   {' '}
                        </span>
                                             {' '}
                      </div>
                                         {' '}
                    </td>
                                       {' '}
                    <td className="px-6 py-4 text-sm text-gray-900">
                                           {' '}
                      <div>
                                               {' '}
                        <div className="font-medium">
                          {movement.product?.nombre}
                        </div>
                                               {' '}
                        <div className="text-gray-500">
                          {movement.product?.codigo}
                        </div>
                                             {' '}
                      </div>
                                         {' '}
                    </td>
                                       {' '}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                                           {' '}
                      {movement.tipo_movimiento === 'entrada' && '+'}           
                                {movement.tipo_movimiento === 'salida' && '-'} 
                                          {formatNumber(movement.cantidad)}{' '}
                      {movement.product?.unidad_medida}                   {' '}
                    </td>
                                       {' '}
                    <td className="px-6 py-4 text-sm text-gray-500">
                                           {' '}
                      <div className="max-w-xs truncate">{movement.motivo}</div>
                                         {' '}
                    </td>
                                       {' '}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                           {' '}
                      {movement.user?.nombre_completo || 'N/A'}                 
                       {' '}
                    </td>
                                     {' '}
                  </tr>
                ))}
                             {' '}
              </tbody>
                         {' '}
            </table>
                     {' '}
          </div>
        )}
             {' '}
      </div>
            {/* Modal de Formulario */}     {' '}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Registrar Movimiento de Inventario"
        >
                   {' '}
          <MovementForm
            products={products}
            suppliers={suppliers}
            onSave={handleMovementSaved}
            onCancel={() => setShowModal(false)}
          />
                 {' '}
        </Modal>
      )}
         {' '}
    </div>
  );
};

export default StockMovements;
