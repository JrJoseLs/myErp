// frontend/src/components/common/Table.jsx
import React from 'react';

const Table = ({ columns, data }) => {
    if (!data || data.length === 0) return <p className="mt-4 text-gray-600">No hay datos para mostrar.</p>;

    const getValue = (obj, accessor) => {
        // Soporte para accessor anidado (ej: 'category.nombre')
        return accessor.split('.').reduce((o, i) => (o ? o[i] : ''), obj);
    };

    return (
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    {column.render ? column.render(row) : getValue(row, column.accessor)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;