// UI Functions for Investment Odyssey

// Update UI
window.updateUI = function() {
    try {
        console.log('Updating UI...');

        // Normalize game state if available
        if (window.normalizeGameState && window.gameState) {
            window.gameState = window.normalizeGameState(window.gameState);
        }

        // Update market data table
        if (typeof window.updateMarketData === 'function') {
            window.updateMarketData();
        } else if (typeof updateMarketData === 'function') {
            updateMarketData();
        }

        // Update price ticker
        if (typeof window.updatePriceTicker === 'function') {
            window.updatePriceTicker();
        } else if (typeof updatePriceTicker === 'function') {
            updatePriceTicker();
        }

        // Update charts
        if (typeof window.updatePortfolioChart === 'function') {
            window.updatePortfolioChart();
        } else if (typeof updatePortfolioChart === 'function') {
            updatePortfolioChart();
        }

        if (typeof window.updatePortfolioAllocationChart === 'function') {
            window.updatePortfolioAllocationChart();
        } else if (typeof updatePortfolioAllocationChart === 'function') {
            updatePortfolioAllocationChart();
        }

        if (typeof window.updateAssetPriceCharts === 'function') {
            window.updateAssetPriceCharts();
        } else if (typeof updateAssetPriceCharts === 'function') {
            updateAssetPriceCharts();
        }

        if (typeof window.updateComparativeReturnsChart === 'function') {
            window.updateComparativeReturnsChart();
        } else if (typeof updateComparativeReturnsChart === 'function') {
            updateComparativeReturnsChart();
        }

        // Update asset price in trade form
        if (typeof window.updateAssetPrice === 'function') {
            window.updateAssetPrice();
        } else if (typeof updateAssetPrice === 'function') {
            updateAssetPrice();
        }

        // Update cash and portfolio displays
        if (typeof window.updateCashAndPortfolioDisplays === 'function') {
            window.updateCashAndPortfolioDisplays();
        } else if (typeof updateCashAndPortfolioDisplays === 'function') {
            updateCashAndPortfolioDisplays();
        }

        // Update round progress
        if (typeof window.updateRoundProgress === 'function') {
            window.updateRoundProgress();
        } else if (typeof updateRoundProgress === 'function') {
            updateRoundProgress();
        }

        console.log('UI updated successfully');
    } catch (error) {
        console.error('Error in updateUI function:', error);
    }
};

// Calculate portfolio value
window.calculatePortfolioValue = function() {
    let value = 0;
    if (!playerState || !playerState.portfolio || !gameState || !gameState.assetPrices) return value;

    for (const [asset, quantity] of Object.entries(playerState.portfolio)) {
        const price = gameState.assetPrices[asset] || 0;
        value += price * quantity;
    }

    return value;
};

// Update cash and portfolio displays
window.updateCashAndPortfolioDisplays = function() {
    // Calculate portfolio value
    const portfolioValue = window.calculatePortfolioValue();
    const totalValue = playerState.cash + portfolioValue;

    // Update displays
    updateElementText('cash-display', playerState.cash.toFixed(2));
    updateElementText('portfolio-value-display', portfolioValue.toFixed(2));
    updateElementText('total-value-display', totalValue.toFixed(2));
    updateElementText('cpi-display', gameState.CPI.toFixed(2));
}

