// frontend/src/pages/Sales.jsx
import React from 'react';

const SalesPage = () => {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
                Vista de Ventas
            </h2>
            <p className="text-gray-600">
                Aquí se gestionarán las órdenes de venta y facturación. 
                Esta vista solo es accesible para Administradores y Vendedores.
            </p>
        </div>
    );
};

export default SalesPage;
