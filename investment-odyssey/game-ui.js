// UI Functions for Investment Odyssey

// Update UI
function updateUI() {
    try {
        // Update market data table
        updateMarketData();

        // Update price ticker
        updatePriceTicker();

        // Update charts
        updatePortfolioChart();
        updatePortfolioAllocationChart();
        updateAssetPriceCharts();
        updateComparativeReturnsChart();

        // Update asset price in trade form
        updateAssetPrice();

        // Update cash and portfolio displays
        updateCashAndPortfolioDisplays();

        // Update round progress
        updateRoundProgress();
    } catch (error) {
        console.error('Error in updateUI function:', error);
    }
}

// Update cash and portfolio displays
function updateCashAndPortfolioDisplays() {
    // Calculate portfolio value
    const portfolioValue = calculatePortfolioValue();
    const totalValue = playerState.cash + portfolioValue;

    // Update displays
    updateElementText('cash-display', playerState.cash.toFixed(2));
    updateElementText('portfolio-value-display', portfolioValue.toFixed(2));
    updateElementText('total-value-display', totalValue.toFixed(2));
    updateElementText('cpi-display', gameState.CPI.toFixed(2));
}

// Update element text helper function
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// Update round progress
function updateRoundProgress() {
    // Update round displays
    updateElementText('current-round-display', currentRound);
    updateElementText('market-round-display', currentRound);

    // Update progress bar
    const progressBar = document.getElementById('round-progress');
    if (progressBar) {
        const progress = (currentRound / gameState.maxRounds) * 100;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = progress.toFixed(0) + '%';
    }
}

// Update market data
function updateMarketData() {
    const tableBody = document.getElementById('asset-prices-table');
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add Cash row first
    const cashRow = document.createElement('tr');
    cashRow.innerHTML = `
        <td>Cash</td>
        <td class="price-cell">$1.00</td>
        <td class="text-secondary">0.00%</td>
        <td>${playerState.cash.toFixed(6)}</td>
        <td>$${playerState.cash.toFixed(2)}</td>
        <td>${(playerState.cash / (calculatePortfolioValue() + playerState.cash) * 100).toFixed(2)}%</td>
    `;
    tableBody.appendChild(cashRow);

    // Add rows for each asset
    for (const [asset, price] of Object.entries(gameState.assetPrices)) {
        const row = document.createElement('tr');

        // Calculate price change
        let priceChange = 0;
        let percentChange = 0;

        const priceHistory = gameState.priceHistory[asset];
        if (priceHistory && priceHistory.length > 1) {
            const previousPrice = priceHistory[priceHistory.length - 2];
            priceChange = price - previousPrice;
            percentChange = (priceChange / previousPrice) * 100;
        }

        // Create change class
        let changeClass = 'text-secondary';
        let changeIcon = '';

        if (priceChange > 0) {
            changeClass = 'text-success';
            changeIcon = '<i class="fas fa-arrow-up mr-1"></i>';
        } else if (priceChange < 0) {
            changeClass = 'text-danger';
            changeIcon = '<i class="fas fa-arrow-down mr-1"></i>';
        }

        // Get portfolio quantity and value
        const quantity = playerState.portfolio[asset] || 0;
        const value = quantity * price;
        const portfolioTotal = calculatePortfolioValue() + playerState.cash;
        const percentage = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;

        row.innerHTML = `
            <td>${asset}</td>
            <td class="price-cell">$${price.toFixed(2)}</td>
            <td class="${changeClass}">${changeIcon}${percentChange.toFixed(2)}%</td>
            <td>${quantity.toFixed(6)}</td>
            <td>$${value.toFixed(2)}</td>
            <td>${percentage.toFixed(2)}%</td>
        `;

        tableBody.appendChild(row);
    }
}

// Update price ticker
function updatePriceTicker() {
    const ticker = document.getElementById('price-ticker');
    if (!ticker) return;

    // Clear existing items
    ticker.innerHTML = '';

    // Add items for each asset
    for (const [asset, price] of Object.entries(gameState.assetPrices)) {
        // Get previous price
        const priceHistory = gameState.priceHistory[asset] || [];
        const previousPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2] : price;

        // Calculate change
        const change = price - previousPrice;
        const percentChange = (change / previousPrice) * 100;

        // Create change class
        let changeClass = '';
        let changeIcon = '';

        if (change > 0) {
            changeClass = 'text-success';
            changeIcon = '▲';
        } else if (change < 0) {
            changeClass = 'text-danger';
            changeIcon = '▼';
        }

        const tickerItem = document.createElement('div');
        tickerItem.className = 'ticker-item';

        tickerItem.innerHTML = `
            <span class="asset-name">${asset}</span>
            <span class="price">$${price.toFixed(2)}</span>
            <span class="${changeClass}">${changeIcon} ${percentChange.toFixed(2)}%</span>
        `;

        ticker.appendChild(tickerItem);
    }
}

