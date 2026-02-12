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
      if (!user?.isDemo) {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, [user]);

  // Suscripción a Firestore cuando hay usuario real
  useEffect(() => {
    let unsubscribeFirestore = () => {};

    if (user && !user.isDemo) {
      unsubscribeFirestore = subscribeToRegistros(user.uid, (data) => {
        setRegistros(data);
      });
    } else if (user?.isDemo) {
      setRegistros(localRegistros);
    } else {
      setRegistros([]);
    }

    return () => unsubscribeFirestore();
  }, [user, localRegistros]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const showToast = (message, type = 'success') => {
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
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    
    try {
      if (user && !user.isDemo) {
        await deleteRegistro(registroId);
      } else {
        setLocalRegistros(localRegistros.filter(r => r.id !== registroId));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      showToast('Error al eliminar el registro', 'error');
    }
  };

  const handleSaveRegistro = async (nuevoRegistro) => {
    try {
      if (user && !user.isDemo) {
        if (editingRegistro) {
          // Actualizar en Firestore
          await updateRegistro(editingRegistro.id, nuevoRegistro);
        } else {
          // Crear en Firestore
          await addRegistro(user.uid, nuevoRegistro);
        }
      } else {
        // Modo Demo (LocalStorage)
        if (editingRegistro) {
          setLocalRegistros(localRegistros.map(r => r.id === editingRegistro.id ? { ...nuevoRegistro, id: editingRegistro.id } : r));
        } else {
          setLocalRegistros([...localRegistros, { ...nuevoRegistro, id: Date.now() }]);
        }
      }
      
      const isEditing = !!editingRegistro;
      setEditingRegistro(null);
      showToast(isEditing ? 'Registro actualizado correctamente' : 'Registro guardado correctamente');
      setActiveTab('estadisticas');
    } catch (error) {
      console.error("Error al guardar:", error);
      showToast('Error al guardar el registro', 'error');
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
    <>
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

    {/* Toast rendering fuera del container principal para evitar clipping */}
    {toast && (
      <div className="toast-container">
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