// Update element text helper function
window.updateElementText = function(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// Update round progress
window.updateRoundProgress = function() {
    // Update round displays
    updateElementText('current-round-display', window.currentRound);
    updateElementText('market-round-display', window.currentRound);

    // Update progress bar
    const progressBar = document.getElementById('round-progress');
    if (progressBar) {
        const progress = (window.currentRound / gameState.maxRounds) * 100;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = progress.toFixed(0) + '%';
    }
}

// Update market data
window.updateMarketData = function() {
    let tableBody = document.getElementById('market-data-table');
    if (!tableBody) {
        console.warn('Market data table not found, trying alternative ID');
        // Try alternative ID
        tableBody = document.querySelector('#market-data-table tbody');
        if (!tableBody) {
            console.error('Could not find market data table');
            return;
        }
    }
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
        <td>${(playerState.cash / (window.calculatePortfolioValue() + playerState.cash) * 100).toFixed(2)}%</td>
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
        const portfolioTotal = window.calculatePortfolioValue() + playerState.cash;
        const percentage = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;

        row.innerHTML = `
            <td>${asset}</td>
            <td class="price-cell">$${price.toFixed(2)}</td>
            <td class="${changeClass}">${changeIcon}${percentChange.toFixed(2)}%</td>
            <td>${quantity.toFixed(6)}</td>
            <td>$${value.toFixed(2)}</td>
            <td>${percentage.toFixed(2)}%</td>
            <td>
                <button class="btn btn-sm btn-success trade-btn buy" data-asset="${asset}">Buy</button>
                <button class="btn btn-sm btn-danger trade-btn sell" data-asset="${asset}" ${quantity <= 0 ? 'disabled' : ''}>Sell</button>
            </td>
        `;

        tableBody.appendChild(row);
    }
}

