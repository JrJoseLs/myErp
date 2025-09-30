// frontend/src/pages/Settings.jsx
import React from 'react';

const SettingsPage = () => {
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
                Configuración del Sistema
            </h2>
            <p className="text-gray-600">
                Gestión de usuarios, roles y permisos. 
                Solo accesible para Administradores.
            </p>
        </div>
    );
};

export default SettingsPage;
