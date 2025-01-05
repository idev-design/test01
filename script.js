// User credentials
const VALID_USER = {
    username: 'user',
    password: 'abcd@123'
};

// Exchange rates (sample rates)
const EXCHANGE_RATES = {
    INR: 1,
    USD: 83.28,
    EUR: 89.71
};

let currentCurrency = 'INR';
let expenses = [];
let selectedCurrency = 'INR';

// DOM Elements
const loginContainer = document.getElementById('login-container');
const expenseContainer = document.getElementById('expense-container');
const loginForm = document.getElementById('login-form');
const expenseForm = document.getElementById('expense-form');
const currencySelect = document.getElementById('currency');
const logoutBtn = document.getElementById('logout');
const addMemberBtn = document.getElementById('add-member');
const splitMembers = document.getElementById('split-members');
const expensesBody = document.getElementById('expenses-body');
const settlementsList = document.getElementById('settlements-list');

// Load data from localStorage
function loadData() {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
        updateExpenseTable();
        calculateSettlements();
        updateSummary();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Login handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === VALID_USER.username && password === VALID_USER.password) {
        loginContainer.classList.add('hidden');
        expenseContainer.classList.remove('hidden');
        loadData();
    } else {
        alert('Invalid credentials!');
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    loginContainer.classList.remove('hidden');
    expenseContainer.classList.add('hidden');
    loginForm.reset();
});

// Currency change handler
currencySelect.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    updateExpenseTable();
    updateSummary();
});

// Add member field
addMemberBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'split-member';
    input.placeholder = 'Enter name';
    splitMembers.appendChild(input);
});

// Add expense handler
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    const splitWith = Array.from(document.getElementsByClassName('split-member'))
        .map(input => input.value.trim())
        .filter(name => name !== '');

    const expense = {
        id: Date.now(),
        description,
        amount,
        category,
        date,
        currency: currentCurrency,
        splitWith,
        createdAt: new Date().toISOString()
    };

    expenses.push(expense);
    saveData();
    updateExpenseTable();
    calculateSettlements();
    updateSummary();
    expenseForm.reset();
    
    // Reset split members
    splitMembers.innerHTML = '';
    const defaultInput = document.createElement('input');
    defaultInput.type = 'text';
    defaultInput.className = 'split-member';
    defaultInput.placeholder = 'Enter name';
    splitMembers.appendChild(defaultInput);
});

// Convert currency
function convertCurrency(amount, fromCurrency, toCurrency) {
    const inINR = amount * EXCHANGE_RATES[fromCurrency];
    return inINR / EXCHANGE_RATES[toCurrency];
}

// Update expense table
function updateExpenseTable() {
    expensesBody.innerHTML = '';
    
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(expense => {
        const row = document.createElement('tr');
        const convertedAmount = convertCurrency(expense.amount, expense.currency, currentCurrency);
        
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${currentCurrency} ${convertedAmount.toFixed(2)}</td>
            <td>${expense.splitWith.join(', ')}</td>
            <td>
                <button onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        
        expensesBody.appendChild(row);
    });
}

// Delete expense
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveData();
    updateExpenseTable();
    calculateSettlements();
    updateSummary();
}

// Calculate settlements
function calculateSettlements() {
    const balances = {};
    
    expenses.forEach(expense => {
        const amount = convertCurrency(expense.amount, expense.currency, currentCurrency);
        const splitAmount = amount / (expense.splitWith.length + 1);
        
        expense.splitWith.forEach(person => {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= splitAmount;
        });
    });

    settlementsList.innerHTML = '';
    Object.entries(balances).forEach(([person, amount]) => {
        const settlement = document.createElement('div');
        settlement.className = 'settlement-item';
        settlement.textContent = `${person} ${amount > 0 ? 'owes' : 'is owed'} ${currentCurrency} ${Math.abs(amount).toFixed(2)}`;
        settlementsList.appendChild(settlement);
    });
}

// Update summary
function updateSummary() {
    const totalExpenses = expenses.reduce((sum, expense) => {
        return sum + convertCurrency(expense.amount, expense.currency, currentCurrency);
    }, 0);

    const monthlyExpenses = {};
    expenses.forEach(expense => {
        const month = expense.date.substring(0, 7);
        if (!monthlyExpenses[month]) monthlyExpenses[month] = 0;
        monthlyExpenses[month] += convertCurrency(expense.amount, expense.currency, currentCurrency);
    });

    const months = Object.keys(monthlyExpenses).length || 1;
    const monthlyAverage = totalExpenses / months;

    document.getElementById('total-expenses').textContent = 
        `${currentCurrency} ${totalExpenses.toFixed(2)}`;
    document.getElementById('monthly-average').textContent = 
        `${currentCurrency} ${monthlyAverage.toFixed(2)}`;
}

// ... (previous code remains the same)

// Initialize the application
loadData();

