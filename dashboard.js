// Form visibility 
let addBtn = document.querySelector(".add-transaction-btn");
let transactionForm = document.querySelector(".transaction-form-div");
let closeBtn = document.querySelector(".close-form");
let isFormOpen = false;

addBtn.addEventListener("click", () => {
    // Show overlay first
    overlay.style.display = 'block';
    
    // Animate overlay
    gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.1 }
    );
    
    // Show form first, then animate
    transactionForm.style.visibility = "visible";
    transactionForm.style.opacity = "0";
    transactionForm.style.transform = "scale(0.95)";
    
    // Animate form to full size
    gsap.to(transactionForm, {
        scale: 1,
        opacity: 1,
        duration: 0.1,
        ease: "power2.out"
    });
    
    isFormOpen = true;
});

closeBtn.addEventListener("click", () => {
    // Animate out - shrink and fade
    gsap.to(transactionForm, {
        scale: 0.95,
        opacity: 0,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
            // Hide form
            transactionForm.style.visibility = "hidden";
            transactionForm.style.opacity = "0";
            transactionForm.style.transform = "scale(1)";
            
            // Hide overlay
            overlay.style.display = 'none';
        }
    });
    
    // Animate overlay out
    gsap.to(overlay, {
        opacity: 0,
        duration: 0.1
    });
    
    isFormOpen = false;
});





function updateNavbarGlass() {
    const navbar = document.querySelector('.dashboard-navbar');
    if (window.innerWidth < 460) {
      navbar.classList.add('glass');
    } else {
      navbar.classList.remove('glass');
    }
  }
  window.addEventListener('resize', updateNavbarGlass);
  window.addEventListener('DOMContentLoaded', updateNavbarGlass);


// Form functionality
const form = document.getElementById('transaction-form');
const description = document.getElementById('description');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const date = document.getElementById('date');
const list = document.getElementById('transaction-list');
const showIncome = document.getElementById('income-amount');
const showExpense = document.getElementById('expense-amount');
const showBalance = document.getElementById('balance-amount');

let transactionList = [];
let income = 0;
let expense = 0;

