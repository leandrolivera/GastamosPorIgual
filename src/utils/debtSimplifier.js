/**
 * Calcula los balances individuales de los miembros y genera un listado
 * simplificado de transferencias para liquidar las deudas con el mínimo de transacciones.
 * 
 * @param {string[]} members - Array con los nombres de los integrantes.
 * @param {Object[]} expenses - Array con los gastos del grupo.
 * @returns {Object} { balances: { [name]: number }, transactions: [{ from: string, to: string, amount: number }] }
 */
export function calculateBalancesAndDebts(members, expenses = []) {
  // 1. Inicializar balances en cero para cada miembro
  const balances = {};
  members.forEach(member => {
    balances[member] = 0;
  });

  // 2. Procesar cada gasto
  expenses.forEach(expense => {
    const { amount, paidBy, splitType, splitDetails } = expense;
    
    // Sumar el dinero que pagó la persona
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += amount;
    }

    // Restar lo que le corresponde pagar a cada uno
    if (splitType !== 'equal' && splitDetails) {
      // División personalizada o selectiva
      members.forEach(member => {
        const share = splitDetails[member] || 0;
        if (balances[member] !== undefined) {
          balances[member] -= share;
        }
      });
    } else {
      // División equitativa (por defecto)
      const share = amount / members.length;
      members.forEach(member => {
        if (balances[member] !== undefined) {
          balances[member] -= share;
        }
      });
    }
  });

  // Redondear los balances a 2 decimales para evitar problemas de coma flotante de JS
  members.forEach(member => {
    balances[member] = Math.round(balances[member] * 100) / 100;
  });

  // 3. Algoritmo de Simplificación de Deudas (Greedy Algorithm)
  // Dividir en deudores (balance < 0) y acreedores (balance > 0)
  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach(name => {
    const bal = balances[name];
    if (bal < -0.01) {
      debtors.push({ name, balance: bal });
    } else if (bal > 0.01) {
      creditors.push({ name, balance: bal });
    }
  });

  const transactions = [];

  // Resolver deudas emparejando el mayor deudor con el mayor acreedor
  while (debtors.length > 0 && creditors.length > 0) {
    // Ordenar deudores de mayor a menor deuda (más negativo a menos negativo)
    debtors.sort((a, b) => a.balance - b.balance);
    // Ordenar acreedores de mayor a menor crédito (más positivo a menos positivo)
    creditors.sort((a, b) => b.balance - a.balance);

    const debtor = debtors[0];
    const creditor = creditors[0];

    // La cantidad a transferir es el mínimo entre la deuda y el crédito
    const amountToTransfer = Math.min(Math.abs(debtor.balance), creditor.balance);
    const roundedAmount = Math.round(amountToTransfer * 100) / 100;

    if (roundedAmount > 0) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: roundedAmount
      });
    }

    // Actualizar balances
    debtor.balance += roundedAmount;
    creditor.balance -= roundedAmount;

    // Eliminar de las listas si ya saldaron su cuenta
    if (Math.abs(debtor.balance) < 0.01) {
      debtors.shift();
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditors.shift();
    }
  }

  return {
    balances,
    transactions
  };
}
