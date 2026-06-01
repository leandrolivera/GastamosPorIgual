import React, { useState, useEffect } from 'react';
import { X, ArrowRight, DollarSign, Calendar } from 'lucide-react';

export default function SettleUpModal({ isOpen, onClose, members, defaultPayer = '', defaultReceiver = '', defaultAmount = 0, onSave }) {
  const [payer, setPayer] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setPayer(defaultPayer || members[0] || '');
      setReceiver(defaultReceiver || members[1] || members[0] || '');
      setAmount(defaultAmount > 0 ? defaultAmount.toString() : '');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, defaultPayer, defaultReceiver, defaultAmount, members]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!payer || !receiver || payer === receiver || !amount || parseFloat(amount) <= 0) {
      alert('Por favor selecciona integrantes diferentes e ingresa un monto válido.');
      return;
    }

    // Un pago de deuda de "Payer" a "Receiver" por "Amount" en Splitwise se registra como:
    // Payer pagó, y se divide 100% para Receiver (el destinatario).
    // Así, Payer tiene +Amount y Receiver tiene -Amount en este gasto, cancelando la deuda.
    const splitDetails = {};
    members.forEach(m => {
      splitDetails[m] = m === receiver ? parseFloat(amount) : 0;
    });

    const expenseData = {
      description: `Pago: ${payer} ➔ ${receiver} 🤝`,
      amount: parseFloat(amount),
      date: date,
      paidBy: payer,
      category: 'liquidar',
      splitType: 'custom',
      splitDetails
    };

    onSave(expenseData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Registrar Pago</h2>
          <button className="btn-ghost btn-icon-only" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {/* Payer Select */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quién paga</label>
              <select 
                className="select-field" 
                value={payer} 
                onChange={(e) => setPayer(e.target.value)}
              >
                {members.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
              <ArrowRight size={20} />
            </div>

            {/* Receiver Select */}
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quién recibe</label>
              <select 
                className="select-field" 
                value={receiver} 
                onChange={(e) => setReceiver(e.target.value)}
              >
                {members.map(m => (
                  <option key={m} value={m} disabled={m === payer}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-group">
            <label className="form-label">Monto del pago</label>
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

          {/* Date Input */}
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Calendar size={18} />
              </div>
              <input 
                type="date" 
                className="input-field" 
                style={{ paddingLeft: '36px' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Guardar Pago
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