// Chart instances
let pieChart, barChart, lineChart;

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// IndexedDB setup
let db;
const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Database error');
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('type', 'type', { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

function getAllTransactions() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onerror = (event) => {
            reject('Error fetching transactions');
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

function addTransaction(transaction) {
    return new Promise((resolve, reject) => {
        const transactionDB = db.transaction(STORE_NAME, 'readwrite');
        const store = transactionDB.objectStore(STORE_NAME);
        const request = store.add(transaction);
        
        request.onerror = (event) => {
            reject('Error adding transaction');
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

function deleteTransaction(id) {
    return new Promise((resolve, reject) => {
        const transactionDB = db.transaction(STORE_NAME, 'readwrite');
        const store = transactionDB.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onerror = (event) => {
            reject('Error deleting transaction');
        };
        
        request.onsuccess = (event) => {
            resolve();
        };
    });
}

function initCharts() {
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(29, 233, 182, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(29, 233, 182, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: '#ffffff', 
                        font: { size: 12, weight: 'bold' },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(29, 233, 182, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Income',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(29, 233, 182, 0.8)',
                borderColor: 'rgba(29, 233, 182, 1)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
                hoverBackgroundColor: 'rgba(29, 233, 182, 1)',
                hoverBorderColor: 'rgba(29, 233, 182, 1)',
                hoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(29, 233, 182, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            return `Income: ₹${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#ffffff',
                        font: { size: 10 },
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#ffffff',
                        font: { size: 10 }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    const lineCtx = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Expenses',
                data: Array(12).fill(0),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 99, 132, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            return `Expense: ₹${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#ffffff',
                        font: { size: 10 },
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#ffffff',
                        font: { size: 10 }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}


function updateCharts() {
    const incomeByMonthYear = {};
    const expenseByMonthYear = {};

    transactionList.forEach(tx => {
        const dateObj = new Date(tx.date);
        const monthYear = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

        if (tx.type === 'income') {
            incomeByMonthYear[monthYear] = (incomeByMonthYear[monthYear] || 0) + tx.amount;
        } else {
            expenseByMonthYear[monthYear] = (expenseByMonthYear[monthYear] || 0) + tx.amount;
        }
    });

    // Create unified sorted label list
    const allLabels = Array.from(new Set([
        ...Object.keys(incomeByMonthYear),
        ...Object.keys(expenseByMonthYear)
    ])).sort((a, b) => new Date(a) - new Date(b)); // Sort chronologically

    // Prepare income and expense data
    const incomeData = allLabels.map(label => incomeByMonthYear[label] || 0);
    const expenseData = allLabels.map(label => expenseByMonthYear[label] || 0);

    // Update bar chart
    barChart.data.labels = allLabels;
    barChart.data.datasets[0].data = incomeData;
    barChart.update();

    // Update line chart
    lineChart.data.labels = allLabels;
    lineChart.data.datasets[0].data = expenseData;
    lineChart.update();

    // Update pie chart with total income vs expense
    const totalIncome = incomeData.reduce((a, b) => a + b, 0);
    const totalExpense = expenseData.reduce((a, b) => a + b, 0);
    pieChart.data.datasets[0].data = [totalIncome, totalExpense];
    pieChart.update();
    // Custom legend update
    const legendContainer = document.getElementById('pieLegend');
    if (legendContainer) {
        // legendContainer.innerHTML = pieChart.generateLegend();
    }
}

function renderTransaction(transaction) {
    const div = document.createElement('div');
    div.className = `relative flex items-center justify-between mb-3 p-3 rounded-lg shadow-md bg-[#17223b] border-l-4 ${
        transaction.type === 'income' ? 'border-green-400' : 'border-red-400'
    }`;
    div.dataset.id = transaction.id;

    div.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
          ${transaction.type === 'income' ? '⬆️' : '⬇️'}
        </span>
        <div class="leading-tight">
          <div class="font-semibold text-white text-sm">${transaction.description}</div>
          <div class="text-[0.7rem] text-blue-200">${transaction.date}</div>
        </div>
      </div>
      <div class="text-right mr-[31px] flex flex-col justify-center leading-tight">
        <div class="text-sm font-bold ${transaction.type === 'income' ? 'text-green-300' : 'text-red-300'} whitespace-nowrap">
          ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
        </div>
        <div class="text-[0.7rem] text-blue-300">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</div>
      </div>
    `;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '&times;';
    deleteBtn.className = 'absolute right-1 sm:right-2 text-red-400 hover:text-red-600 text-md font-bold bg-[#17223b] rounded-full w-6 h-6 flex items-center justify-center shadow-md';
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await deleteTransaction(transaction.id);
            div.remove();

            transactionList = transactionList.filter(tx => tx.id !== transaction.id);

            if (transaction.type === 'income') {
                income -= transaction.amount;
            } else {
                expense -= transaction.amount;
            }
            const balance = income - expense;
            showIncome.textContent = `₹${income.toFixed(2)}`;
            showExpense.textContent = `₹${expense.toFixed(2)}`;
            showBalance.textContent = `₹${balance.toFixed(2)}`;

            updateCharts();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('❌ Failed to delete transaction. Please try again.');
        }
    });

    div.appendChild(deleteBtn);
    list.prepend(div);
}


async function loadTransactions() {
    try {
        const transactions = await getAllTransactions();
        transactionList = transactions;
        
        // Reset totals
        income = 0;
        expense = 0;
        
        // Clear the list
        list.innerHTML = '';
        
        // Render each transaction and calculate totals
        transactions.forEach(tx => {
            renderTransaction(tx);
            
            if (tx.type === 'income') {
                income += tx.amount;
            } else {
                expense += tx.amount;
            }
        });
        
        // Update totals display
        const balance = income - expense;
        showIncome.textContent = `₹${income.toFixed(2)}`;
        showExpense.textContent = `₹${expense.toFixed(2)}`;
        showBalance.textContent = `₹${balance.toFixed(2)}`;
        
        // Update charts
        updateCharts();
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const enteredDate = new Date(date.value);
    const today = new Date();
    today.setHours(24, 0, 0, 0);

    if (!date.value || isNaN(enteredDate.getTime())) {
        alert("❌ Please enter a valid date.");
        return;
    }

    if (enteredDate > today) {
        alert("❌ Date cannot be in the future.");
        return;
    }

    const transaction = {
        description: description.value.trim(),
        amount: parseFloat(amount.value),
        type: type.value,
        date: date.value
    };

    if (!transaction.description || isNaN(transaction.amount) || !transaction.date) {
        alert("❌ Please fill all required fields correctly.");
        return;
    }

    try {
        // Add to IndexedDB
        const id = await addTransaction(transaction);
        transaction.id = id;
        
        // Add to local array
        transactionList.push(transaction);
        
        // Render the transaction
        renderTransaction(transaction);

        // Update balance, income, and expense cards
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }

        const balance = income - expense;
        showIncome.textContent = `₹${income.toFixed(2)}`;
        showExpense.textContent = `₹${expense.toFixed(2)}`;
        showBalance.textContent = `₹${balance.toFixed(2)}`;

        form.reset();
        updateCharts();

        // Close form with overlay effect
        gsap.to(transactionForm, {
            scale: 0.95,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                // Hide form
                transactionForm.style.visibility = "hidden";
                transactionForm.style.opacity = "0";
                transactionForm.style.transform = "scale(1)";
                
                // Hide overlay
                overlay.style.display = 'none';
            }
        });
        
        // Animate overlay out
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.3
        });
        
        isFormOpen = false;
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('❌ Failed to save transaction. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', async function () {
    try {
        await initDB();
        initCharts();
        await loadTransactions();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('❌ Failed to initialize the application. Please refresh the page.');
    }
});


// Filter elements
const filterType = document.getElementById('filter-type');
const filterDate = document.getElementById('filter-date');
const customDateRange = document.getElementById('custom-date-range');
const startDate = document.getElementById('start-date');
const endDate = document.getElementById('end-date');
const applyFilter = document.getElementById('apply-filter');
const resetFilter = document.getElementById('reset-filter');

// Custom date range ko by default disable karo
startDate.disabled = true;
endDate.disabled = true;

// Jab filter-date me 'custom' select ho tab enable karo, warna disable hi rakho
defaultDateRangeHandler();
filterDate.addEventListener('change', defaultDateRangeHandler);

function defaultDateRangeHandler() {
    if (filterDate.value === 'custom') {
        startDate.disabled = false;
        endDate.disabled = false;
    } else {
        startDate.disabled = true;
        endDate.disabled = true;
    }
}

// Filter transactions function
function filterTransactions() {
    const typeFilter = filterType.value;
    const dateFilter = filterDate.value;
    
    let filteredTransactions = [...transactionList];
    
    // Apply type filter
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(dateFilter) {
            case 'today':
                filteredTransactions = filteredTransactions.filter(tx => {
                    const txDate = new Date(tx.date);
                    return txDate.toDateString() === today.toDateString();
                });
                break;
                
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                
                filteredTransactions = filteredTransactions.filter(tx => {
                    const txDate = new Date(tx.date);
                    return txDate >= weekStart && txDate <= today;
                });
                break;
                
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                
                filteredTransactions = filteredTransactions.filter(tx => {
                    const txDate = new Date(tx.date);
                    return txDate >= monthStart && txDate <= today;
                });
                break;
                
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                
                filteredTransactions = filteredTransactions.filter(tx => {
                    const txDate = new Date(tx.date);
                    return txDate >= yearStart && txDate <= today;
                });
                break;
                
            case 'custom':
                if (startDate.value && endDate.value) {
                    const start = new Date(startDate.value);
                    const end = new Date(endDate.value);
                    end.setHours(23, 59, 59, 999); // Include entire end day
                    
                    filteredTransactions = filteredTransactions.filter(tx => {
                        const txDate = new Date(tx.date);
                        return txDate >= start && txDate <= end;
                    });
                }
                break;
        }
    }
    
    return filteredTransactions;
}

// Apply filter and update UI
function applyFilters() {
        // Custom range select hai aur date nahi dala hai to alert dikhao
    if (filterDate.value === 'custom' && (!startDate.value || !endDate.value)) {
        alert('Select the date range');
        return;
    }
    const filteredTransactions = filterTransactions();
    
    // Clear current list
    list.innerHTML = '';
    
    // Reset totals for filtered view
    let filteredIncome = 0;
    let filteredExpense = 0;
    
    // Render filtered transactions
    filteredTransactions.forEach(tx => {
        renderTransaction(tx);
        
        if (tx.type === 'income') {
            filteredIncome += tx.amount;
        } else {
            filteredExpense += tx.amount;
        }
    });
    
    const filteredBalance = filteredIncome - filteredExpense;
    
    // Update displayed totals (you might want to indicate these are filtered totals)
    showIncome.textContent = `₹${filteredIncome.toFixed(2)}`;
    showExpense.textContent = `₹${filteredExpense.toFixed(2)}`;
    showBalance.textContent = `₹${filteredBalance.toFixed(2)}`;
    
    // Update charts with filtered data
    updateFilteredCharts(filteredTransactions);
}

// Update charts with filtered data
function updateFilteredCharts(filteredTransactions) {
    const incomeByMonthYear = {};
    const expenseByMonthYear = {};

    filteredTransactions.forEach(tx => {
        const dateObj = new Date(tx.date);
        const monthYear = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

        if (tx.type === 'income') {
            incomeByMonthYear[monthYear] = (incomeByMonthYear[monthYear] || 0) + tx.amount;
        } else {
            expenseByMonthYear[monthYear] = (expenseByMonthYear[monthYear] || 0) + tx.amount;
        }
    });

    // Create unified sorted label list
    const allLabels = Array.from(new Set([
        ...Object.keys(incomeByMonthYear),
        ...Object.keys(expenseByMonthYear)
    ])).sort((a, b) => new Date(a) - new Date(b));

    // Prepare income and expense data
    const incomeData = allLabels.map(label => incomeByMonthYear[label] || 0);
    const expenseData = allLabels.map(label => expenseByMonthYear[label] || 0);

    // Update bar chart
    barChart.data.labels = allLabels;
    barChart.data.datasets[0].data = incomeData;
    barChart.update();

    // Update line chart
    lineChart.data.labels = allLabels;
    lineChart.data.datasets[0].data = expenseData;
    lineChart.update();

    // Update pie chart with total income vs expense
    const totalIncome = incomeData.reduce((a, b) => a + b, 0);
    const totalExpense = expenseData.reduce((a, b) => a + b, 0);
    pieChart.data.datasets[0].data = [totalIncome, totalExpense];
    pieChart.update();
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
        type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
        'bg-gradient-to-r from-blue-500 to-blue-600'
    }`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event listeners for filters
applyFilter.addEventListener('click', applyFilters);
resetFilter.addEventListener('click', resetFilters);

// Reset filters and show all transactions
function resetFilters() {
    // Reset all filter values
    filterType.value = 'all';
    filterDate.value = 'all';
    startDate.value = '';
    endDate.value = '';
    
    // Disable custom date inputs
    startDate.disabled = true;
    endDate.disabled = true;
    
    // Keep custom date range section visible but just clear the values
    // customDateRange.style.display = 'none'; // Removed this line
    
    // Re-render all transactions
    list.innerHTML = '';
    transactionList.forEach(renderTransaction);
    
    // Reset totals to full amounts
    const balance = income - expense;
    showIncome.textContent = `₹${income.toFixed(2)}`;
    showExpense.textContent = `₹${expense.toFixed(2)}`;
    showBalance.textContent = `₹${balance.toFixed(2)}`;
    
    // Update charts with all data
    updateCharts();
    
    // Show success message
    showNotification('Filters reset successfully!', 'success');
}

let isExpand = false;
const expandBtn = document.querySelector('.expand-btn');
const transactionDiv = document.querySelector('.transactionListDiv');
const overlay = document.querySelector('.transaction-overlay');

expandBtn.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 640;
    
    if (!isExpand) {
        // Show overlay
        overlay.style.display = 'block';
        
        // Disable CSS transitions to prevent conflicts with GSAP
        transactionDiv.style.transition = 'none';
        
        // Modern fade out with scale and transform
        gsap.to(transactionDiv, {
            opacity: 0,
            scale: 0.95,
            y: 10,
            top: 80,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                transactionDiv.classList.add('expanded');
                
                if (isMobile) {
                    list.classList.add('h-[70vh]');
                } else {
                    list.classList.add('h-[550px]');
                }
                
                if (isMobile) {
                    list.style.height = '70vh';
                } else {
                    list.style.height = '550px';
                }
                
                gsap.set(transactionDiv, {
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                    clearProps: "transform"
                });
                
                gsap.to(transactionDiv, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.45,
                    ease: "back.out(1.4)",
                    onComplete: () => {
                        transactionDiv.style.transition = '';
                    }
                });
            }
        });
        
        // Animate overlay with stagger
        gsap.fromTo(overlay,
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.3,
                ease: "power2.out"
            }
        );
        
    } else {
        // Disable CSS transitions
        transactionDiv.style.transition = 'none';
        
        // Modern collapse animation
        gsap.to(transactionDiv, {
            opacity: 0,
            scale: 0.92,
            y: -15,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                // Remove expanded class
                transactionDiv.classList.remove('expanded');
                
                // Remove responsive height classes
                list.classList.remove('h-[550px]');
                list.classList.remove('h-[70vh]');
                
                // Reset the transaction list div height to original
                list.style.height = '';
                
                // Set initial state for return animation
                gsap.set(transactionDiv, {
                    opacity: 0,
                    scale: 0.96,
                    y: 10,
                    clearProps: "transform"
                });
                
                // Smooth return animation
                gsap.to(transactionDiv, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.35,
                    ease: "power2.out",
                    onComplete: () => {
                        // Re-enable CSS transitions
                        transactionDiv.style.transition = '';
                        // Clear all GSAP properties
                        gsap.set(transactionDiv, { 
                            clearProps: "all" 
                        });
                    }
                });
                
                // Hide overlay
                overlay.style.display = 'none';
            }
        });
        
        // Animate overlay out
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.in"
        });
    }
    isExpand = !isExpand;
});

// Add some CSS for enhanced visual effects
const style = document.createElement('style');
style.textContent = `
    .transactionListDiv {
        will-change: transform, opacity;
    }
    
    .transactionListDiv.expanded {
        will-change: transform, opacity;
    }
`;
document.head.appendChild(style);


// Optional: Close on overlay click
overlay.addEventListener('click', () => {
    if (isExpand) {
        expandBtn.click();
    }
    if (isFormOpen) {
        closeBtn.click();
    }
});

// Optional: Close on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isExpand) {
        expandBtn.click();
    }
    if (e.key === 'Escape' && isFormOpen) {
        closeBtn.click();
    }
}); 