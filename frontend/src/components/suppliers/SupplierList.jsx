// frontend/src/components/suppliers/SupplierList.jsx
import React from 'react';
import { Edit, Trash2, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';

const SupplierList = ({ suppliers, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando proveedores...</p>
      </div>
    );
  }

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay proveedores registrados
        </h3>
        <p className="text-gray-600">
          Comienza agregando tu primer proveedor para gestionar compras
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier) => (
        <div
          key={supplier.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
        >
          {/* Header Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 truncate">
                  {supplier.nombre_comercial}
                </h3>
                <p className="text-indigo-100 text-sm font-mono">
                  {supplier.codigo_proveedor}
                </p>
              </div>
              <div className={`
                p-1.5 rounded-full 
                ${supplier.activo 
                  ? 'bg-green-500 bg-opacity-20' 
                  : 'bg-red-500 bg-opacity-20'
                }
              `}>
                {supplier.activo ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          {/* Body Card */}
          <div className="p-4 space-y-3">
            {/* RNC/Cédula */}
            <div className="flex items-center text-sm">
              <div className="w-24 font-semibold text-gray-600">
                {supplier.tipo_identificacion}:
              </div>
              <div className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {supplier.numero_identificacion}
              </div>
            </div>

            {/* Razón Social */}
            {supplier.razon_social && supplier.razon_social !== supplier.nombre_comercial && (
              <div className="text-xs text-gray-600 italic truncate">
                {supplier.razon_social}
              </div>
            )}

            {/* Email */}
            {supplier.email && (
              <div className="flex items-center text-sm text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{supplier.email}</span>
              </div>
            )}

            {/* Teléfono */}
            {supplier.telefono && (
              <div className="flex items-center text-sm text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{supplier.telefono}</span>
              </div>
            )}

            {/* Ubicación */}
            {(supplier.ciudad || supplier.provincia) && (
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {supplier.ciudad}{supplier.ciudad && supplier.provincia && ', '}
                  {supplier.provincia}
                </span>
              </div>
            )}

            {/* Días de Pago */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Crédito:</span>
                <span className="font-semibold text-indigo-600">
                  {supplier.dias_pago} días
                </span>
              </div>
            </div>

            {/* Persona de Contacto */}
            {supplier.contacto_nombre && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Contacto:</p>
                <p className="text-sm font-medium text-gray-900">
                  {supplier.contacto_nombre}
                </p>
                {supplier.contacto_telefono && (
                  <p className="text-xs text-gray-600">
                    {supplier.contacto_telefono}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Card - Acciones */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
            <Button
              onClick={() => onEdit(supplier)}
              variant="secondary"
              className="flex items-center space-x-1 text-xs px-3 py-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </Button>

            <Button
              onClick={() => onDelete(supplier.id)}
              className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupplierList;