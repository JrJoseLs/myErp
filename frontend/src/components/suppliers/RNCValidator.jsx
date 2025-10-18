// frontend/src/components/suppliers/RNCValidator.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const RNCValidator = ({ 
  value, 
  onChange, 
  onValidationComplete,
  tipoIdentificacion = 'RNC',
  label = 'RNC/Cédula',
  required = true 
}) => {
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Limpiar validación al cambiar el valor
    if (!value || value.length < 9) {
      setValidation(null);
      setError(null);
      return;
    }

    // Validar automáticamente cuando el RNC tiene la longitud correcta
    const timeoutId = setTimeout(() => {
      if (tipoIdentificacion === 'RNC' && (value.length === 9 || value.length === 11)) {
        validateRNC(value);
      } else if (tipoIdentificacion === 'CEDULA' && value.length === 11) {
        validateCedula(value);
      }
    }, 800); // Esperar 800ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [value, tipoIdentificacion]);

  const validateRNC = async (rnc) => {
    setValidating(true);
    setError(null);

    try {
      const { data } = await api.post('/dgii/validate-rnc', { rnc });
      
      setValidation(data.data);
      
      // Notificar al componente padre
      if (onValidationComplete && data.success) {
        onValidationComplete({
          valid: true,
          razonSocial: data.data.razon_social,
          estado: data.data.estado,
        });
      }
    } catch (err) {
      console.error('Error al validar RNC:', err);
      setError(err.response?.data?.message || 'Error al validar con DGII');
      setValidation({ valid: false, error: 'No se pudo validar' });
      
      if (onValidationComplete) {
        onValidationComplete({ valid: false });
      }
    } finally {
      setValidating(false);
    }
  };

  const validateCedula = async (cedula) => {
    setValidating(true);
    setError(null);

    try {
      const { data } = await api.post('/dgii/validate-cedula', { cedula });
      
      setValidation(data.data);
      
      if (onValidationComplete && data.success) {
        onValidationComplete({ valid: true });
      }
    } catch (err) {
      console.error('Error al validar cédula:', err);
      setError(err.response?.data?.message || 'Cédula inválida');
      setValidation({ valid: false });
      
      if (onValidationComplete) {
        onValidationComplete({ valid: false });
      }
    } finally {
      setValidating(false);
    }
  };

  const getStatusIcon = () => {
    if (validating) {
      return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    if (validation?.valid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (validation?.valid === false || error) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    return null;
  };

  const getStatusMessage = () => {
    if (validating) {
      return <span className="text-blue-600 text-sm">Validando con DGII...</span>;
    }
    
    if (validation?.valid && validation.razon_social) {
      return (
        <div className="text-sm">
          <span className="text-green-600 font-semibold">✓ Válido: </span>
          <span className="text-gray-700">{validation.razon_social}</span>
          {validation.estado && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
              {validation.estado}
            </span>
          )}
        </div>
      );
    }
    
    if (validation?.valid) {
      return <span className="text-green-600 text-sm font-semibold">✓ Formato válido</span>;
    }
    
    if (error) {
      return (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {error}
        </div>
      );
    }
    
    if (validation?.valid === false) {
      return <span className="text-red-600 text-sm">✗ No encontrado en DGII</span>;
    }
    
    return null;
  };

  const formatValue = (val) => {
    // Remover todo excepto números
    const cleaned = val.replace(/\D/g, '');
    
    // Formatear según el tipo
    if (tipoIdentificacion === 'RNC') {
      if (cleaned.length <= 9) {
        // Formato: 1-23-45678-9
        if (cleaned.length > 1) {
          return cleaned.slice(0, 1) + 
                 (cleaned.length > 1 ? '-' + cleaned.slice(1, 3) : '') +
                 (cleaned.length > 3 ? '-' + cleaned.slice(3, 8) : '') +
                 (cleaned.length > 8 ? '-' + cleaned.slice(8, 9) : '');
        }
        return cleaned;
      } else {
        // Cédula como RNC: 123-4567890-1
        return cleaned.slice(0, 3) + 
               (cleaned.length > 3 ? '-' + cleaned.slice(3, 10) : '') +
               (cleaned.length > 10 ? '-' + cleaned.slice(10, 11) : '');
      }
    } else {
      // Cédula: 123-4567890-1
      return cleaned.slice(0, 3) + 
             (cleaned.length > 3 ? '-' + cleaned.slice(3, 10) : '') +
             (cleaned.length > 10 ? '-' + cleaned.slice(10, 11) : '');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const formatted = formatValue(e.target.value);
            onChange(formatted);
          }}
          placeholder={tipoIdentificacion === 'RNC' ? '1-23-45678-9' : '123-4567890-1'}
          maxLength={tipoIdentificacion === 'RNC' ? 13 : 13}
          required={required}
          className={`
            w-full px-4 py-2.5 pr-12 border-2 rounded-lg 
            focus:ring-2 focus:outline-none transition-all
            ${validation?.valid 
              ? 'border-green-300 focus:border-green-500 focus:ring-green-200' 
              : validation?.valid === false || error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
            }
          `}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      
      {getStatusMessage()}
      
      <p className="text-xs text-gray-500">
        {tipoIdentificacion === 'RNC' 
          ? 'Ingresa el RNC sin guiones (será validado automáticamente con la DGII)'
          : 'Ingresa la cédula de 11 dígitos'
        }
      </p>
    </div>
  );
};

export default RNCValidator;