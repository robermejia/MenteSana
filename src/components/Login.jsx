import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { LogIn, Heart, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function Login({ onLoginSuccess, showToast, onImport }) {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess(result.user);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/unauthorized-domain') {
        showToast("Configuración de Firebase requerida. Por favor, verifica tus credenciales y dominios autorizados.", "error");
      } else if (error.code === 'auth/popup-closed-by-user') {
        showToast("Inicio de sesión cancelado.", "warning");
      } else {
        showToast("Ocurrió un error al intentar iniciar sesión.", "error");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Login simulado para que el usuario pueda probar el diseño sin credenciales
  const handleDemoLogin = () => {
    onLoginSuccess({
      displayName: "Usuario Demo",
      email: "demo@mentesana.com",
      photoURL: "https://ui-avatars.com/api/?name=Usuario+Demo",
      isDemo: true
    });
  };

  return (
    <div className="fade-in" style={{ 
      minHeight: '100dvh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ 
        maxWidth: '450px', 
        width: '100%', 
        textAlign: 'center',
        padding: '3rem 2rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: 'var(--accent-muted)', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Heart size={40} fill="var(--accent-primary)" strokeWidth={0} />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>MenteSana</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tu compañero personal de Terapia Cognitivo-Conductual</p>
        </div>

        <div style={{ marginBottom: '2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ShieldCheck size={24} color="var(--success)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>Privacidad total: Tus datos se guardan localmente.</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Zap size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>Identifica distorsiones cognitivas rápidamente.</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <BarChart3 size={24} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>Visualiza tus progresos con estadísticas.</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={handleGoogleLogin} 
            className="btn btn-primary" 
            disabled={isLoggingIn}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              backgroundColor: '#fff', 
              color: '#000', 
              border: '1px solid #ddd',
              opacity: isLoggingIn ? 0.7 : 1,
              cursor: isLoggingIn ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoggingIn ? (
              "Iniciando sesión..."
            ) : (
              <>
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  style={{ width: '18px', marginRight: '10px' }} 
                />
                Continuar con Google
              </>
            )}
          </button>
          
          <button 
            onClick={handleDemoLogin} 
            className="btn btn-secondary" 
            style={{ width: '100%', opacity: 0.8 }}
          >
            Entrar como Demo (Sin Google)
          </button>

          <div style={{ position: 'relative', width: '100%' }}>
            <button 
              onClick={() => document.getElementById('import-input-login').click()} 
              className="btn" 
              style={{ 
                width: '100%', 
                backgroundColor: 'transparent', 
                border: '1px dashed var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              <LogIn size={14} />
              Importar copia (.json)
            </button>
            <input 
              id="import-input-login"
              type="file" 
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const json = JSON.parse(event.target.result);
                      onImport(json);
                    } catch (err) {
                      showToast("Error al leer el archivo JSON: " + err.message, "error");
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </div>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Al iniciar sesión, aceptas usar esta herramienta exclusivamente para fines personales y de autorreflexión.
        </p>
      </div>
    </div>
  );
}
