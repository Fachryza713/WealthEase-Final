/**
 * AI Finance Integration for Dashboard
 * Handles UI interactions, data processing, and OpenAI integration
 */

class AIFinanceIntegration {
    constructor() {
        this.userTransactions = [];
        this.userProfile = null;
        this.currentData = null;
        this.insights = [];
        this.isInitialized = false;
        this.user = null; // Add user property
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
    }

    /**
     * Load user data from WealthEase localStorage
     */
    async loadUserData() {
        try {
            // Get user data from localStorage
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            this.user = user; // Store user for storage key generation
            
            // Use the same storage key as dashboard.js
            const storageKey = this.getUserStorageKey('transactions');
            const transactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Calculate financial metrics with NaN protection
            const totalBalance = this.calculateTotalBalance(transactions);
            const monthlyIncome = this.calculateMonthlyIncome(transactions);
            const monthlyExpenses = this.calculateMonthlyExpenses(transactions);
            
            // Ensure all values are valid numbers
            const validTotalBalance = isNaN(totalBalance) ? 0 : totalBalance;
            const validMonthlyIncome = isNaN(monthlyIncome) ? 0 : monthlyIncome;
            const validMonthlyExpenses = isNaN(monthlyExpenses) ? 0 : monthlyExpenses;
            
            // Calculate savings rate with NaN protection
            const savingsRate = validMonthlyIncome > 0 ? 
                ((validMonthlyIncome - validMonthlyExpenses) / validMonthlyIncome * 100) : 0;
            const validSavingsRate = isNaN(savingsRate) ? 0 : savingsRate;
            
            this.userProfile = {
                name: user?.name || 'User',
                email: user?.email || '',
                totalBalance: validTotalBalance,
                monthlyIncome: validMonthlyIncome,
                monthlyExpenses: validMonthlyExpenses,
                savingsRate: validSavingsRate
            };
            
            this.userTransactions = transactions;
            
            return { 
                userProfile: this.userProfile, 
                transactions: this.userTransactions 
            };
        } catch (error) {
            console.error('Error loading user data:', error);
            throw error;
        }
    }

    /**
     * Get user-specific storage key (same as dashboard.js)
     */
    getUserStorageKey(dataType) {
        // Create user-specific storage key
        if (this.user && this.user.id) {
            return `wealthEase_${this.user.id}_${dataType}`;
        }
        // Fallback to generic key if no user
        return `wealthEase_${dataType}`;
    }

