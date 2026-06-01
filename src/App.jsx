import React, { useState, useEffect } from 'react';
import { Sun, Moon, Users, Clock, ArrowLeft, Plus } from 'lucide-react';
import { storageService } from './services/storage';
import Dashboard from './components/Dashboard';
import GroupDetail from './components/GroupDetail';

export default function App() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('Leo');
  const [theme, setTheme] = useState('dark');
  const [dashboardTab, setDashboardTab] = useState('groups'); // 'groups' | 'activity'

  // Cargar grupos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        const data = await storageService.getGroups();
        setGroups(data);
      } catch (err) {
        console.error('Error al cargar grupos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sincronizar tema con la clase del body
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
    const membersSet = new Set(['Leo']); // 'Leo' siempre existe por defecto
    groups.forEach(group => {
      group.members.forEach(m => membersSet.add(m));
    });
    return Array.from(membersSet);
  };

  const handleCreateGroup = async (groupData) => {
    setLoading(true);
    try {
      const newGroup = await storageService.saveGroup(groupData);
      const updatedGroups = await storageService.getGroups();
      setGroups(updatedGroups);
      setSelectedGroupId(newGroup.id); // Ir directo al grupo creado
    } catch (err) {
      console.error(err);
      alert('Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    setLoading(true);
    try {
      await storageService.deleteGroup(groupId);
      const updatedGroups = await storageService.getGroups();
      setGroups(updatedGroups);
      setSelectedGroupId(null); // Volver al dashboard
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async (groupId, expenseData) => {
    setLoading(true);
    try {
      await storageService.saveExpense(groupId, expenseData);
      const updatedGroups = await storageService.getGroups();
      setGroups(updatedGroups);
    } catch (err) {
      console.error(err);
      alert('Error al registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (groupId, expenseId) => {
    setLoading(true);
    try {
      await storageService.deleteExpense(groupId, expenseId);
      const updatedGroups = await storageService.getGroups();
      setGroups(updatedGroups);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
    // Ordenar de más nuevo a más viejo
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
          {/* Selector de Perspectiva (currentUser) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--panel-border)', padding: '4px 8px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Ver como:</span>
            <select
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
            >
              {allUniqueMembers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Selector de Tema */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="app-content">
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
            />
          ) : (
            dashboardTab === 'groups' ? (
              <Dashboard 
                groups={groups}
                onSelectGroup={setSelectedGroupId}
                onCreateGroup={handleCreateGroup}
                onDeleteGroup={handleDeleteGroup}
                currentUser={currentUser}
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
