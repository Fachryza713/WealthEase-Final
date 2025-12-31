// Analytics Dashboard JavaScript
class AnalyticsDashboard {
    constructor() {
        this.expenseChart = null;
        this.incomeExpenseChart = null;
        this.currentData = null;
        this.sharedDataManager = window.sharedDataManager;
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.sharedDataManager.isAuthenticated()) {
            this.showError('Please login to view analytics');
            return;
        }

        this.showLoading();
        await this.loadAnalyticsData();
        this.setupEventListeners();
        this.setupDataSync();
        this.hideLoading();
    }

    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    async loadAnalyticsData(month = null) {
        try {
            // Get real data from shared data manager
            const analytics = this.sharedDataManager.calculateAnalytics(null, month);
            
            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            this.currentData = analytics;
            this.updateSummaryCards();
            this.updateCharts();
            this.updateCategoryTable();
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showError('Gagal memuat data analitik. Silakan coba lagi.');
        }
    }

    updateSummaryCards() {
        const { income, expense, balance, savingsRate } = this.currentData;
        
        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(expense);
        document.getElementById('balance').textContent = this.formatCurrency(balance);
        document.getElementById('savingsRate').textContent = `${savingsRate}%`;
        
        // Add color coding for balance
        const balanceElement = document.getElementById('balance');
        if (balance >= 0) {
            balanceElement.style.color = '#22afa1';
        } else {
            balanceElement.style.color = '#e74c3c';
        }
    }

    updateCharts() {
        this.createExpenseChart();
        this.createIncomeExpenseChart();
    }

    createExpenseChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }

        const { categories } = this.currentData;
        const colors = ['#22afa1', '#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#2ecc71', '#e67e22', '#8e44ad'];

        this.expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.map(cat => cat.name),
                datasets: [{
                    data: categories.map(cat => cat.value),
                    backgroundColor: colors.slice(0, categories.length),
                    borderColor: '#0a0905',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#22afa1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#dbd3d2',
                            font: {
                                family: 'Poppins',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 9, 5, 0.9)',
                        titleColor: '#22afa1',
                        bodyColor: '#dbd3d2',
                        borderColor: '#22afa1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${AnalyticsDashboard.prototype.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    }

    createIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.incomeExpenseChart) {
            this.incomeExpenseChart.destroy();
        }

        const { income, expense } = this.currentData;

        this.incomeExpenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pemasukan', 'Pengeluaran'],
                datasets: [{
                    data: [income, expense],
                    backgroundColor: ['#22afa1', '#e74c3c'],
                    borderColor: '#0a0905',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#dbd3d2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#dbd3d2',
                            font: {
                                family: 'Poppins',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 9, 5, 0.9)',
                        titleColor: '#22afa1',
                        bodyColor: '#dbd3d2',
                        borderColor: '#22afa1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${AnalyticsDashboard.prototype.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    }

    updateCategoryTable() {
        const tbody = document.getElementById('categoryTableBody');
        const { categories, expense } = this.currentData;
        
        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const percentage = ((category.value / expense) * 100).toFixed(1);
            const progressWidth = Math.min(percentage, 100);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${category.name}</strong></td>
                <td>${this.formatCurrency(category.value)}</td>
                <td>${percentage}%</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressWidth}%"></div>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    setupEventListeners() {
        const monthFilter = document.getElementById('monthFilter');
        monthFilter.addEventListener('change', async (e) => {
            const selectedMonth = e.target.value;
            this.showLoading();
            await this.loadAnalyticsData(selectedMonth || null);
            this.hideLoading();
        });
    }

    setupDataSync() {
        // Listen for data changes from dashboard
        this.sharedDataManager.addListener((type, data) => {
            if (type === 'transactions' || type === 'transaction_added' || type === 'data_updated') {
                console.log('Analytics: Data changed, refreshing...', type);
                // Refresh analytics when transactions change
                this.refreshAnalytics();
            }
        });

        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('transactions')) {
                console.log('Analytics: Storage changed, refreshing...');
                // Refresh analytics when data changes in other tabs
                setTimeout(() => {
                    this.refreshAnalytics();
                }, 100);
            }
        });

        // Listen for custom events
        window.addEventListener('transactionAdded', () => {
            console.log('Analytics: Transaction added event received');
            this.refreshAnalytics();
        });

        window.addEventListener('dataUpdated', () => {
            console.log('Analytics: Data updated event received');
            this.refreshAnalytics();
        });
    }

    async refreshAnalytics() {
        try {
            console.log('Analytics: Refreshing data...');
            await this.loadAnalyticsData();
            console.log('Analytics: Data refreshed successfully');
        } catch (error) {
            console.error('Analytics: Error refreshing data:', error);
        }
    }

    formatCurrency(amount) {
        return this.sharedDataManager.formatCurrency(amount);
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation to buttons
    document.querySelectorAll('button, .btn-back').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});
