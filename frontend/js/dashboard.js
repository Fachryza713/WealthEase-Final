// Dashboard JavaScript
class DashboardManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.sharedDataManager = window.sharedDataManager;
        this.transactions = this.sharedDataManager.loadTransactions();
        this.currentFilter = 'all'; // Track current filter
        this.init();
    }

    init() {
        // Check authentication
        if (!this.isLoggedIn || !this.user) {
            this.redirectToLogin();
            return;
        }

        // Setup dashboard
        this.setupDashboard();
        this.setupEventListeners();
        this.setupDataSync(); // Enable data synchronization
        this.loadDashboardData();
    }

    setupDashboard() {
        // Update user name in dashboard
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.user) {
            userNameElement.textContent = this.user.name;
        }

        // Set today's date as default for transaction form
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Update data summary
        this.updateDataSummary();
    }

    updateDataSummary() {
        const dataSummary = document.getElementById('dataSummary');
        const dataSummaryText = document.getElementById('dataSummaryText');
        
        if (dataSummary && dataSummaryText) {
            const summary = this.getDataSummary();
            
            if (summary.totalTransactions > 0) {
                const lastUpdated = summary.lastUpdated ? 
                    new Date(summary.lastUpdated).toLocaleDateString() : 'Unknown';
                
                dataSummaryText.innerHTML = `
                    ${summary.totalTransactions} transactions • 
                    Last updated: ${lastUpdated} • 
                    Data synced across devices
                `;
                dataSummary.style.display = 'block';
            } else {
                dataSummary.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Add Transaction buttons
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        const addTransactionAction = document.getElementById('addTransactionAction');
        
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => this.openAddTransactionModal());
        }
        
        if (addTransactionAction) {
            addTransactionAction.addEventListener('click', () => this.openAddTransactionModal());
        }
        
        // Filter buttons for payment method
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Modal controls
        const modal = document.getElementById('addTransactionModal');
        const closeModal = document.getElementById('closeModal');
        const cancelTransaction = document.getElementById('cancelTransaction');
        const addTransactionForm = document.getElementById('addTransactionForm');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeAddTransactionModal());
        }

        if (cancelTransaction) {
            cancelTransaction.addEventListener('click', () => this.closeAddTransactionModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAddTransactionModal();
                }
            });
        }

        if (addTransactionForm) {
            addTransactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e));
        }

        // Quick action buttons
        const actionBtns = document.querySelectorAll('.action-btn:not(#addTransactionAction):not(#exportDataBtn):not(#importDataBtn)');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });

        // Export/Import buttons
        const exportBtn = document.getElementById('exportDataBtn');
        const importBtn = document.getElementById('importDataBtn');
        const importFileInput = document.getElementById('importFileInput');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportUserData());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                importFileInput.click();
            });
        }

        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importUserData(e.target.files[0]);
                    e.target.value = ''; // Reset input
                }
            });
        }

        // Add click effects to stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', () => this.handleStatCardClick(card));
        });

        // Transaction type change handler
        const transactionType = document.getElementById('transactionType');
        if (transactionType) {
            transactionType.addEventListener('change', () => this.handleTransactionTypeChange());
        }
    }

    loadDashboardData() {
        // Simulate loading dashboard data with proper loading states
        this.showLoadingState();
        
        setTimeout(() => {
            this.hideLoadingState();
            this.animateStats();
            this.updateCashflow();
            this.updateStatsCards();
            this.updateTransactionList();
        }, 1500);
    }

    showLoadingState() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const valueElement = card.querySelector('.stat-value');
            if (valueElement) {
                valueElement.classList.add('loading');
            }
        });
    }

    hideLoadingState() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const valueElement = card.querySelector('.stat-value');
            if (valueElement) {
                valueElement.classList.remove('loading');
            }
        });
    }

    animateStats() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'pulse 0.6s ease-out';
            }, index * 200);
        });
    }

    updateCashflow() {
        const hasTransactions = this.transactions.length > 0;
        
        if (!hasTransactions) {
            // Show empty state for cashflow
            const incomeBar = document.querySelector('.income-fill');
            const expenseBar = document.querySelector('.expense-fill');
            const netCashflowElement = document.querySelector('.summary-value.positive');
            const savingsRateElement = document.querySelector('.summary-value:not(.positive):not(.negative)');

            if (incomeBar) {
                incomeBar.style.width = '0%';
                const incomeValue = incomeBar.querySelector('.bar-value');
                if (incomeValue) incomeValue.textContent = '$0';
            }

            if (expenseBar) {
                expenseBar.style.width = '0%';
                const expenseValue = expenseBar.querySelector('.bar-value');
                if (expenseValue) expenseValue.textContent = '$0';
            }

            if (netCashflowElement) {
                netCashflowElement.textContent = '$0';
                netCashflowElement.className = 'summary-value neutral';
            }

            if (savingsRateElement) {
                savingsRateElement.textContent = '0%';
            }
        } else {
            // Calculate cashflow based on transactions
            const income = this.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            const expenses = this.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const netCashflow = income - expenses;
            const savingsRate = income > 0 ? ((netCashflow / income) * 100).toFixed(1) : 0;

            // Calculate bar widths (max 100%)
            const maxValue = Math.max(income, expenses);
            const incomeWidth = maxValue > 0 ? (income / maxValue) * 100 : 0;
            const expenseWidth = maxValue > 0 ? (expenses / maxValue) * 100 : 0;

            // Update cashflow display
            const incomeBar = document.querySelector('.income-fill');
            const expenseBar = document.querySelector('.expense-fill');
            const netCashflowElement = document.querySelector('.summary-value.positive');
            const savingsRateElement = document.querySelector('.summary-value:not(.positive):not(.negative)');

            if (incomeBar) {
                incomeBar.style.width = `${incomeWidth}%`;
                const incomeValue = incomeBar.querySelector('.bar-value');
                if (incomeValue) incomeValue.textContent = `$${income.toLocaleString()}`;
            }

            if (expenseBar) {
                expenseBar.style.width = `${expenseWidth}%`;
                const expenseValue = expenseBar.querySelector('.bar-value');
                if (expenseValue) expenseValue.textContent = `$${expenses.toLocaleString()}`;
            }

            if (netCashflowElement) {
                netCashflowElement.textContent = netCashflow >= 0 ? `+$${netCashflow.toLocaleString()}` : `-$${Math.abs(netCashflow).toLocaleString()}`;
                netCashflowElement.className = `summary-value ${netCashflow >= 0 ? 'positive' : 'negative'}`;
            }

            if (savingsRateElement) {
                savingsRateElement.textContent = `${savingsRate}%`;
            }
        }
    }

    updateStatsCards() {
        const hasTransactions = this.transactions.length > 0;
        
        if (!hasTransactions) {
            // Show empty state for all stats cards
            this.updateStatCard('Total Balance', '$0.00', 'neutral', 'No transactions yet');
            this.updateStatCard('💵 Cash Balance', '$0.00', 'neutral', '0 transactions');
            this.updateStatCard('💳 Wallet Balance', '$0.00', 'neutral', '0 transactions');
            this.updateStatCard('Monthly Spending', '$0.00', 'neutral', 'No expenses recorded');
            this.updateStatCard('Investment Growth', '$0.00', 'neutral', 'No investments yet');
            this.updateStatCard('Savings Goal', '$0.00', 'neutral', 'Set your savings goal');
        } else {
            // Calculate actual values from transactions
            const totalIncome = this.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            const totalExpenses = this.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
            const currentBalance = totalIncome - totalExpenses;
            
            // Calculate Cash Balance
            const cashBalance = this.calculatePaymentMethodBalance('cash');
            const cashCount = this.transactions.filter(t => t.paymentMethod === 'cash').length;
            
            // Calculate Wallet Balance  
            const walletBalance = this.calculatePaymentMethodBalance('wallet');
            const walletCount = this.transactions.filter(t => t.paymentMethod === 'wallet').length;
            
            const monthlyExpenses = this.getMonthlyExpenses();
            const investmentGrowth = this.getInvestmentGrowth();
            const savingsProgress = this.getSavingsProgress();
            
            this.updateStatCard('Total Balance', `$${currentBalance.toLocaleString()}`, 
                currentBalance >= 0 ? 'positive' : 'negative', 'Current balance');
            this.updateStatCard('💵 Cash Balance', `$${cashBalance.toLocaleString()}`, 
                cashBalance >= 0 ? 'positive' : 'negative', `${cashCount} transactions`);
            this.updateStatCard('💳 Wallet Balance', `$${walletBalance.toLocaleString()}`, 
                walletBalance >= 0 ? 'positive' : 'negative', `${walletCount} transactions`);
            this.updateStatCard('Monthly Spending', `$${monthlyExpenses.toLocaleString()}`, 
                'negative', 'This month');
            this.updateStatCard('Investment Growth', `$${investmentGrowth.toLocaleString()}`, 
                'positive', 'Total investments');
            this.updateStatCard('Savings Goal', `$${savingsProgress.toLocaleString()}`, 
                'neutral', 'Savings progress');
        }
    }
    
    calculatePaymentMethodBalance(method) {
        const income = this.transactions
            .filter(t => t.type === 'income' && t.paymentMethod === method)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const expenses = this.transactions
            .filter(t => t.type === 'expense' && t.paymentMethod === method)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return income - expenses;
    }

    updateStatCard(title, value, changeClass, changeText) {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const cardTitle = card.querySelector('h3');
            if (cardTitle && cardTitle.textContent === title) {
                const valueElement = card.querySelector('.stat-value');
                const changeElement = card.querySelector('.stat-change');
                
                if (valueElement) {
                    valueElement.textContent = value;
                }
                
                if (changeElement) {
                    changeElement.textContent = changeText;
                    changeElement.className = `stat-change ${changeClass}`;
                }
            }
        });
    }

    getMonthlyExpenses() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' && 
                       transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    getInvestmentGrowth() {
        return this.transactions
            .filter(t => t.category === 'investment')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    getSavingsProgress() {
        // Simple savings calculation - can be enhanced later
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return Math.max(0, totalIncome - totalExpenses);
    }

    updateTransactionList() {
        const transactionList = document.getElementById('transactionList');
        if (!transactionList) return;
        
        // Filter transactions based on current filter
        let filteredTransactions = this.transactions;
        if (this.currentFilter === 'cash') {
            filteredTransactions = this.transactions.filter(t => t.paymentMethod === 'cash');
        } else if (this.currentFilter === 'wallet') {
            filteredTransactions = this.transactions.filter(t => t.paymentMethod === 'wallet' || !t.paymentMethod);
        }

        if (filteredTransactions.length === 0) {
            // Show empty state
            const emptyMessage = this.currentFilter === 'all' 
                ? 'No transactions yet'
                : `No ${this.currentFilter} transactions yet`;
                
            transactionList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <h4>${emptyMessage}</h4>
                    <p>Start tracking your finances by adding your first transaction</p>
                    <button class="btn btn-primary btn-sm" onclick="window.dashboardManager.openAddTransactionModal()">
                        <i class="fas fa-plus"></i>
                        Add Your First Transaction
                    </button>
                </div>
            `;
        } else {
            // Show actual transactions
            transactionList.innerHTML = '';
            filteredTransactions.slice(0, 10).forEach(transaction => {
                this.addTransactionToUI(transaction, false);
            });
        }
    }

    openAddTransactionModal() {
        const modal = document.getElementById('addTransactionModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeAddTransactionModal() {
        const modal = document.getElementById('addTransactionModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            this.resetTransactionForm();
        }
    }

    resetTransactionForm() {
        const form = document.getElementById('addTransactionForm');
        if (form) {
            form.reset();
            const dateInput = document.getElementById('transactionDate');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    handleTransactionTypeChange() {
        const type = document.getElementById('transactionType').value;
        const category = document.getElementById('transactionCategory');
        
        if (category) {
            // Clear existing options except the first one
            category.innerHTML = '<option value="">Select category</option>';
            
            if (type === 'income') {
                const incomeCategories = [
                    { value: 'salary', text: 'Salary' },
                    { value: 'freelance', text: 'Freelance' },
                    { value: 'investment', text: 'Investment Return' },
                    { value: 'bonus', text: 'Bonus' },
                    { value: 'other', text: 'Other Income' }
                ];
                incomeCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.value;
                    option.textContent = cat.text;
                    category.appendChild(option);
                });
            } else if (type === 'expense') {
                const expenseCategories = [
                    { value: 'food', text: 'Food & Dining' },
                    { value: 'transportation', text: 'Transportation' },
                    { value: 'shopping', text: 'Shopping' },
                    { value: 'entertainment', text: 'Entertainment' },
                    { value: 'bills', text: 'Bills & Utilities' },
                    { value: 'healthcare', text: 'Healthcare' },
                    { value: 'other', text: 'Other Expense' }
                ];
                expenseCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.value;
                    option.textContent = cat.text;
                    category.appendChild(option);
                });
            }
        }
    }

    async handleAddTransaction(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const transactionData = {
            name: formData.get('name'),
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            category: formData.get('category'),
            paymentMethod: formData.get('paymentMethod'), // Cash or Wallet
            description: formData.get('description'),
            date: formData.get('date')
        };

        // Validation
        if (!transactionData.name || !transactionData.amount || !transactionData.type || !transactionData.category || !transactionData.paymentMethod) {
            this.showNotification('Please fill in all required fields including payment method', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        
        this.showLoading(submitBtn, btnText, loadingSpinner);

        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Add transaction to local storage
            transactionData.id = Date.now();
            transactionData.createdAt = new Date().toISOString();
            this.transactions.unshift(transactionData);
            this.sharedDataManager.saveTransactions(this.transactions);

            // Add to UI
            this.addTransactionToUI(transactionData);
            
            // Update all components
            this.updateStatsCards();
            this.updateCashflow();
            this.updateTransactionList();
            this.updateDataSummary();

            // Dispatch custom events for analytics dashboard
            window.dispatchEvent(new CustomEvent('transactionAdded', {
                detail: { transaction: transactionData, transactions: this.transactions }
            }));
            
            window.dispatchEvent(new CustomEvent('dataUpdated', {
                detail: { transactions: this.transactions }
            }));

            console.log('Dashboard: Transaction added and events dispatched');

            this.showNotification('Transaction added successfully!', 'success');
            this.closeAddTransactionModal();
            
        } catch (error) {
            this.showNotification('Failed to add transaction. Please try again.', 'error');
        } finally {
            this.hideLoading(submitBtn, btnText, loadingSpinner);
        }
    }

    addTransactionToUI(transaction, animate = true) {
        const transactionList = document.getElementById('transactionList');
        if (!transactionList) return;

        const transactionItem = document.createElement('div');
        transactionItem.className = animate ? 'transaction-item new' : 'transaction-item';
        
        const iconMap = {
            food: 'fas fa-utensils',
            transportation: 'fas fa-car',
            shopping: 'fas fa-shopping-bag',
            entertainment: 'fas fa-film',
            bills: 'fas fa-file-invoice',
            healthcare: 'fas fa-heartbeat',
            salary: 'fas fa-briefcase',
            freelance: 'fas fa-laptop',
            investment: 'fas fa-chart-line',
            other: 'fas fa-circle'
        };

        const icon = iconMap[transaction.category] || 'fas fa-circle';
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'positive' : 'negative';
        const amountPrefix = isIncome ? '+' : '-';
        const formattedDate = this.formatDate(transaction.date);
        
        // Payment method badge
        const paymentMethod = transaction.paymentMethod || 'wallet'; // default to wallet
        const paymentBadge = paymentMethod === 'cash' 
            ? '<span class="payment-badge cash"><i class="fas fa-money-bill-wave"></i> Cash</span>'
            : '<span class="payment-badge wallet"><i class="fas fa-credit-card"></i> Wallet</span>';

        transactionItem.innerHTML = `
            <div class="transaction-icon">
                <i class="${icon}"></i>
            </div>
            <div class="transaction-details">
                <p class="transaction-name">${transaction.name}</p>
                <p class="transaction-date">${formattedDate} ${paymentBadge}</p>
            </div>
            <div class="transaction-amount ${amountClass}">${amountPrefix}$${Math.abs(transaction.amount).toFixed(2)}</div>
        `;

        transactionList.insertBefore(transactionItem, transactionList.firstChild);

        // Remove animation class after animation completes
        if (animate) {
            setTimeout(() => {
                transactionItem.classList.remove('new');
            }, 500);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }

    loadTransactions() {
        return this.sharedDataManager.loadTransactions();
    }

    saveTransactions() {
        this.sharedDataManager.saveTransactions(this.transactions);
    }

    getUserStorageKey(dataType) {
        // Create user-specific storage key
        if (this.user && this.user.id) {
            return `wealthEase_${this.user.id}_${dataType}`;
        }
        // Fallback to generic key if no user
        return `wealthEase_guest_${dataType}`;
    }

    // Export user data for backup/sync
    exportUserData() {
        const userData = {
            user: this.user,
            transactions: this.transactions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `wealthEase_backup_${this.user?.name || 'user'}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Data exported successfully!', 'success');
    }

    // Import user data from backup
    importUserData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data
                if (!importedData.user || !importedData.transactions) {
                    throw new Error('Invalid backup file format');
                }
                
                // Check if user matches
                if (importedData.user.id !== this.user?.id) {
                    const confirmImport = confirm(
                        `This backup belongs to ${importedData.user.name} (${importedData.user.email}). ` +
                        `You are currently logged in as ${this.user?.name} (${this.user?.email}). ` +
                        'Do you want to continue importing this data?'
                    );
                    
                    if (!confirmImport) {
                        return;
                    }
                }
                
                // Import transactions
                this.transactions = importedData.transactions;
                this.sharedDataManager.saveTransactions(this.transactions);
                
                // Update UI
                this.updateStatsCards();
                this.updateCashflow();
                this.updateTransactionList();
                this.updateDataSummary();
                
                // Dispatch custom events for analytics dashboard
                window.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: { transactions: this.transactions }
                }));
                
                console.log('Dashboard: Data imported and events dispatched');
                
                this.showNotification('Data imported successfully!', 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Failed to import data. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    // Sync data across browser tabs/windows
    setupDataSync() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('wealthEase_') && e.key.includes('transactions')) {
                // Check if this is for the current user
                const currentUserKey = this.sharedDataManager.getUserStorageKey('transactions');
                if (e.key === currentUserKey && e.newValue) {
                    try {
                        const newTransactions = JSON.parse(e.newValue);
                        if (JSON.stringify(newTransactions) !== JSON.stringify(this.transactions)) {
                            this.transactions = newTransactions;
                            this.updateStatsCards();
                            this.updateCashflow();
                            this.updateTransactionList();
                            this.updateDataSummary();
                            this.showNotification('Data synchronized from another tab', 'info');
                        }
                    } catch (error) {
                        console.error('Sync error:', error);
                    }
                }
            }
        });
    }

    // Get data summary for display
    getDataSummary() {
        const totalTransactions = this.transactions.length;
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const netBalance = totalIncome - totalExpenses;
        
        return {
            totalTransactions,
            totalIncome,
            totalExpenses,
            netBalance,
            lastUpdated: this.transactions.length > 0 ? 
                new Date(Math.max(...this.transactions.map(t => new Date(t.createdAt)))) : 
                null
        };
    }

    handleLogout() {
        // Clear authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        
        // Show logout confirmation
        this.showNotification('Logged out successfully', 'success');
        
        // Redirect to login page with logout parameter
        setTimeout(() => {
            window.location.href = 'login.html?logout=true';
        }, 1000);
    }

    handleQuickAction(e) {
        const button = e.currentTarget;
        const action = button.textContent.trim();
        
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        // Handle different actions
        switch (action) {
            case 'View Reports':
                // Reports feature - no notification needed
                break;
            case 'Settings':
                // Settings feature - no notification needed
                break;
            case 'Export Data':
                this.exportUserData();
                break;
            case 'Import Data':
                document.getElementById('importFileInput').click();
                break;
            default:
                // No notification for other features
                break;
        }
    }
    
    handleFilterChange(e) {
        const filter = e.currentTarget.dataset.filter;
        this.currentFilter = filter;
        
        // Update active state on filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Update transaction list with filter
        this.updateTransactionList();
    }

    handleStatCardClick(card) {
        // Add click animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);

        const title = card.querySelector('h3').textContent;
        this.showNotification(`Viewing details for ${title}`, 'info');
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    showLoading(button, btnText, spinner) {
        button.disabled = true;
        btnText.style.opacity = '0';
        spinner.style.display = 'block';
    }

    hideLoading(button, btnText, spinner) {
        button.disabled = false;
        btnText.style.opacity = '1';
        spinner.style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        const colorMap = {
            success: '#4ade80',
            error: '#f87171',
            info: '#22afa1',
            warning: '#fbbf24'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colorMap[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    simulateApiCall() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, 1000);
        });
    }

    // Method to refresh dashboard data
    refreshDashboard() {
        this.loadDashboardData();
        this.showNotification('Dashboard refreshed', 'success');
    }

    // Method to simulate real-time updates
    startRealTimeUpdates() {
        setInterval(() => {
            // Simulate random updates to stats
            const statCards = document.querySelectorAll('.stat-card');
            const randomCard = statCards[Math.floor(Math.random() * statCards.length)];
            
            if (randomCard) {
                randomCard.style.borderColor = '#22afa1';
                setTimeout(() => {
                    randomCard.style.borderColor = '';
                }, 2000);
            }
        }, 30000); // Update every 30 seconds
    }
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
    
    // Make dashboard accessible globally for chatbot integration
    window.dashboardManager = dashboard;
    window.dashboard = dashboard;
    
    // Notify chatbot that dashboard is ready
    window.dispatchEvent(new CustomEvent('dashboardReady', {
        detail: { dashboardManager: dashboard }
    }));
    
    // Start real-time updates
    dashboard.startRealTimeUpdates();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    dashboard.refreshDashboard();
                    break;
                case 'l':
                    e.preventDefault();
                    dashboard.handleLogout();
                    break;
                case 'n':
                    e.preventDefault();
                    dashboard.openAddTransactionModal();
                    break;
            }
        }
        
        // ESC key to close modal
        if (e.key === 'Escape') {
            dashboard.closeAddTransactionModal();
        }
    });
});

// Add CSS animations for dashboard
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }
    
    .empty-state .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #d1d5db;
    }
    
    .empty-state h4 {
        margin: 0.5rem 0;
        color: #374151;
        font-weight: 500;
    }
    
    .empty-state p {
        margin: 0.5rem 0 1.5rem 0;
        font-size: 0.9rem;
    }
    
    .stat-change.neutral {
        color: #6b7280;
    }
    
    .summary-value.neutral {
        color: #6b7280;
    }
    
    .data-summary {
        margin-top: 10px;
        padding: 8px 12px;
        background: #e3f2fd;
        border: 1px solid #bbdefb;
        border-radius: 6px;
        color: #1565c0;
        font-size: 0.85rem;
    }
    
    .data-summary i {
        margin-right: 5px;
    }
`;
document.head.appendChild(style);
