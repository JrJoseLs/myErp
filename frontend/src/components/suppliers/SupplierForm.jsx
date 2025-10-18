// frontend/src/components/suppliers/SupplierForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Building2, Phone, Mail, MapPin, User } from 'lucide-react';
import RNCValidator from './RNCValidator';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

const SupplierForm = ({ supplier, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    tipo_identificacion: 'RNC',
    numero_identificacion: '',
    nombre_comercial: '',
    razon_social: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    contacto_nombre: '',
    contacto_telefono: '',
    dias_pago: 30,
    notas: '',
  });

  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState(null);

  useEffect(() => {
    if (supplier) {
      setFormData({
        tipo_identificacion: supplier.tipo_identificacion || 'RNC',
        numero_identificacion: supplier.numero_identificacion || '',
        nombre_comercial: supplier.nombre_comercial || '',
        razon_social: supplier.razon_social || '',
        email: supplier.email || '',
        telefono: supplier.telefono || '',
        celular: supplier.celular || '',
        direccion: supplier.direccion || '',
        ciudad: supplier.ciudad || '',
        provincia: supplier.provincia || '',
        contacto_nombre: supplier.contacto_nombre || '',
        contacto_telefono: supplier.contacto_telefono || '',
        dias_pago: supplier.dias_pago || 30,
        notas: supplier.notas || '',
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRNCChange = (value) => {
    setFormData(prev => ({ ...prev, numero_identificacion: value }));
  };

  const handleValidationComplete = (validation) => {
    setValidationData(validation);
    
    // Auto-completar razón social si viene de DGII
    if (validation.valid && validation.razonSocial && !formData.razon_social) {
      setFormData(prev => ({
        ...prev,
        razon_social: validation.razonSocial,
        nombre_comercial: prev.nombre_comercial || validation.razonSocial,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const provincias = [
    'Azua', 'Baoruco', 'Barahona', 'Dajabón', 'Distrito Nacional',
    'Duarte', 'Elías Piña', 'El Seibo', 'Espaillat', 'Hato Mayor',
    'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana',
    'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi',
    'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná',
    'San Cristóbal', 'San José de Ocoa', 'San Juan', 'San Pedro de Macorís',
    'Sánchez Ramírez', 'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECCIÓN 1: IDENTIFICACIÓN */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center mb-4">
          <Building2 className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Identificación Fiscal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Identificación"
            name="tipo_identificacion"
            value={formData.tipo_identificacion}
            onChange={handleChange}
            options={[
              { value: 'RNC', label: 'RNC (Registro Nacional Contribuyente)' },
              { value: 'CEDULA', label: 'Cédula de Identidad' },
            ]}
            required
          />

          <RNCValidator
            value={formData.numero_identificacion}
            onChange={handleRNCChange}
            onValidationComplete={handleValidationComplete}
            tipoIdentificacion={formData.tipo_identificacion}
            label={formData.tipo_identificacion === 'RNC' ? 'RNC' : 'Cédula'}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Nombre Comercial"
            name="nombre_comercial"
            value={formData.nombre_comercial}
            onChange={handleChange}
            placeholder="Nombre del negocio"
            required
          />

          <Input
            label="Razón Social"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            placeholder="Nombre legal de la empresa"
          />
        </div>
      </div>

      {/* SECCIÓN 2: CONTACTO */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center mb-4">
          <Phone className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@empresa.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="809-555-1234"
            icon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Celular"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            placeholder="809-555-5678"
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* SECCIÓN 3: DIRECCIÓN */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Calle, número, sector"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Santo Domingo"
            />

            <Select
              label="Provincia"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              options={[
                { value: '', label: 'Seleccione una provincia' },
                ...provincias.map(p => ({ value: p, label: p }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: PERSONA DE CONTACTO */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Persona de Contacto</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Contacto"
            name="contacto_nombre"
            value={formData.contacto_nombre}
            onChange={handleChange}
            placeholder="Juan Pérez"
          />

          <Input
            label="Teléfono del Contacto"
            name="contacto_telefono"
            value={formData.contacto_telefono}
            onChange={handleChange}
            placeholder="809-555-9999"
          />
        </div>
      </div>

      {/* SECCIÓN 5: CONDICIONES COMERCIALES */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Días de Pago (Crédito)"
            name="dias_pago"
            type="number"
            min="0"
            value={formData.dias_pago}
            onChange={handleChange}
            placeholder="30"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              placeholder="Información adicional..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancelar</span>
        </Button>

        <Button
          type="submit"
          disabled={loading || (validationData && !validationData.valid)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Guardando...' : supplier ? 'Actualizar' : 'Guardar'}</span>
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;