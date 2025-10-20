// frontend/src/pages/Suppliers.jsx - VERSIÓN COMPLETA Y FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, TrendingUp, Building2, AlertTriangle } from 'lucide-react';
import SupplierList from '../components/suppliers/SupplierList';
import SupplierForm from '../components/suppliers/SupplierForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Notification from '../components/common/Notification';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/supplierService';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, [searchTerm, filterActive]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchTerm || undefined,
        activo: filterActive || undefined,
      };

      const data = await getSuppliers(filters);
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      showNotification('Error al cargar proveedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleSave = async (supplierData) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        showNotification('✓ Proveedor actualizado exitosamente', 'success');
      } else {
        await createSupplier(supplierData);
        showNotification('✓ Proveedor creado exitosamente', 'success');
      }

      setShowModal(false);
      setEditingSupplier(null);
      loadSuppliers();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      showNotification(
        error.response?.data?.message || '✗ Error al guardar proveedor',
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este proveedor?')) {
      return;
    }

    try {
      await deleteSupplier(id);
      showNotification('✓ Proveedor eliminado exitosamente', 'success');
      loadSuppliers();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      showNotification('✗ Error al eliminar proveedor', 'error');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Código', 'Nombre Comercial', 'RNC/Cédula', 'Teléfono', 'Email', 'Ciudad', 'Estado'],
      ...suppliers.map(s => [
        s.codigo_proveedor,
        s.nombre_comercial,
        s.numero_identificacion,
        s.telefono || '',
        s.email || '',
        s.ciudad || '',
        s.activo ? 'Activo' : 'Inactivo',
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `proveedores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showNotification('✓ Archivo exportado exitosamente', 'success');
  };

  const stats = {
    total: suppliers.length,
    activos: suppliers.filter(s => s.activo).length,
    inactivos: suppliers.filter(s => !s.activo).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {notification.message && (
        <Notification message={notification.message} type={notification.type} />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Proveedores
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Administra tus proveedores con validación DGII automática
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Proveedor</span>
          </Button>
        </div>

        {/* Alerta Informativa */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">📋 Importante para Reporte 606 (DGII)</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Todos los proveedores deben tener <strong>RNC o Cédula válida</strong></li>
                <li>Al registrar compras, el <strong>NCF del proveedor es obligatorio</strong></li>
                <li>Esto asegura que las compras aparezcan correctamente en el Reporte 606</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Proveedores</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-indigo-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <Building2 className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactivos</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactivos}</p>
              </div>
              <Building2 className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RNC, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <Select
              label=""
              name="filterActive"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'true', label: 'Solo activos' },
                { value: 'false', label: 'Solo inactivos' },
              ]}
            />

            <Button
              onClick={handleExport}
              variant="secondary"
              className="flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Proveedores */}
      <SupplierList
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Modal de Formulario */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingSupplier(null);
          }}
          title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          size="large"
        >
          <SupplierForm
            supplier={editingSupplier}
            onSave={handleSave}
            onCancel={() => {
              setShowModal(false);
              setEditingSupplier(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default SuppliersPage;