// Update portfolio chart
function updatePortfolioChart() {
    const canvas = document.getElementById('portfolio-chart');
    if (!canvas) return;

    // Get portfolio value history
    const portfolioValueHistory = playerState.portfolioValueHistory;

    // Create labels
    const labels = Object.keys(portfolioValueHistory).map(round => `Round ${round}`);

    // Create data
    const data = Object.values(portfolioValueHistory);

    // Create chart
    if (window.portfolioChart) {
        window.portfolioChart.data.labels = labels;
        window.portfolioChart.data.datasets[0].data = data;
        window.portfolioChart.update();
    } else {
        const ctx = canvas.getContext('2d');

        window.portfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: data,
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Value Over Time',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Value: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Value ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update portfolio allocation chart
function updatePortfolioAllocationChart() {
    const canvas = document.getElementById('portfolio-allocation-chart');
    if (!canvas) return;

    // Prepare data for portfolio allocation chart
    const portfolioData = [];
    const portfolioLabels = [];
    const portfolioColors = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8F00FF', '#FF6D01', '#1976D2'
    ];

    // Add assets to portfolio data
    let colorIndex = 0;
    for (const [asset, quantity] of Object.entries(playerState.portfolio)) {
        if (quantity > 0) {
            const value = quantity * gameState.assetPrices[asset];
            portfolioData.push(value);
            portfolioLabels.push(asset);
            colorIndex = (colorIndex + 1) % portfolioColors.length;
        }
    }

    // Add cash to portfolio allocation
    portfolioData.push(playerState.cash);
    portfolioLabels.push('Cash');

    // Create chart
    if (window.portfolioAllocationChart) {
        window.portfolioAllocationChart.data.labels = portfolioLabels;
        window.portfolioAllocationChart.data.datasets[0].data = portfolioData;
        window.portfolioAllocationChart.update();
    } else {
        const ctx = canvas.getContext('2d');

        window.portfolioAllocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: portfolioLabels,
                datasets: [{
                    data: portfolioData,
                    backgroundColor: portfolioColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Allocation',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update asset price charts
function updateAssetPriceCharts() {
    // Update Real Estate & Gold chart
    updateRealEstateGoldChart();

    // Update Bonds, Commodities & S&P chart
    updateBondsCommoditiesSPChart();

    // Update Bitcoin chart
    updateBitcoinChart();
}

// Update Real Estate & Gold chart
function updateRealEstateGoldChart() {
    const canvas = document.getElementById('real-estate-gold-chart');
    if (!canvas) return;

    // Get price history
    const realEstateHistory = gameState.priceHistory['Real Estate'] || [];
    const goldHistory = gameState.priceHistory['Gold'] || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= currentRound; i++) {
        labels.push(`Round ${i}`);
    }

    // Update chart
    if (window.realEstateGoldChart) {
        window.realEstateGoldChart.data.labels = labels;
        window.realEstateGoldChart.data.datasets[0].data = realEstateHistory;
        window.realEstateGoldChart.data.datasets[1].data = goldHistory;
        window.realEstateGoldChart.update();
    }
}

// Update Bonds, Commodities & S&P chart
function updateBondsCommoditiesSPChart() {
    const canvas = document.getElementById('bonds-commodities-sp-chart');
    if (!canvas) return;

    // Get price history
    const bondsHistory = gameState.priceHistory['Bonds'] || [];
    const commoditiesHistory = gameState.priceHistory['Commodities'] || [];
    const spHistory = gameState.priceHistory['S&P 500'] || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= currentRound; i++) {
        labels.push(`Round ${i}`);
    }

    // Update chart
    if (window.bondsCommoditiesSPChart) {
        window.bondsCommoditiesSPChart.data.labels = labels;
        window.bondsCommoditiesSPChart.data.datasets[0].data = bondsHistory;
        window.bondsCommoditiesSPChart.data.datasets[1].data = commoditiesHistory;
        window.bondsCommoditiesSPChart.data.datasets[2].data = spHistory;
        window.bondsCommoditiesSPChart.update();
    }
}

// Update Bitcoin chart
function updateBitcoinChart() {
    const canvas = document.getElementById('bitcoin-chart');
    if (!canvas) return;

    // Get price history
    const bitcoinHistory = gameState.priceHistory['Bitcoin'] || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= currentRound; i++) {
        labels.push(`Round ${i}`);
    }

    // Update chart
    if (window.bitcoinChart) {
        window.bitcoinChart.data.labels = labels;
        window.bitcoinChart.data.datasets[0].data = bitcoinHistory;
        window.bitcoinChart.update();
    }
}

// Update CPI chart
function updateCPIChart() {
    const canvas = document.getElementById('cpi-chart');
    if (!canvas) return;

    // Get CPI history
    const cpiHistory = gameState.CPIHistory || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= currentRound; i++) {
        labels.push(`Round ${i}`);
    }

    // Update chart
    if (window.cpiChart) {
        window.cpiChart.data.labels = labels;
        window.cpiChart.data.datasets[0].data = cpiHistory;
        window.cpiChart.update();
    }
}

// Initialize charts
window.initializeCharts = function() {
    console.log('Initializing charts...');

    try {
        // Initialize portfolio value chart
        const portfolioValueCanvas = document.getElementById('portfolio-value-chart');
        if (portfolioValueCanvas) {
            const ctx = portfolioValueCanvas.getContext('2d');
            window.portfolioChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Round 0'],
                    datasets: [{
                        label: 'Portfolio Value',
                        data: [10000],
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(0);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Value: $' + context.raw.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize portfolio allocation chart
        const portfolioAllocationCanvas = document.getElementById('portfolio-allocation-chart');
        if (portfolioAllocationCanvas) {
            const ctx = portfolioAllocationCanvas.getContext('2d');
            window.portfolioAllocationChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Cash'],
                    datasets: [{
                        data: [10000],
                        backgroundColor: ['#4285F4'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize Real Estate & Gold chart
        const realEstateGoldCanvas = document.getElementById('real-estate-gold-chart');
        if (realEstateGoldCanvas) {
            const ctx = realEstateGoldCanvas.getContext('2d');
            window.realEstateGoldChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Round 0'],
                    datasets: [
                        {
                            label: 'Real Estate',
                            data: [5000],
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'Gold',
                            data: [3000],
                            borderColor: 'rgba(255, 206, 86, 1)',
                            backgroundColor: 'rgba(255, 206, 86, 0.1)',
                            borderWidth: 2,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': $' + context.raw.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize Bonds, Commodities & S&P chart
        const bondsCommoditiesSPCanvas = document.getElementById('bonds-commodities-sp-chart');
        if (bondsCommoditiesSPCanvas) {
            const ctx = bondsCommoditiesSPCanvas.getContext('2d');
            window.bondsCommoditiesSPChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Round 0'],
                    datasets: [
                        {
                            label: 'Bonds',
                            data: [100],
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'Commodities',
                            data: [100],
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'S&P 500',
                            data: [100],
                            borderColor: 'rgba(153, 102, 255, 1)',
                            backgroundColor: 'rgba(153, 102, 255, 0.1)',
                            borderWidth: 2,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': $' + context.raw.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize Bitcoin chart
        const bitcoinCanvas = document.getElementById('bitcoin-chart');
        if (bitcoinCanvas) {
            const ctx = bitcoinCanvas.getContext('2d');
            window.bitcoinChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Round 0'],
                    datasets: [
                        {
                            label: 'Bitcoin',
                            data: [50000],
                            borderColor: 'rgba(255, 159, 64, 1)',
                            backgroundColor: 'rgba(255, 159, 64, 0.1)',
                            borderWidth: 2,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': $' + context.raw.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize CPI chart
        const cpiCanvas = document.getElementById('cpi-chart');
        if (cpiCanvas) {
            const ctx = cpiCanvas.getContext('2d');
            window.cpiChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Round 0'],
                    datasets: [
                        {
                            label: 'CPI',
                            data: [100],
                            borderColor: 'rgba(40, 167, 69, 1)',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            borderWidth: 2,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(2);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'CPI: ' + context.raw.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }

        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Update comparative returns chart
function updateComparativeReturnsChart() {
    // This is a placeholder for the comparative returns chart
    // We'll implement this in a separate function to keep the file size manageable
}

// Initialize event listeners
window.initializeEventListeners = function() {
    console.log('Initializing event listeners');

    // Add event listener for the next round button
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
        console.log('Adding event listener to next-round-btn');
        nextRoundBtn.addEventListener('click', function() {
            console.log('Next round button clicked');
            nextRound();
        });
    } else {
        console.warn('next-round-btn not found');
    }

    // Add event listener for the sticky next round button
    const stickyNextRoundBtn = document.getElementById('sticky-next-round');
    if (stickyNextRoundBtn) {
        console.log('Adding event listener to sticky-next-round');
        stickyNextRoundBtn.addEventListener('click', function() {
            console.log('Sticky next round button clicked');
            nextRound();
        });
    } else {
        console.warn('sticky-next-round not found');
    }

    // Add event listeners for trade buttons
    document.querySelectorAll('.trade-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const asset = this.getAttribute('data-asset');
            const action = this.classList.contains('buy') ? 'buy' : 'sell';
            showTradePanel(asset, action);
        });
    });

    // Add event listeners for asset information
    document.querySelectorAll('.asset-name').forEach(element => {
        element.style.cursor = 'pointer';
        element.title = 'Click for asset information';
        element.addEventListener('click', function() {
            const asset = this.parentElement.getAttribute('data-asset');
            showAssetInfo(asset);
        });
    });

    // Add event listeners for closing modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Add event listener for the trade history button
    const viewHistoryBtn = document.getElementById('view-history-btn');
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', function() {
            document.getElementById('trade-history-modal').style.display = 'block';
        });
    }

    // Add event listener for the correlation matrix button
    const viewCorrelationBtn = document.getElementById('view-correlation-btn');
    if (viewCorrelationBtn) {
        viewCorrelationBtn.addEventListener('click', function() {
            document.getElementById('correlation-modal').style.display = 'block';
        });
    }

    // Add event listener for the back button
    const backToWelcomeBtn = document.getElementById('back-to-welcome');
    if (backToWelcomeBtn) {
        backToWelcomeBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to exit the game?')) {
                document.getElementById('game-screen').style.display = 'none';
                document.getElementById('welcome-screen').style.display = 'block';

                // Hide sticky next round button
                const stickyNextRoundBtn = document.getElementById('sticky-next-round');
                if (stickyNextRoundBtn) {
                    stickyNextRoundBtn.style.display = 'none';
                }
            }
        });
    }
}

    // Add event listener for the start game button
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }

    // Add event listener for the restart game button
    const restartGameBtn = document.getElementById('restart-game');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', restartGame);
    }

    // Add event listeners for trading form
    initializeTradeFormListeners();

    // Add event listeners for portfolio actions
    initializePortfolioActionListeners();
}

// Initialize trade form listeners
function initializeTradeFormListeners() {
    // Asset select change
    const assetSelect = document.getElementById('trade-asset');
    if (assetSelect) {
        assetSelect.addEventListener('change', updateAssetPrice);
    }

    // Action select change
    const actionSelect = document.getElementById('trade-action');
    if (actionSelect) {
        actionSelect.addEventListener('change', updateTradeSummary);
    }

    // Quantity input change
    const quantityInput = document.getElementById('trade-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateTradeSummary);
    }

    // Amount input change
    const amountInput = document.getElementById('trade-amount');
    if (amountInput) {
        amountInput.addEventListener('input', updateTradeSummary);
    }

    // Execute trade button
    const executeTradeBtn = document.getElementById('execute-trade-btn');
    if (executeTradeBtn) {
        executeTradeBtn.addEventListener('click', executeTrade);
    }

    // Amount percentage buttons
    const amountPercentBtns = document.querySelectorAll('.amount-percent-btn');
    amountPercentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const percent = parseInt(btn.getAttribute('data-percent'));
            setAmountPercentage(percent);
        });
    });

    // Quantity percentage buttons
    const quantityPercentBtns = document.querySelectorAll('.quantity-percent-btn');
    quantityPercentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const percent = parseInt(btn.getAttribute('data-percent'));
            setQuantityPercentage(percent);
        });
    });
}

// Initialize portfolio action listeners
function initializePortfolioActionListeners() {
    // Select all assets button
    const selectAllBtn = document.getElementById('select-all-assets-btn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.asset-select').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
    }

    // Deselect all assets button
    const deselectAllBtn = document.getElementById('deselect-all-assets-btn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.asset-select').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
    }

    // Distribute cash evenly button
    const distributeEvenlyBtn = document.getElementById('distribute-evenly-btn');
    if (distributeEvenlyBtn) {
        distributeEvenlyBtn.addEventListener('click', buyAllAssets);
    }

    // Distribute to selected button
    const distributeSelectedBtn = document.getElementById('distribute-selected-btn');
    if (distributeSelectedBtn) {
        distributeSelectedBtn.addEventListener('click', buySelectedAssets);
    }

    // Sell all assets button
    const sellAllBtn = document.getElementById('sell-all-btn');
    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', sellAllAssets);
    }
}
