import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import RegistroForm from './components/RegistroForm';
import Estadisticas from './components/Estadisticas';
import Login from './components/Login';
import { Layout, PlusCircle, BarChart3, Heart, LogOut, User as UserIcon, CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addRegistro, subscribeToRegistros, updateRegistro, deleteRegistro } from './services/firestoreService';

function App() {
  const [registros, setRegistros] = useState([]);
  const [activeTab, setActiveTab] = useState('registro');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingRegistro, setEditingRegistro] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Cargar datos locales solo si no hay usuario (Demo)
  const [localRegistros, setLocalRegistros] = useLocalStorage('tcc-registros', []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // Solo actualizamos si no estamos en modo demo
      // Si hay un usuario real de Firebase, lo preferimos
      if (currentUser) {
        setUser(currentUser);
      } else if (!user?.isDemo) {
        // Si no hay usuario de Firebase y no estamos en demo, el usuario es null
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []); // El array vacío asegura que solo se registre el listener una vez

  // Suscripción a Firestore cuando hay usuario real
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    if (user && !user.isDemo) {
      unsubscribeFirestore = subscribeToRegistros(user.uid, (data) => {
        // Firestore ya viene ordenado por createdAt desc
        setRegistros(data);
      });
    } else if (user?.isDemo) {
      // Ordenar Demo por ID (Date.now()) descendente para que los nuevos salgan arriba
      const sortedLocal = [...localRegistros].sort((a, b) => b.id - a.id);
      setRegistros(sortedLocal);
    } else {
      setRegistros([]);
    }

    return () => unsubscribeFirestore();
  }, [user, localRegistros]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    showToast(`¡Bienvenido, ${userData.displayName || 'Usuario'}!`);
  };

  const showToast = (message, type = 'success') => {
    console.log(`[Toast] ${type}: ${message}`);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type, removing: false });
    
    // Iniciar desaparición a los 3s
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => prev ? { ...prev, removing: true } : null);
      
      // Eliminar del DOM después de la animación de salida (0.3s)
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 300);
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRegistros([]); // Limpiar registros al cerrar sesión
      setEditingRegistro(null);
      setActiveTab('registro');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleEditRequest = (registro) => {
    setEditingRegistro(registro);
    setActiveTab('registro');
  };

  const handleDeleteRegistro = async (registroId) => {
    console.log("Intentando eliminar registro con ID:", registroId);
    if (!registroId) {
      showToast('Error: No se encontró el ID del registro', 'error');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    
    // Actualización optimista: lo quitamos de la UI inmediatamente
    const originalRegistros = [...registros];
    setRegistros(prev => prev.filter(r => String(r.id) !== String(registroId)));

    try {
      if (user && !user.isDemo) {
        console.log("Eliminando de Firestore...");
        await deleteRegistro(registroId); // Using the service function
      } else {
        console.log("Eliminando de LocalStorage...");
        const nuevosLocal = localRegistros.filter(r => String(r.id) !== String(registroId));
        setLocalRegistros(nuevosLocal);
      }
      showToast('Registro eliminado con éxito');
    } catch (error) {
      console.error("Error al eliminar:", error);
      // Revertir si falla
      setRegistros(originalRegistros);
      showToast('Error al eliminar: ' + (error.message || 'Error desconocido'), 'error');
    }
  };

  const handleSaveRegistro = async (nuevoRegistro) => {
    console.log("Iniciando guardado de registro...", { isDemo: user?.isDemo, isEditing: !!editingRegistro });
    try {
      const isEditing = !!editingRegistro;
      
      if (user && !user.isDemo) {
        console.log("Guardando en Firestore...");
        const { id: _, ...dataToSave } = nuevoRegistro;
        if (editingRegistro) {
          await updateRegistro(editingRegistro.id, dataToSave);
        } else {
          await addRegistro(user.uid, dataToSave);
        }
      } else {
        console.log("Guardando en LocalStorage (Modo Demo)...");
        if (editingRegistro) {
          setLocalRegistros(localRegistros.map(r => String(r.id) === String(editingRegistro.id) ? { ...nuevoRegistro, id: editingRegistro.id } : r));
        } else {
          setLocalRegistros([...localRegistros, { ...nuevoRegistro, id: Date.now() }]);
        }
      }
      
      setEditingRegistro(null);
      console.log("Llamando a showToast...");
      showToast(isEditing ? 'Registro actualizado correctamente' : 'Registro guardado correctamente');
      
      setTimeout(() => {
        console.log("Cambiando pestaña a estadisticas.");
        setActiveTab('estadisticas');
      }, 100);
    } catch (error) {
      console.error("Error al guardar:", error);
      showToast('Error al guardar: ' + (error.message || 'Error desconocido'), 'error');
    }
  };

  const handleExportData = () => {
    try {
      if (registros.length === 0) {
        showToast("No hay datos para exportar.", "warning");
        return;
      }
      
      const dataStr = JSON.stringify(registros, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `mentesana-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error al exportar:", error);
      showToast("Error al exportar los datos.", "error");
    }
  };

  const handleImportData = async (jsonData) => {
    try {
      // Validación básica
      if (!Array.isArray(jsonData)) {
        throw new Error("El archivo no contiene un formato válido.");
      }

      const confirmImport = window.confirm(`Se van a importar ${jsonData.length} registros. ¿Deseas continuar?`);
      if (!confirmImport) return;

      if (user && !user.isDemo) {
        // Importar a Firestore (secuencialmente para mantener orden o evitar límites)
        for (const item of jsonData) {
          // Limpiamos el ID original para que Firestore genere uno nuevo
          const { id, ...dataToSave } = item;
          await addRegistro(user.uid, dataToSave);
        }
      } else {
        // Importar a LocalStorage
        const nuevosRegistros = jsonData.map(item => ({
          ...item,
          id: item.id || Date.now() + Math.random()
        }));
        setLocalRegistros([...localRegistros, ...nuevosRegistros]);
      }
      
      showToast("Datos importados con éxito.");
    } catch (error) {
      console.error("Error al importar:", error);
      showToast("Error al importar los datos: " + error.message, "error");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <p style={{ color: 'var(--accent-primary)' }}>Cargando...</p>
        </div>
      );
    }

    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />;
    }

    return (
      <div className="container">
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={32} fill="var(--accent-primary)" strokeWidth={0} />
                MenteSana
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Auto-registro TCC Personal</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <nav style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className={`btn ${activeTab === 'registro' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('registro')}
              >
                <PlusCircle size={20} />
                <span className="nav-text">Registro</span>
              </button>
              <button 
                className={`btn ${activeTab === 'estadisticas' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('estadisticas')}
              >
                <BarChart3 size={20} />
                <span className="nav-text">Estadísticas</span>
              </button>
            </nav>
            
            <div style={{ height: '30px', width: '1px', backgroundColor: 'var(--border)' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right', display: 'none' }} className="user-info">
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user.displayName || 'Usuario'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={20} />
                </div>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main>
          {activeTab === 'registro' ? (
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <RegistroForm 
                onSave={handleSaveRegistro} 
                editingRegistro={editingRegistro}
                onCancelEdit={() => setEditingRegistro(null)}
              />
            </div>
          ) : (
            <Estadisticas 
              registros={registros} 
              onEdit={handleEditRequest}
              onDelete={handleDeleteRegistro}
              onExport={handleExportData}
              onImport={handleImportData}
              showToast={showToast}
            />
          )}
        </main>

        <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <p>© {new Date().getFullYear()} MenteSana - Aplicación de Autorregistro TCC</p>
          <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
            "Lo que perturba a los hombres no son las cosas, sino el juicio que se hacen de ellas." - Epicteto
          </p>
        </footer>

        <style>{`
          @media (max-width: 768px) {
            .nav-text { display: none; }
            .btn { padding: 0.6rem; }
            .container { padding: 1rem; }
            header { flex-direction: column; gap: 1.5rem; }
            .user-info { display: none !important; }
          }
          @media (min-width: 1024px) {
            .user-info { display: block !important; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

    {/* Toast rendering fuera del container principal para evitar clipping */}
    {toast && (
      <div className="toast-container">
        {console.log("Rendering Toast UI component:", toast)}
        <div className={`toast ${toast.type} ${toast.removing ? 'removing' : ''}`}>
          {toast.type === 'error' ? <AlertCircle size={20} style={{ color: '#ef4444' }} /> : 
           toast.type === 'warning' ? <AlertCircle size={20} style={{ color: '#f59e0b' }} /> : 
           <CheckCircle2 size={20} style={{ color: '#10b981' }} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )}
  </>
  );
}

export default App;
