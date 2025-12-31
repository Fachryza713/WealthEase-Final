const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper function to read transactions data
const getTransactionsData = () => {
    try {
        const dataPath = path.join(__dirname, '../data/transactions.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading transactions data:', error);
        return { transactions: [] };
    }
};

// Helper function to calculate analytics
const calculateAnalytics = (transactions, month = null) => {
    let filteredTransactions = transactions;
    
    // Filter by month if specified
    if (month) {
        filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionMonth = transactionDate.getMonth() + 1; // getMonth() returns 0-11
            return transactionMonth === parseInt(month);
        });
    }
    
    const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Group expenses by category
    const categoryMap = {};
    filteredTransactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
            if (categoryMap[transaction.category]) {
                categoryMap[transaction.category] += transaction.amount;
            } else {
                categoryMap[transaction.category] = transaction.amount;
            }
        });
    
    const categories = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
    })).sort((a, b) => b.value - a.value);
    
    return {
        income,
        expense,
        balance: income - expense,
        categories,
        totalTransactions: filteredTransactions.length,
        month: month || 'all'
    };
};

// GET /api/analytics - Get overall analytics
router.get('/', (req, res) => {
    try {
        const data = getTransactionsData();
        const analytics = calculateAnalytics(data.transactions);
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving analytics data',
            error: error.message
        });
    }
});

// GET /api/analytics/:month - Get analytics for specific month
router.get('/:month', (req, res) => {
    try {
        const { month } = req.params;
        const monthNum = parseInt(month);
        
        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                message: 'Invalid month. Please provide a month number between 1-12'
            });
        }
        
        const data = getTransactionsData();
        const analytics = calculateAnalytics(data.transactions, monthNum);
        
        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error getting monthly analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving monthly analytics data',
            error: error.message
        });
    }
});

// GET /api/analytics/summary/categories - Get category breakdown
router.get('/summary/categories', (req, res) => {
    try {
        const data = getTransactionsData();
        const analytics = calculateAnalytics(data.transactions);
        
        res.json({
            success: true,
            data: {
                categories: analytics.categories,
                totalExpense: analytics.expense
            }
        });
    } catch (error) {
        console.error('Error getting category summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving category summary',
            error: error.message
        });
    }
});

// GET /api/analytics/summary/income-expense - Get income vs expense comparison
router.get('/summary/income-expense', (req, res) => {
    try {
        const data = getTransactionsData();
        const analytics = calculateAnalytics(data.transactions);
        
        res.json({
            success: true,
            data: {
                income: analytics.income,
                expense: analytics.expense,
                balance: analytics.balance,
                savingsRate: analytics.income > 0 ? ((analytics.balance / analytics.income) * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Error getting income-expense summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving income-expense summary',
            error: error.message
        });
    }
});

module.exports = router;
