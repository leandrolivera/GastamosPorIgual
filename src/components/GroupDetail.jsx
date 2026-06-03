import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, TrendingUp, DollarSign, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { calculateBalancesAndDebts } from '../utils/debtSimplifier';
import ExpenseForm from './ExpenseForm';
import SettleUpModal from './SettleUpModal';

const CATEGORY_NAMES = {
  comida: 'Comida 🍕',
  transporte: 'Transporte 🚗',
  hospedaje: 'Hospedaje 🏡',
  entretenimiento: 'Salidas/Cine 🍿',
  varios: 'Varios 📦',
  liquidar: 'Pago de Deuda 🤝'
};

export default function GroupDetail({ group, onBack, onSaveExpense, onDeleteExpense, onDeleteGroup, currentUser }) {
  const [activeTab, setActiveTab] = useState('gastos'); // 'gastos' | 'saldos' | 'graficos'
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Estados para pre-cargar la liquidación
  const [settlePayer, setSettlePayer] = useState('');
  const [settleReceiver, setSettleReceiver] = useState('');
  const [settleAmount, setSettleAmount] = useState(0);

  const { balances, transactions } = calculateBalancesAndDebts(group.members, group.expenses);

  const handleEditExpense = (expense, e) => {
    e.stopPropagation(); // Evitar comportamientos raros de click
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleNewExpenseClick = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleTriggerSettle = (from, to, amount) => {
    setSettlePayer(from);
    setSettleReceiver(to);
    setSettleAmount(amount);
    setIsSettleModalOpen(true);
  };

  const handleDeleteGroupClick = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar el grupo "${group.name}"? Esta acción borrará todos los gastos asociados.`)) {
      onDeleteGroup(group.id);
    }
  };

  // Calcular estadísticas por categoría (excluyendo 'liquidar' que son pagos de deuda)
  const categoryTotals = {};
  let totalSpending = 0;

  group.expenses.forEach(e => {
    if (e.category === 'liquidar') return;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    totalSpending += e.amount;
  });

  return (
    <div style={{ display: 'flex', flex: '1', flexDirection: 'column', gap: '16px' }}>
      
      {/* Cabecera del Detalle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="theme-toggle" onClick={onBack} aria-label="Volver al dashboard">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{group.name}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{group.members.join(', ')}</span>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDeleteGroupClick} aria-label="Eliminar grupo">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'gastos' ? 'active' : ''}`}
          onClick={() => setActiveTab('gastos')}
        >
          Gastos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saldos' ? 'active' : ''}`}
          onClick={() => setActiveTab('saldos')}
        >
          Balances
        </button>
        <button 
          className={`tab-btn ${activeTab === 'graficos' ? 'active' : ''}`}
          onClick={() => setActiveTab('graficos')}
        >
          Estadísticas
        </button>
      </div>

      {/* Contenido de Tabs */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* TAF 1: GASTOS */}
        {activeTab === 'gastos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {group.expenses.length} gastos registrados
              </span>
              <button className="btn btn-sm btn-primary" onClick={handleNewExpenseClick}>
                <Plus size={16} /> Nuevo Gasto
              </button>
            </div>

            {group.expenses.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <TrendingUp size={36} style={{ color: 'var(--text-muted)' }} />
                <p style={{ fontWeight: 500 }}>No hay gastos en este grupo</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Hacé click en "Nuevo Gasto" para empezar a registrar los consumos.
                </p>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {[...group.expenses].reverse().map(expense => {
                  const isPayer = expense.paidBy === currentUser;
                  
                  // Calcular cuota del currentUser en este gasto
                  let userShare = 0;
                  if (expense.splitType !== 'equal') {
                    userShare = expense.splitDetails[currentUser] || 0;
                  } else {
                    userShare = expense.amount / group.members.length;
                  }

                  // Wording y estado de balances individuales de este gasto
                  let balanceText = '';
                  let balanceVal = 0;
                  let isPayment = expense.category === 'liquidar';

                  if (isPayment) {
                    // Es un pago de deuda
                    const isReceiver = expense.splitDetails[currentUser] > 0;
                    if (isPayer) {
                      balanceText = `Pagaste a ${Object.keys(expense.splitDetails).find(k => expense.splitDetails[k] > 0)}`;
                      balanceVal = 0; // Se muestra saldado en sí mismo
                    } else if (isReceiver) {
                      balanceText = `${expense.paidBy} te pagó`;
                      balanceVal = 0;
                    } else {
                      balanceText = 'Pago registrado';
                      balanceVal = 0;
                    }
                  } else {
                    // Es un gasto regular
                    if (isPayer) {
                      balanceVal = expense.amount - userShare;
                      balanceText = balanceVal > 0 ? `Te deben $${balanceVal.toFixed(2)}` : 'Pagaste tu parte';
                    } else {
                      balanceVal = -userShare;
                      balanceText = userShare > 0 ? `Debés $${userShare.toFixed(2)}` : 'No te corresponde';
                    }
                  }

                  return (
                    <div key={expense.id} className="expense-item">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div className={`category-dot ${expense.category === 'liquidar' ? 'cat-varios' : 'cat-' + expense.category}`} style={{ width: '8px', height: '8px', flexShrink: 0 }} />
                        <div className="expense-meta" style={{ minWidth: 0 }}>
                          <span className="expense-desc" style={{ textDecoration: isPayment ? 'italic' : 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {expense.description}
                          </span>
                          <span className="expense-sub">
                            Pagado por {isPayer ? 'Vos' : expense.paidBy} • {expense.date}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="expense-amount-info">
                          <span className="expense-amount" style={{ color: isPayment ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            ${expense.amount.toFixed(2)}
                          </span>
                          {!isPayment && balanceVal !== 0 && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: balanceVal > 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
                              {balanceText}
                            </span>
                          )}
                          {(isPayment || balanceVal === 0) && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {isPayment ? 'Liquidación' : 'Saldado'}
                            </span>
                          )}
                        </div>

                        {/* Acciones de edición/eliminación */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="theme-toggle" style={{ padding: '6px' }} onClick={(e) => handleEditExpense(expense, e)} aria-label="Editar gasto">
                            <Edit2 size={14} />
                          </button>
                          <button className="theme-toggle" style={{ padding: '6px', color: 'var(--red-text)' }} onClick={(e) => { e.stopPropagation(); onDeleteExpense(group.id, expense.id); }} aria-label="Eliminar gasto">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BALANCES / SALDOS */}
        {activeTab === 'saldos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Resumen Individual */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Balances de Integrantes
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.members.map(member => {
                  const bal = balances[member] || 0;
                  const isCurrent = member === currentUser;
                  const detail = group.memberDetails?.find(d => d.member_name === member);
                  const hasJoined = detail && detail.user_id !== null;
                  const email = detail?.email;

                  return (
                    <div key={member} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {member} {isCurrent && '(Vos)'}
                        </span>
                        {!isCurrent && !hasJoined && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Invitado {email && `(${email})`}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, color: bal > 0 ? 'var(--green-text)' : bal < 0 ? 'var(--red-text)' : 'var(--text-muted)' }}>
                          {bal > 0 ? `+$${bal.toFixed(2)}` : bal < 0 ? `-$${Math.abs(bal).toFixed(2)}` : '$0.00'}
                        </span>
                        
                        {!isCurrent && !hasJoined && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', gap: '4px', border: '1px solid var(--panel-border)', borderRadius: '6px' }}
                            onClick={() => {
                              const inviteUrl = window.location.origin;
                              let msg = '';
                              if (email) {
                                msg = `¡Hola ${member}! Te agregué al grupo "${group.name}" en GastamosPorIgual. Registrate con tu correo "${email}" para unirte: ${inviteUrl}`;
                              } else {
                                msg = `¡Hola ${member}! Te agregué al grupo "${group.name}" en GastamosPorIgual. Creá tu cuenta para unirte: ${inviteUrl}`;
                              }
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            title="Compartir invitación por WhatsApp"
                          >
                            Invitar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transferencias Simplificadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Deudas Simplificadas 💡
                </h4>
                <button className="btn btn-sm btn-secondary" onClick={() => handleTriggerSettle('', '', 0)}>
                  Registrar Pago Directo
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--green-text)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>¡Están todos saldados! No hay deudas pendientes.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {transactions.map((t, idx) => (
                    <div key={idx} className="debt-transfer-card">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.from}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Debe pagarle a</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.to}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: t.from === currentUser ? 'var(--red-text)' : t.to === currentUser ? 'var(--green-text)' : 'var(--text-primary)' }}>
                          ${t.amount.toFixed(2)}
                        </span>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleTriggerSettle(t.from, t.to, t.amount)}
                        >
                          Liquidar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ESTADÍSTICAS */}
        {activeTab === 'graficos' && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Distribución del Gasto del Grupo</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total gastado: ${totalSpending.toFixed(2)} (excluye transferencias de deudas)
              </span>
            </div>

            {totalSpending === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={24} />
                <span style={{ fontSize: '0.9rem' }}>Registra algún gasto regular para ver las estadísticas.</span>
              </div>
            ) : (
              <div className="charts-container">
                {Object.keys(CATEGORY_NAMES).map(catId => {
                  if (catId === 'liquidar') return null;
                  const amt = categoryTotals[catId] || 0;
                  const percentage = totalSpending > 0 ? (amt / totalSpending) * 100 : 0;

                  return (
                    <div key={catId} className="chart-row">
                      <div className="chart-label-row">
                        <span>{CATEGORY_NAMES[catId]}</span>
                        <span style={{ fontWeight: 600 }}>
                          ${amt.toFixed(2)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className={`chart-bar-fill cat-${catId}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modales Incorporados */}
      <ExpenseForm 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        members={group.members}
        onSave={(expenseData) => {
          onSaveExpense(group.id, expenseData);
          setIsExpenseModalOpen(false);
        }}
        expense={editingExpense}
      />

      <SettleUpModal 
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        members={group.members}
        defaultPayer={settlePayer}
        defaultReceiver={settleReceiver}
        defaultAmount={settleAmount}
        onSave={(paymentData) => {
          onSaveExpense(group.id, paymentData);
          setIsSettleModalOpen(false);
        }}
      />

    </div>
  );
}
