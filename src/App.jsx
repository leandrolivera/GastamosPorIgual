import React, { useState, useEffect } from 'react';
import { Sun, Moon, Users, Clock, ArrowLeft, Plus, LogOut } from 'lucide-react';
import { storageService } from './services/storage';
import { supabase } from './services/supabaseClient';
import Dashboard from './components/Dashboard';
import GroupDetail from './components/GroupDetail';
import Auth from './components/Auth';

export default function App() {
  const [session, setSession] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('Leo');
  const [theme, setTheme] = useState('dark');
  const [dashboardTab, setDashboardTab] = useState('groups');

  // 1. Escuchar el estado de autenticación de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setGroups([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Cargar grupos cuando cambia la sesión
  useEffect(() => {
    if (!session) return;
    
    // Obtener nombre del perfil de usuario (por defecto usa el email antes del @)
    const profileName = session.user.user_metadata.full_name || session.user.email.split('@')[0];
    setCurrentUser(profileName);

    async function loadData() {
      setLoading(true);
      try {
        const data = await storageService.getGroups(session.user.id, profileName, session.user.email);
        setGroups(data);
      } catch (err) {
        console.error('Error al cargar grupos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  // 3. Sincronizar tema con la clase del body
  useEffect(() => {
    const root = window.document.body;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  // Obtener lista completa de todos los nombres únicos de integrantes para el selector
  const getAllUniqueMembers = () => {
    const membersSet = new Set([currentUser]);
    groups.forEach(group => {
      group.members.forEach(m => membersSet.add(m));
    });
    return Array.from(membersSet);
  };

  const handleCreateGroup = async (groupData) => {
    if (!session) return;
    setLoading(true);
    try {
      const newGroup = await storageService.saveGroup(groupData, session.user.id, currentUser, session.user.email);
      const updatedGroups = await storageService.getGroups(session.user.id, currentUser, session.user.email);
      setGroups(updatedGroups);
      setSelectedGroupId(newGroup.id);
    } catch (err) {
      console.error(err);
      alert('Error al crear el grupo: ' + (err.message || err.details || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!session) return;
    setLoading(true);
    try {
      await storageService.deleteGroup(groupId);
      const updatedGroups = await storageService.getGroups(session.user.id, currentUser, session.user.email);
      setGroups(updatedGroups);
      setSelectedGroupId(null);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el grupo: ' + (err.message || err.details || err));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async (groupId, expenseData) => {
    if (!session) return;
    setLoading(true);
    try {
      await storageService.saveExpense(groupId, expenseData);
      const updatedGroups = await storageService.getGroups(session.user.id, currentUser, session.user.email);
      setGroups(updatedGroups);
    } catch (err) {
      console.error(err);
      alert('Error al registrar el gasto: ' + (err.message || err.details || err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (groupId, expenseId) => {
    if (!session) return;
    setLoading(true);
    try {
      await storageService.deleteExpense(groupId, expenseId);
      const updatedGroups = await storageService.getGroups(session.user.id, currentUser, session.user.email);
      setGroups(updatedGroups);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el gasto: ' + (err.message || err.details || err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      setLoading(true);
      await supabase.auth.signOut();
      setSelectedGroupId(null);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!session && !loading) {
    // Si no está autenticado, forzar el flujo de Auth
    return (
      <>
        <header className="app-header">
          <div className="logo-container">
            <span className="logo-text">GastamosPorIgual 💸</span>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="app-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Auth />
        </main>
      </>
    );
  }

  const activeGroup = groups.find(g => g.id === selectedGroupId);
  const allUniqueMembers = getAllUniqueMembers();

  // Recopilar los últimos 10 gastos de todos los grupos para la pestaña de Actividad
  const getAllRecentExpenses = () => {
    const allExpenses = [];
    groups.forEach(group => {
      group.expenses.forEach(exp => {
        allExpenses.push({
          ...exp,
          groupName: group.name,
          groupId: group.id
        });
      });
    });
    return allExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  return (
    <>
      {/* Cabecera Principal */}
      <header className="app-header">
        <div className="logo-container" onClick={() => setSelectedGroupId(null)} style={{ cursor: 'pointer' }}>
          <span className="logo-text">GastamosPorIgual 💸</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Selector de Tema */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Botón Cerrar Sesión */}
          <button className="theme-toggle" style={{ color: 'var(--red-text)' }} onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="app-content">
        {/* Mensaje de Bienvenida */}
        {!loading && session && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hola, {currentUser} 👋
            </span>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--panel-border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cargando datos...</span>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {!loading && (
          selectedGroupId && activeGroup ? (
            <GroupDetail 
              group={activeGroup}
              onBack={() => setSelectedGroupId(null)}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onDeleteGroup={handleDeleteGroup}
              currentUser={currentUser}
              currentUserId={session?.user?.id}
            />
          ) : (
            dashboardTab === 'groups' ? (
              <Dashboard 
                groups={groups}
                onSelectGroup={setSelectedGroupId}
                onCreateGroup={handleCreateGroup}
                onDeleteGroup={handleDeleteGroup}
                currentUser={currentUser}
                userEmail={session.user.email}
              />
            ) : (
              /* Pestaña de Actividad Reciente */
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Actividad Reciente</h3>
                {getAllRecentExpenses().length === 0 ? (
                  <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay gastos registrados en ningún grupo todavía.
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: 0 }}>
                    {getAllRecentExpenses().map(exp => (
                      <div 
                        key={exp.id} 
                        className="expense-item" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedGroupId(exp.groupId)}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <div className={`category-dot ${exp.category === 'liquidar' ? 'cat-varios' : 'cat-' + exp.category}`} style={{ width: '8px', height: '8px', flexShrink: 0 }} />
                          <div className="expense-meta" style={{ minWidth: 0 }}>
                            <span className="expense-desc" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {exp.description}
                            </span>
                            <span className="expense-sub">
                              En <b>{exp.groupName}</b> • por {exp.paidBy === currentUser ? 'Vos' : exp.paidBy}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>${exp.amount.toFixed(2)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{exp.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )
        )}
      </main>

      {/* Barra de Navegación Flotante Inferior (Solo visible en el Dashboard) */}
      {!selectedGroupId && (
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${dashboardTab === 'groups' ? 'active' : ''}`}
            onClick={() => setDashboardTab('groups')}
          >
            <Users size={20} />
            <span>Grupos</span>
          </button>
          
          <button 
            className={`nav-item ${dashboardTab === 'activity' ? 'active' : ''}`}
            onClick={() => setDashboardTab('activity')}
          >
            <Clock size={20} />
            <span>Actividad</span>
          </button>
        </nav>
      )}
    </>
  );
}