// Update price ticker
window.updatePriceTicker = function() {
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
window.updatePortfolioChart = function() {
    const canvas = document.getElementById('portfolio-chart');
    if (!canvas) return;

    // Get portfolio value history (handle both naming conventions)
    const portfolioValueHistory = playerState.portfolio_value_history || playerState.portfolioValueHistory || [];

    // If portfolio value history is not an array, create an empty array
    const valueHistory = Array.isArray(portfolioValueHistory) ? portfolioValueHistory : [];

    // Create labels
    const labels = [];
    for (let i = 0; i < valueHistory.length; i++) {
        labels.push(`Round ${i}`);
    }

    // Create data
    const data = valueHistory;

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
window.updatePortfolioAllocationChart = function() {
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
window.updateAssetPriceCharts = function() {
    // Update Real Estate & Gold chart
    updateRealEstateGoldChart();

    // Update Bonds, Commodities & S&P chart
    updateBondsCommoditiesSPChart();

    // Update Bitcoin chart
    updateBitcoinChart();
}

// Update Real Estate & Gold chart
window.updateRealEstateGoldChart = function() {
    const canvas = document.getElementById('real-estate-gold-chart');
    if (!canvas) return;

    // Get price history
    const realEstateHistory = gameState.priceHistory['Real Estate'] || [];
    const goldHistory = gameState.priceHistory['Gold'] || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= window.currentRound; i++) {
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
window.updateBondsCommoditiesSPChart = function() {
    const canvas = document.getElementById('bonds-commodities-sp-chart');
    if (!canvas) return;

    // Get price history
    const bondsHistory = gameState.priceHistory['Bonds'] || [];
    const commoditiesHistory = gameState.priceHistory['Commodities'] || [];
    const spHistory = gameState.priceHistory['S&P 500'] || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= window.currentRound; i++) {
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
window.updateBitcoinChart = function() {
    const canvas = document.getElementById('bitcoin-chart');
    if (!canvas) return;

    // Get price history
    const bitcoinHistory = gameState.priceHistory['Bitcoin'] || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= window.currentRound; i++) {
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
window.updateCPIChart = function() {
    const canvas = document.getElementById('cpi-chart');
    if (!canvas) return;

    // Get CPI history
    const cpiHistory = gameState.CPIHistory || [];

    // Create labels
    const labels = [];
    for (let i = 0; i <= window.currentRound; i++) {
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
        // Destroy all existing charts to prevent errors
        if (typeof window.destroyAllCharts === 'function') {
            window.destroyAllCharts();
        } else if (typeof destroyAllCharts === 'function') {
            destroyAllCharts();
        }

        // Wait a moment for the DOM to be ready and charts to be destroyed
        setTimeout(() => {
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
        }, 300); // End of setTimeout - increased to 300ms for better reliability
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Destroy all charts to prevent errors
window.destroyAllCharts = function() {
    console.log('Destroying all charts...');
    try {
        // Get all canvas elements
        const canvases = document.querySelectorAll('canvas');
        console.log(`Found ${canvases.length} canvas elements`);

        // Clear each canvas
        canvases.forEach(canvas => {
            try {
                // Try to get the chart instance from the canvas
                const chartInstance = Chart.getChart(canvas);
                if (chartInstance) {
                    console.log(`Destroying chart on canvas ${canvas.id}`);
                    chartInstance.destroy();
                } else {
                    console.log(`No chart instance found for canvas ${canvas.id}`);
                    // Clear the canvas manually
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            } catch (canvasError) {
                console.error(`Error clearing canvas ${canvas.id}:`, canvasError);
            }
        });

        // Reset chart references
        window.portfolioChart = null;
        window.portfolioAllocationChart = null;
        window.realEstateGoldChart = null;
        window.bondsCommoditiesSPChart = null;
        window.bitcoinChart = null;
        window.cpiChart = null;

        console.log('All charts destroyed successfully');
    } catch (error) {
        console.error('Error destroying charts:', error);
    }
}

// Update comparative returns chart
window.updateComparativeReturnsChart = function() {
    // This is a placeholder for the comparative returns chart
    // We'll implement this in a separate function to keep the file size manageable
}

// Update asset price in trade form
window.updateAssetPrice = function() {
    const assetSelect = document.getElementById('trade-asset');
    const priceDisplay = document.getElementById('trade-price');

    if (!assetSelect || !priceDisplay) return;

    const selectedAsset = assetSelect.value;
    if (!selectedAsset) return;

    const price = gameState.assetPrices[selectedAsset] || 0;
    priceDisplay.textContent = `$${price.toFixed(2)}`;
}

// Show trade panel
window.showTradePanel = function(asset, action = 'buy') {
    console.log(`Showing trade panel for ${asset}, action: ${action}`);

    // Get the trade panel
    const tradePanel = document.querySelector('.trade-panel');
    if (!tradePanel) {
        console.error('Trade panel not found');
        return;
    }

    // Debug log to check if gameState and asset prices are available
    console.log('gameState:', window.gameState || gameState);
    console.log('Asset prices:', window.gameState?.assetPrices || gameState?.assetPrices ||
                             window.gameState?.asset_prices || gameState?.asset_prices);
    console.log('Trade panel element:', tradePanel);

    // Make sure the trade panel is visible
    tradePanel.style.display = 'block';
    tradePanel.style.zIndex = '9999';

    // Set the asset name
    const assetNameElement = document.getElementById('trade-asset-name');
    if (assetNameElement) {
        assetNameElement.textContent = asset;
    }

    // Set the action
    const actionSelect = document.getElementById('trade-action');
    if (actionSelect) {
        actionSelect.value = action;
    }

    // Set the asset price
    // Handle different property naming conventions
    const assetPrices = window.gameState?.assetPrices || window.gameState?.asset_prices ||
                       gameState?.assetPrices || gameState?.asset_prices || {};
    const price = assetPrices[asset] || 0;

    const priceElement = document.getElementById('trade-price');
    if (priceElement) {
        priceElement.textContent = `$${price.toFixed(2)}`;
    }

    // Reset quantity
    const quantityInput = document.getElementById('trade-quantity');
    if (quantityInput) {
        quantityInput.value = '1';
    }

    // Update trade summary
    updateTradeSummary();

    // No need to set display again, already set above
}

// Update trade summary
window.updateTradeSummary = function() {
    const assetName = document.getElementById('trade-asset-name').textContent;
    const action = document.getElementById('trade-action').value;
    const quantity = parseFloat(document.getElementById('trade-quantity').value) || 0;

    // Handle different property naming conventions
    const assetPrices = window.gameState?.assetPrices || window.gameState?.asset_prices ||
                       gameState?.assetPrices || gameState?.asset_prices || {};
    const price = assetPrices[assetName] || 0;
    const total = price * quantity;

    console.log(`Updating trade summary: ${assetName}, ${action}, ${quantity} @ $${price} = $${total}`);

    // Update total display
    const totalElement = document.getElementById('trade-total');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Validate trade
    const executeTradeBtn = document.getElementById('execute-trade-btn');
    if (executeTradeBtn) {
        if (action === 'buy') {
            // Check if player has enough cash
            executeTradeBtn.disabled = total > playerState.cash;
        } else if (action === 'sell') {
            // Check if player has enough of the asset
            const playerQuantity = playerState.portfolio[assetName] || 0;
            executeTradeBtn.disabled = quantity > playerQuantity;
        }
    }
}

// Execute trade
window.executeTrade = function() {
    const assetName = document.getElementById('trade-asset-name').textContent;
    const action = document.getElementById('trade-action').value;
    const quantity = parseFloat(document.getElementById('trade-quantity').value) || 0;

    if (quantity <= 0) {
        window.showNotification('Please enter a valid quantity.', 'warning');
        return;
    }

    // Handle different property naming conventions
    const assetPrices = window.gameState?.assetPrices || window.gameState?.asset_prices ||
                       gameState?.assetPrices || gameState?.asset_prices || {};
    const price = assetPrices[assetName] || 0;
    const total = price * quantity;

    console.log(`Executing trade: ${action} ${quantity} ${assetName} @ $${price} = $${total}`);

    if (action === 'buy') {
        // Check if player has enough cash
        if (total > playerState.cash) {
            window.showNotification('Not enough cash for this purchase.', 'danger');
            return;
        }

        // Update player state
        playerState.cash -= total;
        playerState.portfolio[assetName] = (playerState.portfolio[assetName] || 0) + quantity;

        // Add to trade history
        if (!playerState.tradeHistory && !playerState.trade_history) {
            playerState.trade_history = [];
        }

        const tradeRecord = {
            round: window.currentRound || 0,
            asset: assetName,
            action: 'buy',
            quantity: quantity,
            price: price,
            total: total,
            timestamp: new Date().toISOString()
        };

        if (Array.isArray(playerState.tradeHistory)) {
            playerState.tradeHistory.push(tradeRecord);
        } else if (Array.isArray(playerState.trade_history)) {
            playerState.trade_history.push(tradeRecord);
        }

        window.showNotification(`Bought ${quantity} ${assetName} for $${total.toFixed(2)}.`, 'success');
    } else if (action === 'sell') {
        // Check if player has enough of the asset
        const playerQuantity = playerState.portfolio[assetName] || 0;
        if (quantity > playerQuantity) {
            window.showNotification(`You don't have enough ${assetName} to sell.`, 'danger');
            return;
        }

        // Update player state
        playerState.cash += total;
        playerState.portfolio[assetName] -= quantity;

        // Remove asset from portfolio if quantity is 0
        if (playerState.portfolio[assetName] <= 0) {
            delete playerState.portfolio[assetName];
        }

        // Add to trade history
        if (!playerState.tradeHistory && !playerState.trade_history) {
            playerState.trade_history = [];
        }

        const tradeRecord = {
            round: window.currentRound || 0,
            asset: assetName,
            action: 'sell',
            quantity: quantity,
            price: price,
            total: total,
            timestamp: new Date().toISOString()
        };

        if (Array.isArray(playerState.tradeHistory)) {
            playerState.tradeHistory.push(tradeRecord);
        } else if (Array.isArray(playerState.trade_history)) {
            playerState.trade_history.push(tradeRecord);
        }

        window.showNotification(`Sold ${quantity} ${assetName} for $${total.toFixed(2)}.`, 'success');
    }

    // Hide trade panel
    const tradePanel = document.querySelector('.trade-panel');
    if (tradePanel) {
        tradePanel.style.display = 'none';
    }

    // Save player state to Supabase
    if (window.gameSupabase && typeof window.gameSupabase.updatePlayerState === 'function' && window.gameSession) {
        console.log('Saving player state to Supabase after trade');
        window.gameSupabase.updatePlayerState(window.gameSession.id, playerState)
            .then(success => {
                if (success) {
                    console.log('Player state saved successfully');
                } else {
                    console.error('Failed to save player state');
                }
                // Update UI
                updateUI();
            })
            .catch(error => {
                console.error('Error saving player state:', error);
                // Update UI anyway
                updateUI();
            });
    } else {
        console.warn('Unable to save player state to Supabase - missing required objects');
        // Update UI
        updateUI();
    }
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
            if (typeof window.nextRound === 'function') {
                window.nextRound();
            } else if (typeof window.advanceToNextRound === 'function') {
                window.advanceToNextRound();
            } else if (typeof advanceToNextRound === 'function') {
                advanceToNextRound();
            } else {
                console.error('No next round function found');
                window.showNotification('Error: Could not advance to next round', 'danger');
            }
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
            if (typeof window.nextRound === 'function') {
                window.nextRound();
            } else if (typeof window.advanceToNextRound === 'function') {
                window.advanceToNextRound();
            } else if (typeof advanceToNextRound === 'function') {
                advanceToNextRound();
            } else {
                console.error('No next round function found');
                window.showNotification('Error: Could not advance to next round', 'danger');
            }
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

    // Add event listener for the debug trade panel button
    const debugTradeBtn = document.getElementById('debug-trade-btn');
    if (debugTradeBtn) {
        debugTradeBtn.addEventListener('click', function() {
            console.log('Debug trade panel button clicked');
            window.debugShowTradePanel();
            // Also set up the trade panel with some default values
            const assetNameElement = document.getElementById('trade-asset-name');
            if (assetNameElement) {
                assetNameElement.textContent = 'Gold';
            }
            window.updateTradeSummary();
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
window.initializeTradeFormListeners = function() {
    console.log('Initializing trade form listeners');

    // Add event listeners for trade buttons - both delegation and direct
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('trade-btn')) {
            console.log('Trade button clicked:', event.target);
            const asset = event.target.getAttribute('data-asset');
            const action = event.target.classList.contains('buy') ? 'buy' : 'sell';
            console.log(`Trade button clicked for ${asset}, action: ${action}`);
            window.showTradePanel(asset, action);
        }
    });

    // Also add direct event listeners to all trade buttons
    window.addTradeButtonListeners();

    // Initialize trade form controls
    window.initializeTradeFormControls();
};

// Add direct event listeners to all trade buttons
window.addTradeButtonListeners = function() {
    console.log('Adding direct event listeners to trade buttons');
    const tradeButtons = document.querySelectorAll('.trade-btn');
    console.log(`Found ${tradeButtons.length} trade buttons`);

    tradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const asset = this.getAttribute('data-asset');
            const action = this.classList.contains('buy') ? 'buy' : 'sell';
            console.log(`Direct listener: Trade button clicked for ${asset}, action: ${action}`);
            window.showTradePanel(asset, action);

            // Debug: Check if trade panel is visible after a short delay
            setTimeout(() => {
                const tradePanel = document.querySelector('.trade-panel');
                console.log('Trade panel visibility check:', {
                    display: tradePanel.style.display,
                    zIndex: tradePanel.style.zIndex,
                    visible: tradePanel.style.display !== 'none',
                    computedStyle: window.getComputedStyle(tradePanel).display
                });
            }, 100);
        });
    });
};

// Debug function to show the trade panel directly
window.debugShowTradePanel = function() {
    const tradePanel = document.querySelector('.trade-panel');
    if (tradePanel) {
        tradePanel.style.display = 'block';
        tradePanel.style.zIndex = '9999';
        console.log('Trade panel forced visible');
    } else {
        console.error('Trade panel not found');
    }
};

// Initialize trade form controls
window.initializeTradeFormControls = function() {
    console.log('Initializing trade form controls');

    // Add event listener for trade action change
    const tradeAction = document.getElementById('trade-action');
    if (tradeAction) {
        tradeAction.addEventListener('change', function() {
            window.updateTradeSummary();
        });
    }

    // Add event listener for trade quantity change
    const tradeQuantity = document.getElementById('trade-quantity');
    if (tradeQuantity) {
        tradeQuantity.addEventListener('input', function() {
            window.updateTradeSummary();
        });
    }

    // Add event listeners for quantity shortcuts
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('quantity-btn')) {
            const percent = parseInt(event.target.getAttribute('data-percent'));
            if (!isNaN(percent)) {
                window.setAmountPercentage(percent);
            }
        }
    });

    // Add event listener for execute trade button
    const executeTradeBtn = document.getElementById('execute-trade-btn');
    if (executeTradeBtn) {
        executeTradeBtn.addEventListener('click', function() {
            window.executeTrade();
        });
    }

    // Add event listener for cancel trade button
    const cancelTradeBtn = document.getElementById('cancel-trade-btn');
    if (cancelTradeBtn) {
        cancelTradeBtn.addEventListener('click', function() {
            const tradePanel = document.querySelector('.trade-panel');
            if (tradePanel) {
                tradePanel.style.display = 'none';
            }
        });
    }
};



// Set amount percentage for trade
window.setAmountPercentage = function(percentage) {
    console.log(`Setting amount percentage to ${percentage}%`);

    // Get the trade panel elements
    const assetName = document.getElementById('trade-asset-name').textContent;
    const action = document.getElementById('trade-action').value;
    const quantityInput = document.getElementById('trade-quantity');

    if (!assetName || !quantityInput) {
        console.error('Missing required elements for setAmountPercentage');
        return;
    }

    // Only apply to buy actions
    if (action !== 'buy') {
        console.log('setAmountPercentage only applies to buy actions');
        return;
    }

    // Get asset price
    const assetPrices = window.gameState?.assetPrices || window.gameState?.asset_prices ||
                       gameState?.assetPrices || gameState?.asset_prices || {};
    const price = assetPrices[assetName] || 0;

    if (price <= 0) {
        console.error('Invalid asset price');
        return;
    }

    // Calculate quantity based on percentage of cash
    const cash = playerState.cash;
    const amount = cash * (percentage / 100);
    const quantity = amount / price;

    // Update quantity input
    quantityInput.value = quantity.toFixed(6);

    // Update trade summary
    window.updateTradeSummary();
};


// Show notification message
window.showNotification = function(message, type = 'info', duration = 5000) {
    console.log(`Showing notification: ${message} (${type})`);

    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        notificationContainer.style.maxWidth = '350px';
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

    // Add notification content
    notification.innerHTML = `
        <div>${message}</div>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;

    // Add notification to container
    notificationContainer.appendChild(notification);

    // Auto-remove notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);

    // Add click event to close button
    const closeButton = notification.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
};

// Initialize portfolio action listeners
window.initializePortfolioActionListeners = function() {
    console.log('Initializing portfolio action listeners');

    // Buy all assets button
    const buyAllBtn = document.getElementById('buy-all-btn');
    if (buyAllBtn) {
        buyAllBtn.addEventListener('click', function() {
            // Implement buy all assets functionality
            console.log('Buy all assets button clicked');
        });
    }

    // Sell all assets button
    const sellAllBtn = document.getElementById('sell-all-btn');
    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', function() {
            // Implement sell all assets functionality
            console.log('Sell all assets button clicked');
        });
    }

    // Add event listeners for portfolio action buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('portfolio-action-btn')) {
            const asset = event.target.getAttribute('data-asset');
            const action = event.target.getAttribute('data-action');
            window.showTradePanel(asset, action);
        }
    });
}


