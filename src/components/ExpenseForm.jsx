import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, User, Users } from 'lucide-react';

const CATEGORIES = [
  { id: 'comida', label: 'Comida 🍕', class: 'cat-comida' },
  { id: 'transporte', label: 'Transporte 🚗', class: 'cat-transporte' },
  { id: 'hospedaje', label: 'Hospedaje 🏡', class: 'cat-hospedaje' },
  { id: 'entretenimiento', label: 'Salidas/Cine 🍿', class: 'cat-entretenimiento' },
  { id: 'varios', label: 'Varios/Otros 📦', class: 'cat-varios' }
];

export default function ExpenseForm({ isOpen, onClose, members, onSave, expense = null }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('varios');
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'equal-select' | 'custom'
  const [splitDetails, setSplitDetails] = useState({});
  const [selectedMembers, setSelectedMembers] = useState({}); // Mapeo de integrante -> bool para equal-select

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        // Modo Edición
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setDate(expense.date);
        setPaidBy(expense.paidBy);
        setCategory(expense.category);
        setSplitType(expense.splitType || 'equal');
        setSplitDetails(expense.splitDetails || {});

        // Cargar selección si es equitativo-selectivo
        if (expense.splitType === 'equal-select') {
          const sel = {};
          members.forEach(m => {
            sel[m] = expense.splitDetails[m] > 0;
          });
          setSelectedMembers(sel);
        } else {
          const sel = {};
          members.forEach(m => {
            sel[m] = true;
          });
          setSelectedMembers(sel);
        }
      } else {
        // Modo Creación
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaidBy(members[0] || '');
        setCategory('varios');
        setSplitType('equal');
        
        // Inicializar splits personalizados en vacío
        const initialSplits = {};
        members.forEach(m => {
          initialSplits[m] = '';
        });
        setSplitDetails(initialSplits);

        // Seleccionar a todos por defecto para equal-select
        const sel = {};
        members.forEach(m => {
          sel[m] = true;
        });
        setSelectedMembers(sel);
      }
    }
  }, [isOpen, expense, members]);

  if (!isOpen) return null;

  // Manejar cambio en monto de división personalizada
  const handleCustomSplitChange = (member, value) => {
    setSplitDetails(prev => ({
      ...prev,
      [member]: value
    }));
  };

  // Calcular suma del split personalizado
  const getCustomSplitTotal = () => {
    return Object.values(splitDetails).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const getUnassignedAmount = () => {
    const total = parseFloat(amount) || 0;
    const assigned = getCustomSplitTotal();
    return Math.round((total - assigned) * 100) / 100;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Por favor ingresa una descripción.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingresa un monto válido.');
      return;
    }

    let finalSplitDetails = {};

    if (splitType === 'custom') {
      const customTotal = getCustomSplitTotal();
      const difference = Math.abs(parsedAmount - customTotal);
      
      if (difference > 0.05) {
        alert(`La suma de las partes (${customTotal}) no coincide con el total del gasto (${parsedAmount}). Diferencia: ${getUnassignedAmount()}`);
        return;
      }
      
      // Pasar a números flotantes limpios
      members.forEach(m => {
        finalSplitDetails[m] = parseFloat(splitDetails[m]) || 0;
      });
    } else if (splitType === 'equal-select') {
      const checkedNames = members.filter(m => selectedMembers[m]);
      const checkedCount = checkedNames.length;
      
      if (checkedCount === 0) {
        alert('Por favor selecciona al menos un integrante para dividir el gasto.');
        return;
      }

      const share = Math.round((parsedAmount / checkedCount) * 100) / 100;
      let sum = 0;
      checkedNames.forEach((name, idx) => {
        if (idx === checkedNames.length - 1) {
          // Ajuste final centavo a centavo para que de la suma exacta
          finalSplitDetails[name] = Math.round((parsedAmount - sum) * 100) / 100;
        } else {
          finalSplitDetails[name] = share;
          sum += share;
        }
      });

      // No seleccionados quedan en 0
      members.forEach(m => {
        if (!selectedMembers[m]) {
          finalSplitDetails[m] = 0;
        }
      });
    }

    const expenseData = {
      id: expense?.id,
      description: description.trim(),
      amount: parsedAmount,
      date: date || new Date().toISOString().split('T')[0],
      paidBy,
      category,
      splitType,
      splitDetails: splitType !== 'equal' ? finalSplitDetails : {}
    };

    onSave(expenseData);
  };

  const unassigned = getUnassignedAmount();
  const totalAmount = parseFloat(amount) || 0;
  const checkedMembersCount = Object.values(selectedMembers).filter(Boolean).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h2>
          <button className="btn-ghost btn-icon-only" onClick={onClose} aria-label="Cerrar formulario">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">¿Qué compraste? / Concepto</label>
            <input 
              type="text" 
              placeholder="Ej. Cena bodegón, Peajes, Carbón..." 
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={40}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Monto */}
            <div className="form-group" style={{ flex: 1.2 }}>
              <label className="form-label">Monto Total</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number" 
                  step="any"
                  placeholder="0.00" 
                  className="input-field" 
                  style={{ paddingLeft: '36px' }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Fecha */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  className="input-field" 
                  style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Pagador */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quién Pagó</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </div>
                <select 
                  className="select-field" 
                  style={{ paddingLeft: '36px' }}
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                >
                  {members.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categoría */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Categoría</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Tag size={18} />
                </div>
                <select 
                  className="select-field" 
                  style={{ paddingLeft: '36px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tipo de División */}
          <div className="form-group">
            <label className="form-label">Cómo dividir el gasto</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className={`btn btn-sm ${splitType === 'equal' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '100px', padding: '8px 4px', fontSize: '0.8rem' }}
                onClick={() => setSplitType('equal')}
              >
                <Users size={14} /> Equitativo (Todos)
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${splitType === 'equal-select' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '100px', padding: '8px 4px', fontSize: '0.8rem' }}
                onClick={() => setSplitType('equal-select')}
              >
                <Users size={14} /> Equitativo (Selección)
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${splitType === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '100px', padding: '8px 4px', fontSize: '0.8rem' }}
                onClick={() => setSplitType('custom')}
              >
                <DollarSign size={14} /> Montos Exactos
              </button>
            </div>
          </div>

          {/* Sub-formulario para división equitativa selectiva */}
          {splitType === 'equal-select' && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tildá los integrantes incluidos:</span>
                <span className={`badge ${checkedMembersCount > 0 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.8rem' }}>
                  {checkedMembersCount} seleccionados
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {members.map(m => {
                  const isChecked = !!selectedMembers[m];
                  const share = checkedMembersCount > 0 && isChecked ? (totalAmount / checkedMembersCount) : 0;
                  return (
                    <label key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => setSelectedMembers(prev => ({ ...prev, [m]: !prev[m] }))}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {m}
                        </span>
                      </div>
                      {isChecked && share > 0 && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-text)' }}>
                          ${share.toFixed(2)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              
              {totalAmount > 0 && checkedMembersCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>
                    Se dividirá en partes iguales: <b>${(totalAmount / checkedMembersCount).toFixed(2)}</b> para cada uno de los {checkedMembersCount} seleccionados.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sub-formulario para división personalizada */}
          {splitType === 'custom' && (
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Asignar por integrante:</span>
                <span className={`badge ${unassigned === 0 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.8rem' }}>
                  {unassigned === 0 ? 'Monto exacto!' : `Faltan: $${unassigned}`}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {members.map(m => (
                  <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{m}</span>
                    <div style={{ position: 'relative', width: '120px' }}>
                      <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        $
                      </div>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="0" 
                        className="input-field" 
                        style={{ padding: '6px 8px 6px 20px', fontSize: '0.9rem', textAlign: 'right' }}
                        value={splitDetails[m] !== undefined ? splitDetails[m] : ''}
                        onChange={(e) => handleCustomSplitChange(m, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {totalAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Suma total: ${getCustomSplitTotal()} de ${totalAmount}</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {expense ? 'Actualizar Gasto' : 'Agregar Gasto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
