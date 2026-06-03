import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // Registro
        const fullName = (firstName.trim() + ' ' + lastName.trim()).trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0]
            }
          }
        });

        if (error) throw error;
        
        // Supabase requiere confirmación de email por defecto.
        // Si no está habilitado, el usuario inicia sesión automáticamente.
        if (data?.user && data?.session === null) {
          alert('¡Registro exitoso! Por favor verifica tu casilla de correo electrónico para confirmar tu cuenta.');
        }
      } else {
        // Inicio de sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      setErrorMsg(error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Cabecera de bienvenida */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px 0', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GastamosPorIgual 💸
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Creá tu cuenta gratis y empezá a dividir' : 'Iniciá sesión para sincronizar tus gastos'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="glass-panel" style={{ background: 'var(--red-bg)', borderColor: 'rgba(244, 63, 94, 0.2)', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ color: 'var(--red-text)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--red-text)', fontWeight: 500 }}>
              {errorMsg === 'Email not confirmed' ? 'Por favor confirma tu email haciendo click en el enlace enviado.' : errorMsg}
            </span>
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nombre (solo en Registro) */}
          {isSignUp && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre (obligatorio)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nombre" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Apellido (opcional)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Apellido" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                placeholder="nombre@ejemplo.com" 
                className="input-field" 
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="input-field" 
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón de Enviar */}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : isSignUp ? (
              <>
                <UserPlus size={18} /> Crear Cuenta
              </>
            ) : (
              <>
                <LogIn size={18} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }} />
          <span>o continuá con</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--panel-border)' }} />
        </div>

        {/* Login con Google */}
        <button 
          type="button" 
          className="btn btn-secondary" 
          style={{ width: '100%', gap: '10px' }} 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </button>

        {/* Toggle Login/Sign Up */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? '¿Ya tenés una cuenta?' : '¿No tenés una cuenta todavía?'}
          </span>{' '}
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Iniciá Sesión' : 'Registrate gratis'}
          </button>
        </div>

      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
