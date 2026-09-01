export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string; // Allows any custom string
  date: string;
}

class FinanceService {
  private expenses: Expense[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gym_expenses');
      if (stored) {
        this.expenses = JSON.parse(stored);
      } else {
        // Mock inicial para que no se vea vacío
        this.expenses = [
          { id: 'EXP-1', description: 'Pago de Internet', amount: 45, category: 'Servicios', date: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: 'EXP-2', description: 'Artículos de Limpieza', amount: 25, category: 'Insumos', date: new Date(Date.now() - 86400000).toISOString() }
        ];
        this.save();
      }
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gym_expenses', JSON.stringify(this.expenses));
    }
  }

  getExpenses(): Expense[] {
    return this.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addExpense(expense: Omit<Expense, 'id' | 'date'>) {
    const newExpense: Expense = {
      ...expense,
      id: `EXP-${Date.now()}`,
      date: new Date().toISOString()
    };
    this.expenses.push(newExpense);
    this.save();
    return newExpense;
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.save();
  }

  updateExpense(id: string, updatedFields: Partial<Expense>) {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...updatedFields };
      this.save();
    }
  }
}

export const financeService = new FinanceService();
