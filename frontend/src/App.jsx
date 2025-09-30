import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'; // Importamos useAuth

// IMPORTACIONES DE PÁGINAS (ajusta las rutas según tu estructura de archivos)
import LoginPage from './pages/Login.jsx';      
import DashboardPage from './pages/Dashboard.jsx'; 
import InventoryPage from './pages/Inventory.jsx'; 

// Componente Wrapper para rutas protegidas
const ProtectedRoute = ({ children }) => {
    // 💡 CAMBIO CLAVE: Usamos 'user' que es la fuente de verdad de la sesión
    const { user, loading } = useAuth(); 
    
    // Muestra pantalla de carga mientras se verifica el token/sesión en localStorage
    if (loading) {
        return <div className="flex justify-center items-center h-screen text-lg">Cargando sesión...</div>; 
    }
    
    // Si NO existe el objeto 'user' (es null), redirige al login
    if (!user) { 
        // Eliminamos la comprobación !isAuthenticated para usar directamente !user
        return <Navigate to="/login" replace />;
    }

    // Si el usuario existe (sesión válida), renderiza el contenido
    return children;
};

function App() {
  return (
    // 1. Router (BrowserRouter) debe envolver todo
    <Router> 
        {/* 2. AuthProvider va dentro del Router */}
        <AuthProvider> 
            <Routes>
                {/* Ruta Pública de Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas Protegidas */}
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                
                {/* Asegúrate de que tu ruta sea exactamente /inventory */}
                <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                
                {/* Si necesitas la ruta '/inventario' también, puedes añadirla o usar la que pusiste arriba. Usaremos '/inventory' por estándar. */}
                {/* <Route path="/inventario" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} /> */}
                
                {/* Ruta de fallback: cualquier otra ruta no definida va al dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    </Router>
  );
}

export default App;
