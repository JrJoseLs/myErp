// frontend/src/components/purchases/PurchaseList.jsx
import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PurchaseList = ({ purchases }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              N° Compra
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Proveedor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              NCF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Fecha
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {purchases.map((purchase) => (
            <tr key={purchase.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {purchase.numero_compra}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {purchase.supplier?.nombre_comercial}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                {purchase.ncf_proveedor || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(purchase.fecha_compra)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                {formatCurrency(purchase.total)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  purchase.estado === 'recibida' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {purchase.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseList;