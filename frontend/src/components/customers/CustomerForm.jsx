// frontend/src/components/customers/CustomerForm.jsx

import React, { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../../services/customerService';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Notification from '../common/Notification';

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo_cliente: '',
    tipo_identificacion: 'CEDULA',
    numero_identificacion: '',
    nombre_comercial: '',
    razon_social: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    limite_credito: '0',
    dias_credito: '0',
    tipo_cliente: 'contado',
    notas: '',
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        codigo_cliente: customer.codigo_cliente || '',
        tipo_identificacion: customer.tipo_identificacion || 'CEDULA',
        numero_identificacion: customer.numero_identificacion || '',
        nombre_comercial: customer.nombre_comercial || '',
        razon_social: customer.razon_social || '',
        email: customer.email || '',
        telefono: customer.telefono || '',
        celular: customer.celular || '',
        direccion: customer.direccion || '',
        ciudad: customer.ciudad || '',
        provincia: customer.provincia || '',
        limite_credito: customer.limite_credito || '0',
        dias_credito: customer.dias_credito || '0',
        tipo_cliente: customer.tipo_cliente || 'contado',
        notas: customer.notas || '',
        activo: customer.activo !== undefined ? customer.activo : true,
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        limite_credito: parseFloat(formData.limite_credito) || 0,
        dias_credito: parseInt(formData.dias_credito) || 0,
      };

      if (customer?.id) {
        await updateCustomer(customer.id, dataToSend);
      } else {
        await createCustomer(dataToSend);
      }

      onSave();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      setError(err.response?.data?.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {error && <Notification type="error" message={error} />}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Código"
          name="codigo_cliente"
          value={formData.codigo_cliente}
          onChange={handleChange}
          required
          disabled={!!customer?.id}
        />
        <Select
          label="Tipo de Cliente"
          name="tipo_cliente"
          value={formData.tipo_cliente}
          onChange={handleChange}
          options={[
            { value: 'contado', label: 'Contado' },
            { value: 'credito', label: 'Crédito' },
            { value: 'ambos', label: 'Ambos' }
          ]}
          required
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Identificación</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo de Identificación"
            name="tipo_identificacion"
            value={formData.tipo_identificacion}
            onChange={handleChange}
            options={[
              { value: 'CEDULA', label: 'Cédula' },
              { value: 'RNC', label: 'RNC' },
              { value: 'PASAPORTE', label: 'Pasaporte' }
            ]}
            required
          />
          <Input
            label="Número de Identificación"
            name="numero_identificacion"
            value={formData.numero_identificacion}
            onChange={handleChange}
            required
            placeholder={formData.tipo_identificacion === 'CEDULA' ? '000-0000000-0' : '0-00-00000-0'}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Información General</h3>
        <div className="space-y-4">
          <Input
            label="Nombre Comercial"
            name="nombre_comercial"
            value={formData.nombre_comercial}
            onChange={handleChange}
            required
          />
          <Input
            label="Razón Social"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            placeholder="Si no especifica, se usará el nombre comercial"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Contacto</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="(809) 000-0000"
          />
          <Input
            label="Celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="(829) 000-0000"
          />
        </div>
        <div className="mt-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Dirección</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
            />
            <Input
              label="Provincia"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {formData.tipo_cliente !== 'contado' && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Condiciones de Crédito</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Límite de Crédito (RD$)"
              name="limite_credito"
              type="number"
              step="0.01"
              value={formData.limite_credito}
              onChange={handleChange}
            />
            <Input
              label="Días de Crédito"
              name="dias_credito"
              type="number"
              value={formData.dias_credito}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="Información adicional del cliente..."
        />
      </div>

      {customer?.id && (
        <div className="flex items-center space-x-2 border-t pt-4">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Cliente activo
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : customer?.id ? 'Actualizar' : 'Crear Cliente'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;