    /**
     * Analyze transactions with OpenAI API (via Backend Server)
     */
    async analyzeTransactionsWithOpenAI() {
        try {
            const { userProfile, transactions } = await this.loadUserData();
            
            // Format data for OpenAI
            const analysisPrompt = this.formatTransactionDataForOpenAI(transactions, userProfile);
            
            // Call backend AI server
            const response = await fetch('http://localhost:3001/api/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: analysisPrompt,
                    userProfile: userProfile,
                    transactionCount: transactions.length
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI Server error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'AI analysis failed');
            }
            
            // Parse AI response
            const analysis = this.parseAIResponse(result.analysis);
            
            return analysis;
        } catch (error) {
            console.error('OpenAI Analysis Error:', error);
            throw error;
        }
    }

    /**
     * Format transaction data for OpenAI analysis
     */
    formatTransactionDataForOpenAI(transactions, userProfile) {
        const recentTransactions = transactions.slice(-30); // Last 30 transactions
        
        // Calculate financial metrics
        const totalBalance = userProfile.totalBalance;
        const monthlyIncome = userProfile.monthlyIncome;
        const monthlyExpenses = userProfile.monthlyExpenses;
        const savingsRate = userProfile.savingsRate;
        
        // Analyze spending categories
        const spendingCategories = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            spendingCategories[t.category] = (spendingCategories[t.category] || 0) + t.amount;
        });
        
        // Analyze spending pattern
        const expenses = transactions.filter(t => t.type === 'expense');
        const recentExpenses = expenses.slice(-10);
        const olderExpenses = expenses.slice(-20, -10);
        
        let spendingPattern = 'Stable spending';
        if (recentExpenses.length > 0 && olderExpenses.length > 0) {
            const recentAvg = recentExpenses.reduce((sum, t) => sum + t.amount, 0) / recentExpenses.length;
            const olderAvg = olderExpenses.reduce((sum, t) => sum + t.amount, 0) / olderExpenses.length;
            const change = ((recentAvg - olderAvg) / olderAvg) * 100;
            
            if (change > 10) spendingPattern = 'Increasing spending';
            else if (change < -10) spendingPattern = 'Decreasing spending';
        }
        
        return `Analyze this financial data and provide comprehensive insights:

USER PROFILE:
- Name: ${userProfile.name}
- Current Balance: $${totalBalance.toFixed(2)}
- Monthly Income: $${monthlyIncome.toFixed(2)}
- Monthly Expenses: $${monthlyExpenses.toFixed(2)}
- Savings Rate: ${savingsRate.toFixed(1)}%

RECENT TRANSACTIONS (Last ${recentTransactions.length}):
${recentTransactions.map(t => 
    `- ${t.date}: ${t.type.toUpperCase()} $${t.amount.toFixed(2)} (${t.category}) - ${t.description || 'No description'}`
).join('\n')}

FINANCIAL ANALYSIS:
- Total Transactions: ${transactions.length}
- Average Transaction: $${(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toFixed(2)}
- Income vs Expense Ratio: ${monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome * 100).toFixed(1) : 0}%
- Spending Pattern: ${spendingPattern}

SPENDING CATEGORIES BREAKDOWN:
${Object.entries(spendingCategories).map(([category, amount]) => 
    `- ${category}: $${amount.toFixed(2)}`
).join('\n')}

Please provide a comprehensive analysis in JSON format with these exact keys:
{
    "analysis": "Detailed analysis of spending patterns, financial health, and trends",
    "recommendations": "Specific actionable recommendations for improving financial health",
    "predictions": {
        "nextWeekBalance": estimated_balance_next_week,
        "nextMonthBalance": estimated_balance_next_month,
        "trend": "bullish/bearish/neutral",
        "summary": "Brief summary of future financial outlook"
    },
    "warnings": "Any financial warnings or red flags",
    "score": {
        "financialHealth": score_out_of_100,
        "spendingDiscipline": score_out_of_100,
        "savingsRate": score_out_of_100,
        "volatility": volatility_percentage,
        "confidence": confidence_percentage
    }
}

Focus on:
1. Spending pattern analysis and trends
2. Budget optimization recommendations
3. Financial health assessment
4. Future balance predictions based on current trends
5. Specific actionable advice for improvement
6. Risk assessment and warnings

Be specific, actionable, and provide concrete numbers for predictions.`;
    }

    /**
     * Parse AI response and validate JSON
     */
    parseAIResponse(response) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Validate required fields
            const requiredFields = ['analysis', 'recommendations', 'predictions', 'warnings', 'score'];
            for (const field of requiredFields) {
                if (!parsed[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            
            return parsed;
        } catch (error) {
            console.error('Error parsing AI response:', error);
            
            // Return fallback response
            return {
                analysis: "Unable to parse AI response. Please try again.",
                recommendations: "Check your transaction data and try the analysis again.",
                predictions: {
                    nextWeekBalance: 0,
                    nextMonthBalance: 0,
                    trend: "neutral",
                    summary: "Unable to generate predictions"
                },
                warnings: "AI analysis failed. Please verify your data.",
                score: {
                    financialHealth: 50,
                    spendingDiscipline: 50,
                    savingsRate: 50,
                    volatility: 0,
                    confidence: 0
                }
            };
        }
    }

    /**
     * Generate mock analysis for fallback
     */
    async generateMockAnalysis(userData) {
        const { userProfile, transactions } = userData;
        
        // Calculate basic metrics
        const totalBalance = userProfile.totalBalance;
        const monthlyIncome = userProfile.monthlyIncome;
        const monthlyExpenses = userProfile.monthlyExpenses;
        const savingsRate = userProfile.savingsRate;
        
        // Generate predictions with stronger positive bias
        const trendAnalysis = this.calculateAdvancedTrend(transactions);
        
        // Ensure strong positive predictions (motivational approach)
        const baseWeeklyChange = Math.max(trendAnalysis.weeklyChange, 100); // Increased minimum to $100 weekly growth
        const baseMonthlyChange = Math.max(trendAnalysis.monthlyChange, 400); // Increased minimum to $400 monthly growth
        
        // Add stronger motivational boost based on current financial health
        const motivationalBoost = this.calculateMotivationalBoost(userProfile, transactions);
        const nextWeekBalance = totalBalance + baseWeeklyChange + motivationalBoost.weekly;
        const nextMonthBalance = totalBalance + baseMonthlyChange + motivationalBoost.monthly;
        
        // Determine trend with positive bias
        let trend = 'bullish'; // Always show positive trend for motivation
        
        // Calculate improved scores with positive bias
        const financialHealth = this.calculateFinancialHealthScore(userProfile, transactions);
        const spendingDiscipline = this.calculateSpendingDisciplineScore(userProfile, transactions);
        const volatility = this.calculateSpendingVolatility(transactions);
        
        return {
            analysis: this.generateMotivationalAnalysis(userProfile, transactions),
            recommendations: this.generateMotivationalRecommendations(userProfile, transactions),
            predictions: {
                nextWeekBalance: nextWeekBalance,
                nextMonthBalance: nextMonthBalance,
                trend: trend,
                summary: this.generateMotivationalPrediction(userProfile, transactions, nextWeekBalance, nextMonthBalance)
            },
            warnings: this.generateMotivationalWarnings(userProfile, transactions),
            score: {
                financialHealth: Math.min(100, financialHealth + 15), // Increased boost
                spendingDiscipline: Math.min(100, spendingDiscipline + 10), // Increased boost
                savingsRate: savingsRate,
                volatility: volatility,
                confidence: 90 // Higher confidence for motivation
            }
        };
    }

    /**
     * Calculate motivational boost for predictions
     */
    calculateMotivationalBoost(userProfile, transactions) {
        const boost = { weekly: 0, monthly: 0 };
        
        // Increased base boost for all users
        boost.weekly = 50; // Increased from $25 to $50 weekly boost
        boost.monthly = 200; // Increased from $100 to $200 monthly boost
        
        // Additional boost based on financial health
        if (userProfile.savingsRate > 20) {
            boost.weekly += 100; // Increased from $50 to $100
            boost.monthly += 400; // Increased from $200 to $400
        } else if (userProfile.savingsRate > 10) {
            boost.weekly += 50; // Increased from $25 to $50
            boost.monthly += 200; // Increased from $100 to $200
        } else if (userProfile.savingsRate > 0) {
            boost.weekly += 25; // Increased from $10 to $25
            boost.monthly += 100; // Increased from $40 to $100
        } else {
            // Even for negative savings rate, provide motivation
            boost.weekly += 15;
            boost.monthly += 60;
        }
        
        // Boost based on transaction consistency
        const volatility = this.calculateSpendingVolatility(transactions);
        if (volatility < 20) {
            boost.weekly += 60; // Increased from $30 to $60
            boost.monthly += 240; // Increased from $120 to $240
        } else if (volatility < 40) {
            boost.weekly += 30; // Increased from $15 to $30
            boost.monthly += 120; // Increased from $60 to $120
        } else {
            // Even for high volatility, provide motivation
            boost.weekly += 10;
            boost.monthly += 40;
        }
        
        return boost;
    }

    /**
     * Generate motivational analysis
     */
    generateMotivationalAnalysis(userProfile, transactions) {
        const savingsRate = userProfile.savingsRate;
        const transactionCount = transactions.length;
        
        if (savingsRate > 20) {
            return `🎉 Excellent! You have a ${savingsRate.toFixed(1)}% savings rate with ${transactionCount} transactions. You're on track for financial success! Your disciplined approach to money management is paying off.`;
        } else if (savingsRate > 10) {
            return `👍 Good progress! You have a ${savingsRate.toFixed(1)}% savings rate with ${transactionCount} transactions. You're building solid financial habits. With a few adjustments, you can reach even greater financial heights!`;
        } else if (savingsRate > 0) {
            return `💪 You're making progress! With a ${savingsRate.toFixed(1)}% savings rate and ${transactionCount} transactions, you're on the right path. Every small step counts toward your financial goals!`;
        } else {
            return `🚀 Ready for transformation! With ${transactionCount} transactions tracked, you have the foundation to build wealth. Let's turn this into a positive savings journey!`;
        }
    }

    /**
     * Generate motivational recommendations
     */
    generateMotivationalRecommendations(userProfile, transactions) {
        const recommendations = [];
        
        if (userProfile.savingsRate < 20) {
            recommendations.push("🎯 Set a goal to increase your savings rate to 20% - you're closer than you think!");
        }
        
        if (userProfile.monthlyExpenses > userProfile.monthlyIncome) {
            recommendations.push("💡 Focus on one expense category to reduce this month - small changes lead to big results!");
        } else {
            recommendations.push("🌟 Great job keeping expenses below income! Consider investing the difference for long-term growth.");
        }
        
        const categories = this.analyzeSpendingCategories(transactions);
        const largestCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0];
        
        if (largestCategory && largestCategory[1] > userProfile.monthlyIncome * 0.3) {
            recommendations.push(`📊 Your ${largestCategory[0]} spending is significant - try reducing it by 10% for immediate impact!`);
        }
        
        recommendations.push("📈 Track your progress weekly to stay motivated and see your financial growth!");
        
        return recommendations.join(' ');
    }

    /**
     * Generate motivational prediction
     */
    generateMotivationalPrediction(userProfile, transactions, nextWeekBalance, nextMonthBalance) {
        const weeklyGrowth = nextWeekBalance - userProfile.totalBalance;
        const monthlyGrowth = nextMonthBalance - userProfile.totalBalance;
        
        return `🚀 Exciting times ahead! Your balance is projected to grow by $${weeklyGrowth.toFixed(2)} this week and $${monthlyGrowth.toFixed(2)} this month. With consistent effort, you're building a strong financial future!`;
    }

    /**
     * Generate motivational warnings
     */
    generateMotivationalWarnings(userProfile, transactions) {
        const warnings = [];
        
        if (userProfile.monthlyExpenses > userProfile.monthlyIncome) {
            warnings.push("⚠️ Your expenses exceed income - this is a great opportunity to optimize your spending and boost your savings!");
        }
        
        if (userProfile.savingsRate < 0) {
            warnings.push("⚠️ Negative savings rate detected - let's turn this around with a positive action plan!");
        }
        
        const recentExpenses = transactions.filter(t => 
            t.type === 'expense' && 
            new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        if (recentExpenses.length > 10) {
            warnings.push("⚠️ High spending frequency - this is a chance to review and optimize your spending patterns!");
        }
        
        if (warnings.length === 0) {
            return "🎉 No major concerns detected! You're managing your finances well. Keep up the excellent work!";
        }
        
        return warnings.join(' ');
    }

    /**
     * Generate mock recommendations
     */
    generateMockRecommendations(userProfile, transactions) {
        const recommendations = [];
        
        if (userProfile.savingsRate < 10) {
            recommendations.push("Consider increasing your savings rate to at least 20% of income");
        }
        
        if (userProfile.monthlyExpenses > userProfile.monthlyIncome) {
            recommendations.push("Your expenses exceed income. Review and reduce unnecessary spending");
        }
        
        const categories = this.analyzeSpendingCategories(transactions);
        const largestCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0];
        
        if (largestCategory && largestCategory[1] > userProfile.monthlyIncome * 0.3) {
            recommendations.push(`Consider reducing spending in ${largestCategory[0]} category`);
        }
        
        return recommendations.join('. ') + '.';
    }

    /**
     * Generate mock warnings
     */
    generateMockWarnings(userProfile, transactions) {
        const warnings = [];
        
        if (userProfile.monthlyExpenses > userProfile.monthlyIncome) {
            warnings.push("⚠️ Monthly expenses exceed income - immediate attention required");
        }
        
        if (userProfile.savingsRate < 0) {
            warnings.push("⚠️ Negative savings rate - you're spending more than you earn");
        }
        
        const recentExpenses = transactions.filter(t => 
            t.type === 'expense' && 
            new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        if (recentExpenses.length > 10) {
            warnings.push("⚠️ High frequency of recent expenses - consider reviewing spending patterns");
        }
        
        return warnings.length > 0 ? warnings.join(' ') : "No major financial warnings detected.";
    }

    /**
     * Calculate spending volatility (Coefficient of Variation)
     */
    calculateSpendingVolatility(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        if (expenses.length < 2) return 0;
        
        // Use Math.abs to ensure positive amounts (consistent with other calculations)
        const amounts = expenses.map(t => Math.abs(t.amount));
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        
        // Avoid division by zero
        if (mean === 0) return 0;
        
        // Calculate sample variance (n-1 denominator)
        const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / (amounts.length - 1);
        const stdDev = Math.sqrt(variance);
        
        // Return coefficient of variation (CV) as percentage
        return (stdDev / mean) * 100;
    }

    /**
     * Analyze spending categories
     */
    analyzeSpendingCategories(transactions) {
        const categories = {};
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });
        
        return categories;
    }

    /**
     * Show empty state when no transactions
     */
    showEmptyState() {
        const insightsList = document.getElementById('aiInsightsList');
        insightsList.innerHTML = `
            <div class="ai-insight-item">
                <div class="ai-insight-header">
                    <i class="fas fa-info-circle ai-insight-icon"></i>
                    <span class="ai-insight-title">No Transaction Data</span>
                </div>
                <div class="ai-insight-content">
                    Add some transactions to your WealthEase dashboard to get AI-powered financial insights and predictions.
                </div>
                <span class="ai-insight-confidence">Confidence: 100%</span>
            </div>
        `;
        
        // Update stats to show zero values
        document.getElementById('aiCurrentValue').textContent = '$0.00';
        document.getElementById('aiPredictedChange').textContent = '+0.00%';
        document.getElementById('aiVolatility').textContent = '0.00%';
        document.getElementById('aiNextWeekForecast').textContent = '$0.00';
        document.getElementById('aiNextMonthForecast').textContent = '$0.00';
        document.getElementById('aiConfidenceLevel').textContent = '0%';
        
        // Render empty chart
        this.renderForecastChart();
    }

    /**
     * Load initial data and show dashboard
     */
    async loadInitialData() {
        this.showLoading(true);
        
        try {
            await this.init();
            
            // Load user data from WealthEase
            const userData = await this.loadUserData();
            
            if (userData.transactions.length === 0) {
                // No transactions, show empty state
                this.showEmptyState();
                this.showLoading(false);
                return;
            }
            
            // Try OpenAI analysis first
            try {
                const aiAnalysis = await this.analyzeTransactionsWithOpenAI();
                this.currentData = {
                    userProfile: userData.userProfile,
                    transactions: userData.transactions,
                    aiAnalysis: aiAnalysis
                };
                
                // Update dashboard with AI analysis
                this.updateDashboardWithAI(aiAnalysis);
                this.insights = this.formatAIInsights(aiAnalysis);
                this.updateInsights();
                
                // Render forecast chart
                this.renderForecastChart();
                
            } catch (aiError) {
                console.warn('OpenAI analysis failed, using fallback:', aiError);
                
                // Fallback to mock data analysis
                const mockData = await this.generateMockAnalysis(userData);
                this.currentData = {
                    userProfile: userData.userProfile,
                    transactions: userData.transactions,
                    mockAnalysis: mockData
                };
                
                this.updateDashboardWithMockData(mockData);
                this.insights = this.generateMockInsights(userData);
                this.updateInsights();
                
                // Render forecast chart
                this.renderForecastChart();
            }

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load financial data. Please try again.');
            this.showLoading(false);
        }
    }

    /**
     * Render forecast chart using Chart.js
     */
    renderForecastChart() {
        const ctx = document.getElementById('aiForecastChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.forecastChart) {
            this.forecastChart.destroy();
        }
        
        // Generate chart data based on user transactions
        const chartData = this.generateChartData();
        
        this.forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Historical Balance',
                        data: chartData.historical,
                        borderColor: '#22afa1',
                        backgroundColor: 'rgba(34, 175, 161, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'AI Forecast',
                        data: chartData.forecast,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#dbd3d2',
                            font: {
                                family: 'Poppins, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0a0905',
                        titleColor: '#dbd3d2',
                        bodyColor: '#dbd3d2',
                        borderColor: '#22afa1',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(219, 211, 210, 0.1)'
                        },
                        ticks: {
                            color: '#dbd3d2',
                            font: {
                                family: 'Poppins, sans-serif'
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(219, 211, 210, 0.1)'
                        },
                        ticks: {
                            color: '#dbd3d2',
                            font: {
                                family: 'Poppins, sans-serif'
                            },
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Generate chart data from user transactions
     */
    generateChartData() {
        if (!this.userTransactions || this.userTransactions.length === 0) {
            // Return empty data if no transactions
            return {
                labels: ['No Data'],
                historical: [0],
                forecast: [0]
            };
        }
        
        // Sort transactions by date
        const sortedTransactions = [...this.userTransactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // Get current total balance (same as dashboard)
        const currentTotalBalance = this.calculateTotalBalance(sortedTransactions);
        
        // Generate historical data (last 30 days)
        const historicalData = [];
        const labels = [];
        const today = new Date();
        
        // Create 30 days of historical data
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Calculate balance for this date
            const balance = this.calculateBalanceUpToDate(sortedTransactions, date);
            historicalData.push(balance);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        // Ensure the last historical data point matches current total balance
        if (historicalData.length > 0) {
            historicalData[historicalData.length - 1] = currentTotalBalance;
        }
        
        // Generate forecast data (next 7 days) using current total balance as starting point
        const forecastData = [];
        const forecastLabels = [];
        
        // Start forecast from current total balance (same as dashboard)
        let currentBalance = currentTotalBalance;
        
        // Calculate consistent positive trend for chart (same as dashboard predictions)
        const weeklyPositiveChange = 50; // Minimum $50 weekly growth (same as dashboard)
        const dailyPositiveTrend = weeklyPositiveChange / 7; // Daily positive trend
        
        for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + i);
            
            // Apply consistent positive trend to forecast
            currentBalance += dailyPositiveTrend;
            forecastData.push(currentBalance);
            forecastLabels.push(futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return {
            labels: [...labels, ...forecastLabels],
            historical: [...historicalData, ...Array(7).fill(null)],
            forecast: [...Array(30).fill(null), ...forecastData]
        };
    }

    /**
     * Calculate balance up to a specific date
     */
    calculateBalanceUpToDate(transactions, targetDate) {
        // Use the same calculation method as calculateTotalBalance
        const filteredTransactions = transactions.filter(t => new Date(t.date) <= targetDate);
        
        const totalIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalExpenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return totalIncome - totalExpenses;
    }

    /**
     * Calculate trend from recent data
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const firstValue = data[0];
        const lastValue = data[data.length - 1];
        const days = data.length - 1;
        
        return (lastValue - firstValue) / days;
    }

    /**
     * Calculate advanced trend analysis with multiple methods
     */
    calculateAdvancedTrend(transactions) {
        if (transactions.length < 3) {
            return {
                weeklyChange: 0,
                monthlyChange: 0,
                trendStrength: 0,
                method: 'insufficient_data'
            };
        }

        // Method 1: Simple Moving Average (SMA)
        const smaTrend = this.calculateSMATrend(transactions);
        
        // Method 2: Exponential Moving Average (EMA)
        const emaTrend = this.calculateEMATrend(transactions);
        
        // Method 3: Linear Regression
        const linearTrend = this.calculateLinearRegressionTrend(transactions);
        
        // Combine methods with weights
        const weights = { sma: 0.3, ema: 0.4, linear: 0.3 };
        const combinedTrend = (smaTrend * weights.sma) + (emaTrend * weights.ema) + (linearTrend * weights.linear);
        
        return {
            weeklyChange: combinedTrend * 7,
            monthlyChange: combinedTrend * 30,
            trendStrength: combinedTrend,
            method: 'combined_weighted',
            details: {
                sma: smaTrend,
                ema: emaTrend,
                linear: linearTrend
            }
        };
    }

    /**
     * Calculate Simple Moving Average trend
     */
    calculateSMATrend(transactions) {
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dailyBalances = this.calculateDailyBalances(sortedTransactions);
        
        if (dailyBalances.length < 7) return 0;
        
        const recentSMA = dailyBalances.slice(-7).reduce((sum, balance) => sum + balance, 0) / 7;
        const previousSMA = dailyBalances.slice(-14, -7).reduce((sum, balance) => sum + balance, 0) / 7;
        
        return recentSMA - previousSMA;
    }

    /**
     * Calculate Exponential Moving Average trend
     */
    calculateEMATrend(transactions) {
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dailyBalances = this.calculateDailyBalances(sortedTransactions);
        
        if (dailyBalances.length < 7) return 0;
        
        const alpha = 0.3; // Smoothing factor
        let ema = dailyBalances[0];
        
        for (let i = 1; i < dailyBalances.length; i++) {
            ema = alpha * dailyBalances[i] + (1 - alpha) * ema;
        }
        
        const recentEMA = ema;
        const previousEMA = dailyBalances.slice(-7).reduce((sum, balance) => sum + balance, 0) / 7;
        
        return recentEMA - previousEMA;
    }

    /**
     * Calculate Linear Regression trend
     */
    calculateLinearRegressionTrend(transactions) {
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dailyBalances = this.calculateDailyBalances(sortedTransactions);
        
        if (dailyBalances.length < 3) return 0;
        
        const n = dailyBalances.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = dailyBalances;
        
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        return slope;
    }

    /**
     * Calculate daily balances for trend analysis
     */
    calculateDailyBalances(transactions) {
        const balances = [];
        const startDate = new Date(transactions[0].date);
        const endDate = new Date(transactions[transactions.length - 1].date);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const balance = this.calculateBalanceUpToDate(transactions, new Date(d));
            balances.push(balance);
        }
        
        return balances;
    }

    /**
     * Calculate Financial Health Score
     */
    calculateFinancialHealthScore(userProfile, transactions) {
        let score = 0;
        
        // Savings rate component (40% weight)
        const savingsRate = userProfile.savingsRate;
        if (savingsRate >= 20) score += 40;
        else if (savingsRate >= 10) score += 30;
        else if (savingsRate >= 0) score += 20;
        else score += 0;
        
        // Balance stability component (30% weight)
        const volatility = this.calculateSpendingVolatility(transactions);
        if (volatility < 20) score += 30;
        else if (volatility < 40) score += 20;
        else if (volatility < 60) score += 10;
        else score += 0;
        
        // Income vs expenses component (30% weight)
        if (userProfile.monthlyIncome > userProfile.monthlyExpenses) {
            const ratio = userProfile.monthlyExpenses / userProfile.monthlyIncome;
            if (ratio < 0.5) score += 30;
            else if (ratio < 0.7) score += 20;
            else if (ratio < 0.9) score += 10;
            else score += 5;
        }
        
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Calculate Spending Discipline Score
     */
    calculateSpendingDisciplineScore(userProfile, transactions) {
        let score = 0;
        
        // Consistency component (50% weight)
        const volatility = this.calculateSpendingVolatility(transactions);
        if (volatility < 15) score += 50;
        else if (volatility < 30) score += 40;
        else if (volatility < 50) score += 30;
        else if (volatility < 70) score += 20;
        else score += 10;
        
        // Budget adherence component (30% weight)
        if (userProfile.monthlyIncome > userProfile.monthlyExpenses) {
            const overspendRatio = (userProfile.monthlyExpenses - userProfile.monthlyIncome * 0.8) / userProfile.monthlyIncome;
            if (overspendRatio <= 0) score += 30;
            else if (overspendRatio <= 0.1) score += 20;
            else if (overspendRatio <= 0.2) score += 10;
            else score += 0;
        }
        
        // Category analysis component (20% weight)
        const categories = this.analyzeSpendingCategories(transactions);
        const categoryCount = Object.keys(categories).length;
        if (categoryCount >= 5) score += 20;
        else if (categoryCount >= 3) score += 15;
        else if (categoryCount >= 2) score += 10;
        else score += 5;
        
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Update dashboard with AI analysis
     */
    updateDashboardWithAI(analysis) {
        // Ensure userProfile and totalBalance are valid
        const totalBalance = this.userProfile?.totalBalance || 0;
        
        // Update current value (same as Total Balance from main dashboard)
        // This represents the current financial position based on all transactions
        document.getElementById('aiCurrentValue').textContent = 
            `$${totalBalance.toFixed(2)}`;
        
        // Update predicted change with positive bias
        if (analysis.predictions?.nextWeekBalance) {
            const predictedChange = analysis.predictions.nextWeekBalance - totalBalance;
            // Ensure positive change for motivation
            const positiveChange = Math.max(predictedChange, 50); // Minimum $50 positive change
            // Avoid division by zero and NaN
            const changePercent = totalBalance !== 0 ? 
                (positiveChange / totalBalance) * 100 : 5; // Minimum 5% positive change
            
            // Ensure changePercent is a valid number
            const validChangePercent = isNaN(changePercent) ? 5 : changePercent;
            
            document.getElementById('aiPredictedChange').textContent = 
                `+${validChangePercent.toFixed(2)}%`;
        }
        
        // Update volatility
        if (analysis.score?.volatility) {
            const volatility = analysis.score.volatility;
            const validVolatility = isNaN(volatility) ? 0 : volatility;
            document.getElementById('aiVolatility').textContent = 
                `${validVolatility.toFixed(2)}%`;
        }
        
        // Update forecasts with positive bias
        if (analysis.predictions?.nextWeekBalance) {
            const predictedChange = analysis.predictions.nextWeekBalance - totalBalance;
            const positiveChange = Math.max(predictedChange, 50);
            const adjustedNextWeekBalance = totalBalance + positiveChange;
            
            const validNextWeekBalance = isNaN(adjustedNextWeekBalance) ? totalBalance + 50 : adjustedNextWeekBalance;
            
            document.getElementById('aiNextWeekForecast').textContent = 
                `$${validNextWeekBalance.toFixed(2)}`;
        }
        
        if (analysis.predictions?.nextMonthBalance) {
            const predictedChange = analysis.predictions.nextMonthBalance - totalBalance;
            const positiveChange = Math.max(predictedChange, 200);
            const adjustedNextMonthBalance = totalBalance + positiveChange;
            
            const validNextMonthBalance = isNaN(adjustedNextMonthBalance) ? totalBalance + 200 : adjustedNextMonthBalance;
            
            document.getElementById('aiNextMonthForecast').textContent = 
                `$${validNextMonthBalance.toFixed(2)}`;
        }
        
        // Update confidence with high value for motivation
        if (analysis.score?.confidence) {
            const confidence = analysis.score.confidence;
            const validConfidence = isNaN(confidence) ? 90 : Math.min(100, confidence + 10);
            document.getElementById('aiConfidenceLevel').textContent = 
                `${validConfidence.toFixed(0)}%`;
        }
    }

    /**
     * Update dashboard with mock data (fallback)
     */
    updateDashboardWithMockData(mockData) {
        // Ensure userProfile and totalBalance are valid
        const totalBalance = this.userProfile?.totalBalance || 0;
        
        // Update current value (same as Total Balance from main dashboard)
        // This represents the current financial position based on all transactions
        document.getElementById('aiCurrentValue').textContent = 
            `$${totalBalance.toFixed(2)}`;
        
        // Update predicted change with positive bias
        if (mockData.predictions?.nextWeekBalance) {
            const predictedChange = mockData.predictions.nextWeekBalance - totalBalance;
            // Ensure positive change for motivation
            const positiveChange = Math.max(predictedChange, 50); // Minimum $50 positive change
            // Avoid division by zero and NaN
            const changePercent = totalBalance !== 0 ? 
                (positiveChange / totalBalance) * 100 : 5; // Minimum 5% positive change
            
            // Ensure changePercent is a valid number
            const validChangePercent = isNaN(changePercent) ? 5 : changePercent;
            
            document.getElementById('aiPredictedChange').textContent = 
                `+${validChangePercent.toFixed(2)}%`;
        }
        
        // Update volatility
        if (mockData.score?.volatility) {
            const volatility = mockData.score.volatility;
            const validVolatility = isNaN(volatility) ? 0 : volatility;
            document.getElementById('aiVolatility').textContent = 
                `${validVolatility.toFixed(2)}%`;
        }
        
        // Update forecasts with positive bias
        if (mockData.predictions?.nextWeekBalance) {
            const predictedChange = mockData.predictions.nextWeekBalance - totalBalance;
            const positiveChange = Math.max(predictedChange, 50);
            const adjustedNextWeekBalance = totalBalance + positiveChange;
            
            const validNextWeekBalance = isNaN(adjustedNextWeekBalance) ? totalBalance + 50 : adjustedNextWeekBalance;
            
            document.getElementById('aiNextWeekForecast').textContent = 
                `$${validNextWeekBalance.toFixed(2)}`;
        }
        
        if (mockData.predictions?.nextMonthBalance) {
            const predictedChange = mockData.predictions.nextMonthBalance - totalBalance;
            const positiveChange = Math.max(predictedChange, 200);
            const adjustedNextMonthBalance = totalBalance + positiveChange;
            
            const validNextMonthBalance = isNaN(adjustedNextMonthBalance) ? totalBalance + 200 : adjustedNextMonthBalance;
            
            document.getElementById('aiNextMonthForecast').textContent = 
                `$${validNextMonthBalance.toFixed(2)}`;
        }
        
        // Update confidence with high value for motivation
        if (mockData.score?.confidence) {
            const confidence = mockData.score.confidence;
            const validConfidence = isNaN(confidence) ? 90 : Math.min(100, confidence + 10);
            document.getElementById('aiConfidenceLevel').textContent = 
                `${validConfidence.toFixed(0)}%`;
        }
    }

    /**
     * Format AI insights for display
     */
    formatAIInsights(analysis) {
        const insights = [];
        
        // Analysis insights
        if (analysis.analysis) {
            insights.push({
                type: 'analysis',
                title: 'AI Financial Analysis',
                content: analysis.analysis,
                confidence: analysis.score?.confidence || 85,
                icon: 'fas fa-chart-line',
                priority: 'high'
            });
        }
        
        // Recommendations
        if (analysis.recommendations) {
            insights.push({
                type: 'recommendations',
                title: 'AI Recommendations',
                content: analysis.recommendations,
                confidence: analysis.score?.confidence || 80,
                icon: 'fas fa-lightbulb',
                priority: 'high'
            });
        }
        
        // Warnings
        if (analysis.warnings && analysis.warnings !== "No major financial warnings detected.") {
            insights.push({
                type: 'warnings',
                title: 'Financial Warnings',
                content: analysis.warnings,
                confidence: 90,
                icon: 'fas fa-exclamation-triangle',
                priority: 'high'
            });
        }
        
        // Predictions
        if (analysis.predictions?.summary) {
            insights.push({
                type: 'predictions',
                title: 'Future Predictions',
                content: analysis.predictions.summary,
                confidence: analysis.score?.confidence || 75,
                icon: 'fas fa-crystal-ball',
                priority: 'medium'
            });
        }
        
        // Financial Health Score
        if (analysis.score?.financialHealth) {
            const healthScore = analysis.score.financialHealth;
            let healthStatus = 'Good';
            let healthIcon = 'fas fa-heart';
            
            if (healthScore >= 80) {
                healthStatus = 'Excellent';
                healthIcon = 'fas fa-heart';
            } else if (healthScore >= 60) {
                healthStatus = 'Good';
                healthIcon = 'fas fa-heart';
            } else if (healthScore >= 40) {
                healthStatus = 'Fair';
                healthIcon = 'fas fa-exclamation-circle';
            } else {
                healthStatus = 'Poor';
                healthIcon = 'fas fa-exclamation-triangle';
            }
            
            insights.push({
                type: 'score',
                title: `Financial Health: ${healthStatus}`,
                content: `Your financial health score is ${healthScore.toFixed(0)}/100. ${healthScore >= 80 ? 'Keep up the excellent work!' : healthScore >= 60 ? 'You\'re doing well, but there\'s room for improvement.' : 'Consider implementing the recommendations above to improve your financial health.'}`,
                confidence: 95,
                icon: healthIcon,
                priority: 'high'
            });
        }
        
        return insights;
    }

    /**
     * Generate mock insights for fallback
     */
    generateMockInsights(userData) {
        const { userProfile, transactions } = userData;
        const insights = [];
        
        // Basic analysis
        insights.push({
            type: 'analysis',
            title: 'Transaction Analysis',
            content: `You have ${transactions.length} transactions with a ${userProfile.savingsRate.toFixed(1)}% savings rate. ${userProfile.savingsRate > 20 ? 'Excellent financial discipline!' : userProfile.savingsRate > 10 ? 'Good savings habits.' : 'Consider increasing your savings rate.'}`,
            confidence: 75,
            icon: 'fas fa-chart-line',
            priority: 'high'
        });
        
        // Recommendations
        const recommendations = this.generateMockRecommendations(userProfile, transactions);
        insights.push({
            type: 'recommendations',
            title: 'Recommendations',
            content: recommendations,
            confidence: 70,
            icon: 'fas fa-lightbulb',
            priority: 'high'
        });
        
        // Warnings
        const warnings = this.generateMockWarnings(userProfile, transactions);
        if (warnings !== "No major financial warnings detected.") {
            insights.push({
                type: 'warnings',
                title: 'Financial Warnings',
                content: warnings,
                confidence: 85,
                icon: 'fas fa-exclamation-triangle',
                priority: 'high'
            });
        }
        
        return insights;
    }

    /**
     * Update insights display
     */
    updateInsights() {
        const insightsList = document.getElementById('aiInsightsList');
        insightsList.innerHTML = '';
        
        this.insights.forEach((insight, index) => {
            const insightElement = document.createElement('div');
            insightElement.className = 'ai-insight-item';
            insightElement.style.animationDelay = `${index * 0.1}s`;
            
            insightElement.innerHTML = `
                <div class="ai-insight-header">
                    <i class="${insight.icon} ai-insight-icon"></i>
                    <span class="ai-insight-title">${insight.title}</span>
                </div>
                <div class="ai-insight-content">${insight.content}</div>
                <span class="ai-insight-confidence">Confidence: ${insight.confidence.toFixed(0)}%</span>
            `;
            
            insightsList.appendChild(insightElement);
        });
    }

    /**
     * Show loading state
     */
    showLoading(show) {
        const loadingState = document.getElementById('aiLoadingState');
        const dashboardContent = document.getElementById('aiDashboardContent');
        
        if (show) {
            loadingState.style.display = 'flex';
            dashboardContent.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
            dashboardContent.style.display = 'block';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('AI Finance Error:', message);
        // You can implement a notification system here
    }

    /**
     * Refresh data
     */
    async refreshData() {
        const refreshBtn = document.getElementById('aiRefreshBtn');
        const originalHTML = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        refreshBtn.disabled = true;
        
        try {
            await this.loadInitialData();
        } finally {
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
        }
    }

    /**
     * Generate new insights
     */
    generateNewInsights() {
        if (!this.currentData) return;
        
        const generateBtn = document.getElementById('aiGenerateInsights');
        const originalHTML = generateBtn.innerHTML;
        
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        generateBtn.disabled = true;
        
        setTimeout(() => {
            if (this.currentData.aiAnalysis) {
                this.insights = this.formatAIInsights(this.currentData.aiAnalysis);
            } else if (this.currentData.mockAnalysis) {
                this.insights = this.generateMockInsights({
                    userProfile: this.currentData.userProfile,
                    transactions: this.currentData.transactions
                });
            }
            this.updateInsights();
            
            generateBtn.innerHTML = originalHTML;
            generateBtn.disabled = false;
        }, 1500);
    }

    /**
     * Calculate financial metrics from transactions
     */
    calculateTotalBalance(transactions) {
        // Use the same calculation method as dashboard.js with NaN protection
        if (!transactions || !Array.isArray(transactions)) return 0;
        
        const totalIncome = transactions
            .filter(t => t.type === 'income' && !isNaN(t.amount))
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense' && !isNaN(t.amount))
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const result = totalIncome - totalExpenses;
        return isNaN(result) ? 0 : result;
    }

    calculateMonthlyIncome(transactions) {
        if (!transactions || !Array.isArray(transactions)) return 0;
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Calculate average monthly income from last 3 months for better accuracy
        const monthlyIncomes = [];
        
        for (let i = 0; i < 3; i++) {
            const targetDate = new Date(currentYear, currentMonth - i, 1);
            const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
            
            const monthlyIncome = transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return t.type === 'income' && 
                           !isNaN(t.amount) &&
                           transactionDate >= targetDate && 
                           transactionDate < nextMonth;
                })
                .reduce((total, t) => total + Math.abs(t.amount), 0);
            
            monthlyIncomes.push(monthlyIncome);
        }
        
        // Return weighted average (more recent months have higher weight)
        const weights = [0.5, 0.3, 0.2];
        const result = monthlyIncomes.reduce((sum, income, index) => sum + (income * weights[index]), 0);
        return isNaN(result) ? 0 : result;
    }

    calculateMonthlyExpenses(transactions) {
        if (!transactions || !Array.isArray(transactions)) return 0;
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Calculate average monthly expenses from last 3 months for better accuracy
        const monthlyExpenses = [];
        
        for (let i = 0; i < 3; i++) {
            const targetDate = new Date(currentYear, currentMonth - i, 1);
            const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
            
            const monthlyExpense = transactions
                .filter(t => {
                    const transactionDate = new Date(t.date);
                    return t.type === 'expense' && 
                           !isNaN(t.amount) &&
                           transactionDate >= targetDate && 
                           transactionDate < nextMonth;
                })
                .reduce((total, t) => total + Math.abs(t.amount), 0);
            
            monthlyExpenses.push(monthlyExpense);
        }
        
        // Return weighted average (more recent months have higher weight)
        const weights = [0.5, 0.3, 0.2];
        const result = monthlyExpenses.reduce((sum, expense, index) => sum + (expense * weights[index]), 0);
        return isNaN(result) ? 0 : result;
    }
}

// Global AI Finance instance
let aiFinanceIntegration = null;

// Global functions for modal control
function openAIFinanceModal() {
    const modal = document.getElementById('aiFinanceModal');
    modal.style.display = 'flex';
    
    // Initialize AI Finance if not already done
    if (!aiFinanceIntegration) {
        aiFinanceIntegration = new AIFinanceIntegration();
    }
    
    // Load data when modal opens
    aiFinanceIntegration.loadInitialData();
    
    // Set up event listeners
    document.getElementById('aiRefreshBtn').addEventListener('click', () => {
        aiFinanceIntegration.refreshData();
    });
    
    document.getElementById('aiGenerateInsights').addEventListener('click', () => {
        aiFinanceIntegration.generateNewInsights();
    });
}

function closeAIFinanceModal() {
    const modal = document.getElementById('aiFinanceModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('aiFinanceModal');
    if (e.target === modal) {
        closeAIFinanceModal();
    }
});