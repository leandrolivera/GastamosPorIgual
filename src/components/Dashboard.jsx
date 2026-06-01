import React, { useState } from 'react';
import { Plus, Users, Trash2, ArrowRight, DollarSign, Calendar, ChevronRight, X, User } from 'lucide-react';
import { calculateBalancesAndDebts } from '../utils/debtSimplifier';

export default function Dashboard({ groups, onSelectGroup, onCreateGroup, onDeleteGroup, currentUser }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [membersList, setMembersList] = useState(['Leo']); // 'Leo' por defecto

  // Calcular balances acumulados de currentUser
  let totalOwedToMe = 0;
  let totalIOwe = 0;

  groups.forEach(group => {
    const { balances } = calculateBalancesAndDebts(group.members, group.expenses);
    const userBalance = balances[currentUser] || 0;
    if (userBalance > 0) {
      totalOwedToMe += userBalance;
    } else if (userBalance < 0) {
      totalIOwe += Math.abs(userBalance);
    }
  });

  const netBalance = totalOwedToMe - totalIOwe;

  const handleAddMember = (e) => {
    e.preventDefault();
    const name = memberInput.trim();
    if (!name) return;
    if (membersList.includes(name)) {
      alert('Este integrante ya fue agregado.');
      return;
    }
    setMembersList([...membersList, name]);
    setMemberInput('');
  };

  const handleRemoveMember = (nameToRemove) => {
    setMembersList(membersList.filter(name => name !== nameToRemove));
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Por favor ingresa un nombre para el grupo.');
      return;
    }
    if (membersList.length < 2) {
      alert('El grupo debe tener al menos 2 integrantes.');
      return;
    }

    onCreateGroup({
      name: groupName.trim(),
      description: groupDesc.trim(),
      members: membersList
    });

    // Resetear form
    setGroupName('');
    setGroupDesc('');
    setMembersList(['Leo']);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flex: '1', flexDirection: 'column', gap: '20px' }}>
      
      {/* Tarjeta de Saldo Consolidado */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tu balance general ({currentUser})
            </span>
            <h2 style={{ fontSize: '2rem', margin: '4px 0 0 0', fontWeight: '700', color: netBalance >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
              {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}
            </h2>
          </div>
          <div className="theme-toggle" style={{ cursor: 'default', background: 'var(--accent-light)', color: 'var(--accent)', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Te deben en total</span>
            <div style={{ color: 'var(--green-text)', fontWeight: 600, fontSize: '1rem', marginTop: '2px' }}>
              ${totalOwedToMe.toFixed(2)}
            </div>
          </div>
          <div style={{ width: '1px', background: 'var(--panel-border)' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Debés en total</span>
            <div style={{ color: 'var(--red-text)', fontWeight: 600, fontSize: '1rem', marginTop: '2px' }}>
              ${totalIOwe.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Grupos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mis Grupos</h3>
        <button className="btn btn-sm btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Crear Grupo
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
          <p style={{ fontWeight: 500 }}>Aún no tenés ningún grupo creado</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Creá un grupo y agregá a tus amigos para empezar a dividir gastos.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Crear Primer Grupo
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.map(group => {
            const { balances } = calculateBalancesAndDebts(group.members, group.expenses);
            const userBalance = balances[currentUser] || 0;
            const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <div 
                key={group.id} 
                className="glass-panel glass-panel-interactive" 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}
                onClick={() => onSelectGroup(group.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {group.name}
                  </h4>
                  {group.description && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {group.description}
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {group.members.length} integrantes • Total gastado: ${totalSpent.toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {userBalance > 0 ? (
                      <>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Te deben</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green-text)' }}>
                          +${userBalance.toFixed(2)}
                        </span>
                      </>
                    ) : userBalance < 0 ? (
                      <>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Debés</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--red-text)' }}>
                          -${Math.abs(userBalance).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saldado</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          $0.00
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Grupo */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Crear Nuevo Grupo</h2>
              <button className="btn-ghost btn-icon-only" onClick={() => setIsModalOpen(false)} aria-label="Cerrar modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label">Nombre del Grupo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Viaje a Bariloche, Asado del Sábado..." 
                  className="input-field"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej. Gastos del viaje de egresados" 
                  className="input-field"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </div>

              {/* Integrantes */}
              <div className="form-group">
                <label className="form-label">Integrantes del Grupo</label>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Nombre del integrante" 
                      className="input-field"
                      style={{ paddingLeft: '36px' }}
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={handleAddMember}>
                    Agregar
                  </button>
                </div>

                <div className="member-chip-container">
                  {membersList.map(name => (
                    <span key={name} className="member-chip">
                      {name}
                      {name !== 'Leo' && (
                        <button type="button" onClick={() => handleRemoveMember(name)} aria-label={`Eliminar a ${name}`}>
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Crear Grupo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
