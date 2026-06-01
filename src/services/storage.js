// Servicio de almacenamiento local simulado (Mock DB)
// Retorna promesas para simular la latencia de una base de datos real.

const STORAGE_KEY = 'gastamos_por_igual_groups';

// Datos iniciales de prueba (Mock Data) para guiar al usuario
const MOCK_GROUPS = [
  {
    id: 'group-viaje-playa',
    name: 'Viaje a la Costa 🌊',
    description: 'Gastos compartidos del fin de semana con amigos.',
    members: ['Leo', 'Flor', 'Sofi', 'Nico'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Hace 7 días
    expenses: [
      {
        id: 'exp-combustible',
        description: 'Combustible y Peajes 🚗',
        amount: 8000,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidBy: 'Leo',
        category: 'transporte',
        splitType: 'equal',
        splitDetails: {}
      },
      {
        id: 'exp-super',
        description: 'Supermercado (Asado y Bebidas) 🥩🍻',
        amount: 18000,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidBy: 'Flor',
        category: 'comida',
        splitType: 'equal',
        splitDetails: {}
      },
      {
        id: 'exp-alojamiento',
        description: 'Seña del Alquiler 🏡',
        amount: 32000,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidBy: 'Sofi',
        category: 'hospedaje',
        splitType: 'equal',
        splitDetails: {}
      },
      {
        id: 'exp-helado',
        description: 'Helados de la noche 🍦',
        amount: 4000,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidBy: 'Nico',
        category: 'comida',
        splitType: 'custom',
        splitDetails: {
          'Leo': 1500,
          'Flor': 1500,
          'Sofi': 1000,
          'Nico': 0
        }
      }
    ]
  }
];

// Helper para simular latencia de red (ej: 300ms)
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // Obtener todos los grupos
  async getGroups() {
    await delay();
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Si no hay datos, inicializamos con los mocks y los guardamos
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_GROUPS));
      return JSON.parse(JSON.stringify(MOCK_GROUPS));
    }
    return JSON.parse(data);
  },

  // Obtener un grupo por ID
  async getGroupById(id) {
    await delay();
    const groups = await this.getGroups();
    return groups.find(g => g.id === id) || null;
  },

  // Guardar o editar un grupo (nombre, descripción, integrantes)
  async saveGroup(groupData) {
    await delay();
    const groups = await this.getGroups();
    let updatedGroup;

    if (groupData.id) {
      // Editar existente
      const index = groups.findIndex(g => g.id === groupData.id);
      if (index !== -1) {
        groups[index] = {
          ...groups[index],
          name: groupData.name,
          description: groupData.description,
          // Al editar integrantes, mantenemos los existentes y agregamos nuevos
          members: groupData.members
        };
        updatedGroup = groups[index];
      }
    } else {
      // Crear nuevo grupo
      updatedGroup = {
        id: 'group-' + Math.random().toString(36).substr(2, 9),
        name: groupData.name,
        description: groupData.description || '',
        members: groupData.members,
        expenses: [],
        createdAt: new Date().toISOString()
      };
      groups.push(updatedGroup);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return updatedGroup;
  },

  // Eliminar un grupo
  async deleteGroup(id) {
    await delay();
    let groups = await this.getGroups();
    groups = groups.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  },

  // Guardar o editar un gasto dentro de un grupo
  async saveExpense(groupId, expenseData) {
    await delay();
    const groups = await this.getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) throw new Error('Grupo no encontrado');

    const group = groups[groupIndex];
    let updatedExpense;

    if (expenseData.id) {
      // Editar gasto existente
      const expIndex = group.expenses.findIndex(e => e.id === expenseData.id);
      if (expIndex !== -1) {
        group.expenses[expIndex] = {
          ...group.expenses[expIndex],
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          date: expenseData.date || new Date().toISOString().split('T')[0],
          paidBy: expenseData.paidBy,
          category: expenseData.category || 'varios',
          splitType: expenseData.splitType || 'equal',
          splitDetails: expenseData.splitDetails || {}
        };
        updatedExpense = group.expenses[expIndex];
      }
    } else {
      // Crear nuevo gasto
      updatedExpense = {
        id: 'expense-' + Math.random().toString(36).substr(2, 9),
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        paidBy: expenseData.paidBy,
        category: expenseData.category || 'varios',
        splitType: expenseData.splitType || 'equal',
        splitDetails: expenseData.splitDetails || {}
      };
      group.expenses.push(updatedExpense);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return group;
  },

  // Eliminar un gasto de un grupo
  async deleteExpense(groupId, expenseId) {
    await delay();
    const groups = await this.getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) throw new Error('Grupo no encontrado');

    const group = groups[groupIndex];
    group.expenses = group.expenses.filter(e => e.id !== expenseId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return group;
  }
};
