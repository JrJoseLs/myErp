// frontend/src/pages/Customers.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getCustomers, 
  toggleCustomerStatus,
  generateCustomerCode 
} from '../services/customerService';
import { formatCurrency } from '../utils/formatters';
import { Users, Search, Plus, Edit, LogOut, CreditCard, DollarSign } from 'lucide-react';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Notification from '../components/common/Notification';
import CustomerForm from '../components/customers/CustomerForm';

const CustomersPage = () => {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('true');
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [search, tipoFilter, statusFilter]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: search || undefined,
        tipo_cliente: tipoFilter || undefined,
        activo: statusFilter || undefined,
      };
      
      const data = await getCustomers(filters);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const codeData = await generateCustomerCode();
      setSelectedCustomer({ codigo_cliente: codeData.codigo });
      setShowModal(true);
    } catch (err) {
      setError('Error al generar código de cliente');
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCustomerSaved = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setSuccess('Cliente guardado exitosamente');
    setTimeout(() => setSuccess(null), 3000);
    loadCustomers();
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCustomerStatus(id);
      setSuccess('Estado del cliente actualizado');
      setTimeout(() => setSuccess(null), 3000);
      loadCustomers();
    } catch (err) {
      setError('Error al cambiar estado del cliente');
    }
  };

  const getTipoClienteBadge = (tipo) => {
    const badges = {
      contado: 'bg-green-100 text-green-800',
      credito: 'bg-blue-100 text-blue-800',
      ambos: 'bg-purple-100 text-purple-800',
    };
    return badges[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoIdentificacionBadge = (tipo) => {
    const badges = {
      RNC: 'bg-indigo-100 text-indigo-800',
      CEDULA: 'bg-yellow-100 text-yellow-800',
      PASAPORTE: 'bg-pink-100 text-pink-800',
    };
    return badges[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.nombre_completo}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
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

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          
          <Select
            label=""
            name="tipo"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'contado', label: 'Contado' },
              { value: 'credito', label: 'Crédito' },
              { value: 'ambos', label: 'Ambos' }
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
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={handleCreateCustomer} className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nuevo Cliente</span>
          </Button>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando clientes...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron clientes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.codigo_cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.nombre_comercial}</div>
                        <div className="text-sm text-gray-500">{customer.razon_social}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoIdentificacionBadge(customer.tipo_identificacion)}`}>
                          {customer.tipo_identificacion}
                        </span>
                        <div className="text-sm text-gray-900 mt-1">{customer.numero_identificacion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{customer.telefono || 'N/A'}</div>
                      <div>{customer.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoClienteBadge(customer.tipo_cliente)}`}>
                        {customer.tipo_cliente.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className={`font-semibold ${customer.balance_actual > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(customer.balance_actual)}
                      </div>
                      {customer.limite_credito > 0 && (
                        <div className="text-xs text-gray-500">
                          Límite: {formatCurrency(customer.limite_credito)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStatus(customer.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedCustomer?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        >
          <CustomerForm
            customer={selectedCustomer}
            onSave={handleCustomerSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;