class UserController {
    // Get user profile
    async getProfile(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const user = req.user;
            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    provider: user.provider,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { name, email } = req.body;
            const userId = req.user.id;

            // Update user data
            const updatedUser = await User.update(userId, {
                name: name || req.user.name,
                email: email || req.user.email
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    provider: updatedUser.provider
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get dashboard data
    async getDashboardData(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Mock dashboard data
            const dashboardData = {
                totalBalance: 12450.00,
                monthlySpending: 3200.00,
                investmentGrowth: 8750.00,
                savingsGoal: 15000.00,
                recentTransactions: [
                    {
                        id: 1,
                        name: 'Grocery Store',
                        amount: -85.50,
                        date: new Date().toISOString(),
                        category: 'food'
                    },
                    {
                        id: 2,
                        name: 'Gas Station',
                        amount: -45.00,
                        date: new Date(Date.now() - 86400000).toISOString(),
                        category: 'transportation'
                    },
                    {
                        id: 3,
                        name: 'Salary Deposit',
                        amount: 3500.00,
                        date: new Date(Date.now() - 172800000).toISOString(),
                        category: 'income'
                    }
                ],
                monthlyStats: {
                    income: 3500.00,
                    expenses: 3200.00,
                    savings: 300.00
                }
            };

            res.json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            console.error('Get dashboard data error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get user transactions
    async getTransactions(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { page = 1, limit = 10, category } = req.query;
            const userId = req.user.id;

            // Mock transactions data
            const transactions = [
                {
                    id: 1,
                    name: 'Grocery Store',
                    amount: -85.50,
                    date: new Date().toISOString(),
                    category: 'food',
                    description: 'Weekly grocery shopping'
                },
                {
                    id: 2,
                    name: 'Gas Station',
                    amount: -45.00,
                    date: new Date(Date.now() - 86400000).toISOString(),
                    category: 'transportation',
                    description: 'Fuel for car'
                },
                {
                    id: 3,
                    name: 'Salary Deposit',
                    amount: 3500.00,
                    date: new Date(Date.now() - 172800000).toISOString(),
                    category: 'income',
                    description: 'Monthly salary'
                },
                {
                    id: 4,
                    name: 'Coffee Shop',
                    amount: -12.50,
                    date: new Date(Date.now() - 259200000).toISOString(),
                    category: 'food',
                    description: 'Morning coffee'
                },
                {
                    id: 5,
                    name: 'Investment Return',
                    amount: 150.00,
                    date: new Date(Date.now() - 345600000).toISOString(),
                    category: 'investment',
                    description: 'Stock dividends'
                }
            ];

            // Filter by category if provided
            let filteredTransactions = transactions;
            if (category) {
                filteredTransactions = transactions.filter(t => t.category === category);
            }

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    transactions: paginatedTransactions,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(filteredTransactions.length / limit),
                        totalTransactions: filteredTransactions.length,
                        hasNext: endIndex < filteredTransactions.length,
                        hasPrev: startIndex > 0
                    }
                }
            });
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Add new transaction
    async addTransaction(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { name, amount, category, description } = req.body;
            const userId = req.user.id;

            // Validation
            if (!name || !amount || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, amount, and category are required'
                });
            }

            // Create new transaction
            const newTransaction = {
                id: Date.now(), // Simple ID generation
                name: name,
                amount: parseFloat(amount),
                category: category,
                description: description || '',
                date: new Date().toISOString(),
                userId: userId
            };

            res.status(201).json({
                success: true,
                message: 'Transaction added successfully',
                data: newTransaction
            });
        } catch (error) {
            console.error('Add transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Update transaction
    async updateTransaction(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { id } = req.params;
            const { name, amount, category, description } = req.body;
            const userId = req.user.id;

            // Mock update - in real app, update in database
            const updatedTransaction = {
                id: parseInt(id),
                name: name,
                amount: parseFloat(amount),
                category: category,
                description: description,
                date: new Date().toISOString(),
                userId: userId
            };

            res.json({
                success: true,
                message: 'Transaction updated successfully',
                data: updatedTransaction
            });
        } catch (error) {
            console.error('Update transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Delete transaction
    async deleteTransaction(req, res) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { id } = req.params;
            const userId = req.user.id;

            // Mock delete - in real app, delete from database
            res.json({
                success: true,
                message: 'Transaction deleted successfully',
                data: { id: parseInt(id), userId: userId }
            });
        } catch (error) {
            console.error('Delete transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new UserController();