// Generate expense report
function generateExpenseReport() {
    const report = {
        totalExpenses: 0,
        categoryBreakdown: {},
        monthlyBreakdown: {},
        individualExpenses: {},
        currency: currentCurrency
    };

    expenses.forEach(expense => {
        const amount = convertCurrency(expense.amount, expense.currency, currentCurrency);
        
        // Total expenses
        report.totalExpenses += amount;

        // Category breakdown
        if (!report.categoryBreakdown[expense.category]) {
            report.categoryBreakdown[expense.category] = 0;
        }
        report.categoryBreakdown[expense.category] += amount;

        // Monthly breakdown
        const month = expense.date.substring(0, 7);
        if (!report.monthlyBreakdown[month]) {
            report.monthlyBreakdown[month] = 0;
        }
        report.monthlyBreakdown[month] += amount;

        // Individual expenses
        const splitAmount = amount / (expense.splitWith.length + 1);
        expense.splitWith.forEach(person => {
            if (!report.individualExpenses[person]) {
                report.individualExpenses[person] = {
                    totalOwed: 0,
                    expenses: []
                };
            }
            report.individualExpenses[person].totalOwed += splitAmount;
            report.individualExpenses[person].expenses.push({
                date: expense.date,
                description: expense.description,
                amount: splitAmount
            });
        });
    });

    return report;
}

// Export expenses to JSON file
function exportExpenses() {
    const report = generateExpenseReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `expense-report-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import expenses from JSON file
function importExpenses(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (validateImportedData(importedData)) {
                expenses = importedData;
                saveData();
                updateExpenseTable();
                calculateSettlements();
                updateSummary();
                alert('Expenses imported successfully!');
            } else {
                alert('Invalid file format!');
            }
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Validate imported data
function validateImportedData(data) {
    // Basic validation of imported data structure
    if (!Array.isArray(data)) return false;
    
    return data.every(expense => {
        return (
            expense.id &&
            expense.description &&
            typeof expense.amount === 'number' &&
            expense.category &&
            expense.date &&
            expense.currency &&
            Array.isArray(expense.splitWith)
        );
    });
}

// Filter expenses
function filterExpenses(filters) {
    let filteredExpenses = [...expenses];

    if (filters.startDate) {
        filteredExpenses = filteredExpenses.filter(expense => 
            expense.date >= filters.startDate
        );
    }

    if (filters.endDate) {
        filteredExpenses = filteredExpenses.filter(expense => 
            expense.date <= filters.endDate
        );
    }

    if (filters.category && filters.category !== 'All') {
        filteredExpenses = filteredExpenses.filter(expense => 
            expense.category === filters.category
        );
    }

    if (filters.minAmount) {
        filteredExpenses = filteredExpenses.filter(expense => 
            convertCurrency(expense.amount, expense.currency, currentCurrency) >= filters.minAmount
        );
    }

    if (filters.maxAmount) {
        filteredExpenses = filteredExpenses.filter(expense => 
            convertCurrency(expense.amount, expense.currency, currentCurrency) <= filters.maxAmount
        );
    }

    return filteredExpenses;
}

// Calculate category-wise statistics
function calculateCategoryStats() {
    const stats = {};
    const total = expenses.reduce((sum, expense) => 
        sum + convertCurrency(expense.amount, expense.currency, currentCurrency), 0
    );

    expenses.forEach(expense => {
        const amount = convertCurrency(expense.amount, expense.currency, currentCurrency);
        if (!stats[expense.category]) {
            stats[expense.category] = {
                total: 0,
                count: 0,
                percentage: 0
            };
        }
        stats[expense.category].total += amount;
        stats[expense.category].count++;
    });

    // Calculate percentages
    Object.keys(stats).forEach(category => {
        stats[category].percentage = (stats[category].total / total * 100).toFixed(2);
    });

    return stats;
}

// Update exchange rates
async function updateExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        const data = await response.json();
        if (data.rates) {
            Object.keys(EXCHANGE_RATES).forEach(currency => {
                EXCHANGE_RATES[currency] = data.rates[currency];
            });
            updateExpenseTable();
            calculateSettlements();
            updateSummary();
        }
    } catch (error) {
        console.error('Error updating exchange rates:', error);
    }
}

// Backup data to localStorage
function backupData() {
    const backup = {
        expenses,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    localStorage.setItem('expenseTrackerBackup', JSON.stringify(backup));
}

// Restore data from backup
function restoreFromBackup() {
    const backup = localStorage.getItem('expenseTrackerBackup');
    if (backup) {
        try {
            const data = JSON.parse(backup);
            expenses = data.expenses;
            saveData();
            updateExpenseTable();
            calculateSettlements();
            updateSummary();
            alert('Data restored successfully!');
        } catch (error) {
            alert('Error restoring backup: ' + error.message);
        }
    } else {
        alert('No backup found!');
    }
}

// Auto-save data periodically
setInterval(backupData, 5 * 60 * 1000); // Every 5 minutes

// Update exchange rates periodically
setInterval(updateExchangeRates, 60 * 60 * 1000); // Every hour

// Initialize tooltips for better user experience
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseover', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.top = rect.bottom + 5 + 'px';
            tooltip.style.left = rect.left + 'px';
        });

        element.addEventListener('mouseout', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeTooltips();
    updateExchangeRates();
});

// Error handling wrapper
function handleError(fn) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error('An error occurred:', error);
            alert('An error occurred. Please try again.');
        }
    };
}

// Wrap all event handlers with error handling
const safeHandlers = {
    deleteExpense: handleError(deleteExpense),
    exportExpenses: handleError(exportExpenses),
    importExpenses: handleError(importExpenses),
    calculateSettlements: handleError(calculateSettlements),
    updateSummary: handleError(updateSummary)
};

// Event listeners for the new features
document.getElementById('export-btn')?.addEventListener('click', safeHandlers.exportExpenses);
document.getElementById('import-input')?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        safeHandlers.importExpenses(e.target.files[0]);
    }
});
