import { supabase } from './supabaseClient';

export const storageService = {
  // Obtener todos los grupos vinculados al usuario
  async getGroups(userId, userName, userEmail) {
    if (!userId) return [];

    // 1. Auto-vincular invitaciones previas por Email (Primario y Seguro)
    if (userEmail) {
      try {
        await supabase
          .from('group_members')
          .update({ user_id: userId })
          .eq('email', userEmail)
          .is('user_id', null);
      } catch (err) {
        console.error('Error al auto-vincular por email:', err);
      }
    }

    // 1b. Auto-vincular por Nombre (Secundario como fallback)
    if (userName) {
      try {
        await supabase
          .from('group_members')
          .update({ user_id: userId })
          .eq('member_name', userName)
          .is('user_id', null);
      } catch (err) {
        console.error('Error al auto-vincular por nombre:', err);
      }
    }

    // 2. Obtener los IDs de grupos a los que pertenece el usuario
    const { data: memberships, error: memErr } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
      
    if (memErr) throw memErr;
    if (!memberships || memberships.length === 0) {
      return [];
    }

    const groupIds = memberships.map(m => m.group_id);

    // 3. Traer todos los detalles de estos grupos
    const { data: groups, error: grpErr } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: false });

    if (grpErr) throw grpErr;

    // 4. Para cada grupo, cargar integrantes, gastos y divisiones (splits)
    const fullGroups = await Promise.all(groups.map(async (group) => {
      // Integrantes
      const { data: members, error: memsErr } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id);
      if (memsErr) throw memsErr;

      // Gastos
      const { data: expenses, error: expsErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', group.id)
        .order('date', { ascending: true });
      if (expsErr) throw expsErr;

      // Divisiones
      let fullExpenses = [];
      if (expenses.length > 0) {
        const expenseIds = expenses.map(e => e.id);
        const { data: splits, error: splitsErr } = await supabase
          .from('expense_splits')
          .select('*')
          .in('expense_id', expenseIds);
        if (splitsErr) throw splitsErr;

        fullExpenses = expenses.map(exp => {
          const expSplits = splits.filter(s => s.expense_id === exp.id);
          const splitDetails = {};
          expSplits.forEach(s => {
            splitDetails[s.member_name] = parseFloat(s.share_amount);
          });

          return {
            id: exp.id,
            description: exp.description,
            amount: parseFloat(exp.amount),
            date: exp.date,
            paidBy: exp.paid_by,
            category: exp.category,
            splitType: exp.split_type,
            splitDetails
          };
        });
      } else {
        fullExpenses = [];
      }

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        members: members.map(m => m.member_name),
        memberDetails: members,
        expenses: fullExpenses,
        createdAt: group.created_at
      };
    }));

    return fullGroups;
  },

  // Obtener un grupo específico por ID
  async getGroupById(id, userId) {
    if (!userId) return null;
    const groups = await this.getGroups(userId);
    return groups.find(g => g.id === id) || null;
  },

  // Guardar o editar un grupo
  async saveGroup(groupData, creatorUserId, creatorName, creatorEmail) {
    let groupId = groupData.id;

    if (groupId) {
      // Editar nombre/descripción
      const { error: grpErr } = await supabase
        .from('groups')
        .update({
          name: groupData.name,
          description: groupData.description
        })
        .eq('id', groupId);
      if (grpErr) throw grpErr;

      // Vincular nuevos integrantes
      const { data: currentMembers, error: curMemErr } = await supabase
        .from('group_members')
        .select('member_name')
        .eq('group_id', groupId);
      if (curMemErr) throw curMemErr;

      const currentNames = currentMembers.map(m => m.member_name);
      // groupData.members es un array de objetos { name, email }
      const newMembers = groupData.members.filter(m => !currentNames.includes(m.name));

      if (newMembers.length > 0) {
        const membersToInsert = newMembers.map(m => ({
          group_id: groupId,
          member_name: m.name,
          email: m.email || null,
          user_id: m.name === creatorName ? creatorUserId : null
        }));
        const { error: insMemErr } = await supabase
          .from('group_members')
          .insert(membersToInsert);
        if (insMemErr) throw insMemErr;
      }
    } else {
      // Crear nuevo grupo
      const { data: newGroup, error: grpErr } = await supabase
        .from('groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          created_by: creatorUserId
        })
        .select()
        .single();
      if (grpErr) throw grpErr;

      groupId = newGroup.id;

      // Insertar integrantes
      const membersToInsert = groupData.members.map(m => ({
        group_id: groupId,
        member_name: m.name,
        email: m.email || null,
        user_id: m.name === creatorName ? creatorUserId : null
      }));

      const { error: insMemErr } = await supabase
        .from('group_members')
        .insert(membersToInsert);
      if (insMemErr) throw insMemErr;
    }

    return { id: groupId };
  },

  // Eliminar un grupo
  async deleteGroup(id) {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Guardar o editar un gasto dentro de un grupo
  async saveExpense(groupId, expenseData) {
    let expenseId = expenseData.id;

    const expensePayload = {
      group_id: groupId,
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date,
      paid_by: expenseData.paidBy,
      category: expenseData.category,
      split_type: expenseData.splitType
    };

    if (expenseId) {
      // Editar
      const { error: expErr } = await supabase
        .from('expenses')
        .update(expensePayload)
        .eq('id', expenseId);
      if (expErr) throw expErr;

      // Limpiar splits viejos
      const { error: delErr } = await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', expenseId);
      if (delErr) throw delErr;
    } else {
      // Crear nuevo
      const { data: newExp, error: expErr } = await supabase
        .from('expenses')
        .insert(expensePayload)
        .select()
        .single();
      if (expErr) throw expErr;

      expenseId = newExp.id;
    }

    // Insertar splits si no es división equitativa simple
    if (expenseData.splitType !== 'equal' && expenseData.splitDetails) {
      const splitsToInsert = Object.keys(expenseData.splitDetails).map(name => ({
        expense_id: expenseId,
        member_name: name,
        share_amount: expenseData.splitDetails[name]
      }));

      const { error: splErr } = await supabase
        .from('expense_splits')
        .insert(splitsToInsert);
      if (splErr) throw splErr;
    }

    return { id: expenseId };
  },

  // Eliminar un gasto
  async deleteExpense(groupId, expenseId) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    if (error) throw error;
  }
};
