// Shared Data Manager for WealthEase
class SharedDataManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.listeners = [];
    }

    // Get user-specific storage key
    getUserStorageKey(dataType) {
        if (this.user && this.user.id) {
            return `wealthEase_${this.user.id}_${dataType}`;
        }
        return `wealthEase_guest_${dataType}`;
    }

    // Load transactions from localStorage
    loadTransactions() {
        const storageKey = this.getUserStorageKey('transactions');
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    // Save transactions to localStorage
    saveTransactions(transactions) {
        const storageKey = this.getUserStorageKey('transactions');
        localStorage.setItem(storageKey, JSON.stringify(transactions));
        
        // Trigger storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: storageKey,
            newValue: JSON.stringify(transactions),
            oldValue: localStorage.getItem(storageKey),
            storageArea: localStorage
        }));
        
        // Notify listeners immediately
        this.notifyListeners('transactions', transactions);
        
        // Also notify with specific event types
        this.notifyListeners('transaction_added', transactions);
        this.notifyListeners('data_updated', transactions);
    }

    // Calculate analytics data from transactions
    calculateAnalytics(transactions = null, month = null) {
        const data = transactions || this.loadTransactions();
        let filteredTransactions = data;
        
        // Filter by month if specified
        if (month) {
            filteredTransactions = data.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const transactionMonth = transactionDate.getMonth() + 1;
                return transactionMonth === parseInt(month);
            });
        }
        
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const balance = income - expense;
        const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(2) : 0;
        
        // Group expenses by category
        const categoryMap = {};
        filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                const categoryName = this.getCategoryDisplayName(transaction.category);
                if (categoryMap[categoryName]) {
                    categoryMap[categoryName] += Math.abs(transaction.amount);
                } else {
                    categoryMap[categoryName] = Math.abs(transaction.amount);
                }
            });
        
        const categories = Object.entries(categoryMap).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);
        
        return {
            income,
            expense,
            balance,
            savingsRate: parseFloat(savingsRate),
            categories,
            totalTransactions: filteredTransactions.length,
            month: month || 'all',
            lastUpdated: new Date().toISOString()
        };
    }

    // Get category display name
    getCategoryDisplayName(category) {
        const categoryMap = {
            'food': 'Food & Dining',
            'transportation': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'bills': 'Bills & Utilities',
            'healthcare': 'Healthcare',
            'salary': 'Salary',
            'freelance': 'Freelance',
            'investment': 'Investments',
            'bonus': 'Bonus',
            'other': 'Other'
        };
        return categoryMap[category] || category;
    }

    // Get recent transactions
    getRecentTransactions(limit = 5) {
        const transactions = this.loadTransactions();
        return transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Get total balance
    getTotalBalance() {
        const transactions = this.loadTransactions();
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return income - expenses;
    }

    // Add transaction listener
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove transaction listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners
    notifyListeners(type, data) {
        this.listeners.forEach(listener => {
            try {
                listener(type, data);
            } catch (error) {
                console.error('Error in listener:', error);
            }
        });
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.isLoggedIn && this.user;
    }

    // Get user info
    getUser() {
        return this.user;
    }
}

// Create global instance
window.sharedDataManager = new SharedDataManager();
