// UI Functions for Investment Odyssey

// Update UI
function updateUI() {
    try {
        console.log('Starting updateUI function');

        // Update market data table
        console.log('Updating market data table...');
        updateMarketData();

        // Update portfolio table
        console.log('Updating portfolio table...');
        updatePortfolioTable();

        // Update price ticker
        console.log('Updating price ticker...');
        updatePriceTicker();

        // Update charts
        console.log('Updating charts...');
        updatePortfolioChart();
        updatePortfolioAllocationChart();
        updateAssetPriceCharts();
        updateCPIChart();
        updateComparativeReturnsChart();

        // Update asset price in trade form
        console.log('Updating asset price in trade form...');
        updateAssetPrice();

        // Update cash display
        updateElementText('cash-display', formatCurrency(playerState.cash));

        // Update portfolio value display
        const portfolioValue = calculatePortfolioValue();
        updateElementText('portfolio-value-display', formatCurrency(portfolioValue));
        updateElementText('portfolio-value-badge', formatCurrency(portfolioValue));

        // Update total value display
        updateElementText('total-value-display', formatCurrency(playerState.cash + portfolioValue));

        // Update CPI display
        updateElementText('cpi-display', gameState.CPI.toFixed(2));

        // Update Bitcoin market phase indicator if available
        updateBitcoinMarketPhase();

        console.log('updateUI function completed successfully');
    } catch (error) {
        console.error('Error in updateUI function:', error);
    }
}

// Update element text
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Update market data
function updateMarketData() {
    const tableBody = document.getElementById('market-data-table-body');
    if (!tableBody) return;

    // Clear table
    tableBody.innerHTML = '';

    // Add rows for each asset
    for (const [asset, price] of Object.entries(gameState.assetPrices)) {
        const row = document.createElement('tr');

        // Calculate price change
        let change = 0;
        let percentChange = 0;

        if (lastRoundPrices[asset] && lastPricesRoundNumber === gameState.roundNumber - 1) {
            change = price - lastRoundPrices[asset];
            percentChange = (change / lastRoundPrices[asset]) * 100;
        }

        // Determine change class and icon
        let changeClass = 'text-muted';
        let changeIcon = '';

        if (change > 0) {
            changeClass = 'text-success';
            changeIcon = '<i class="fas fa-arrow-up mr-1"></i>';
        } else if (change < 0) {
            changeClass = 'text-danger';
            changeIcon = '<i class="fas fa-arrow-down mr-1"></i>';
        }

        // Get asset ID for DOM elements
        const assetId = asset.replace(/[^a-zA-Z0-9]/g, '-');

        // Calculate holdings
        const quantity = playerState.portfolio[asset] || 0;
        const value = quantity * price;
        const portfolioTotal = calculatePortfolioValue() + playerState.cash;
        const percentage = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;

        // Create holdings display
        let holdingsDisplay = '<em class="text-muted">None</em>';
        if (quantity > 0) {
            holdingsDisplay = `
                <div>${quantity.toFixed(4)} units</div>
                <div class="text-success">$${formatCurrency(value)} (${percentage.toFixed(1)}%)</div>
            `;
        }

        row.innerHTML = `
            <td>${asset}</td>
            <td class="price-cell" id="price-${assetId}">$${formatCurrency(price)}</td>
            <td class="${changeClass}" id="change-${assetId}">${changeIcon}${change.toFixed(2)} (${percentChange.toFixed(2)}%)</td>
            <td class="holdings-cell" id="holdings-${assetId}">${holdingsDisplay}</td>
        `;

        tableBody.appendChild(row);
    }
}

// Update portfolio table
function updatePortfolioTable() {
    const tableBody = document.getElementById('portfolio-table-body');
    if (!tableBody) return;

    // Clear table
    tableBody.innerHTML = '';

    // Check if portfolio is empty
    if (Object.keys(playerState.portfolio).length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">
                <em>No assets in portfolio</em>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    // Add rows for each asset in portfolio
    for (const [asset, quantity] of Object.entries(playerState.portfolio)) {
        if (quantity <= 0) continue;

        const row = document.createElement('tr');
        const price = gameState.assetPrices[asset] || 0;

        // Calculate price change
        let change = 0;
        let percentChange = 0;

        if (lastRoundPrices[asset] && lastPricesRoundNumber === gameState.roundNumber - 1) {
            change = price - lastRoundPrices[asset];
            percentChange = (change / lastRoundPrices[asset]) * 100;
        }

        // Determine change class and icon
        let changeClass = 'text-muted';
        let changeIcon = '';

        if (change > 0) {
            changeClass = 'text-success';
            changeIcon = '<i class="fas fa-arrow-up mr-1"></i>';
        } else if (change < 0) {
            changeClass = 'text-danger';
            changeIcon = '<i class="fas fa-arrow-down mr-1"></i>';
        }

        // Get asset ID for DOM elements
        const assetId = asset.replace(/[^a-zA-Z0-9]/g, '-');

        // Get portfolio quantity and value
        const value = quantity * price;
        const portfolioTotal = calculatePortfolioValue() + playerState.cash;
        const percentage = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;

        row.innerHTML = `
            <td>${asset}</td>
            <td class="price-cell" id="price-${assetId}">$${formatCurrency(price)}</td>
            <td class="${changeClass}" id="change-${assetId}">${changeIcon}${change.toFixed(2)} (${percentChange.toFixed(2)}%)</td>
            <td id="quantity-${assetId}">${quantity.toFixed(4)}</td>
            <td id="value-${assetId}">$${formatCurrency(value)}</td>
            <td id="percentage-${assetId}">${percentage.toFixed(1)}%</td>
        `;

        tableBody.appendChild(row);
    }
}

// Update price ticker
function updatePriceTicker() {
    const priceTicker = document.getElementById('price-ticker');
    if (!priceTicker) return;

    // Clear ticker
    priceTicker.innerHTML = '';

    // Add ticker items for each asset
    for (const [asset, price] of Object.entries(gameState.assetPrices)) {
        const tickerItem = document.createElement('div');
        tickerItem.className = 'ticker-item';

        // Calculate price change
        let change = 0;
        let percentChange = 0;

        if (lastRoundPrices[asset] && lastPricesRoundNumber === gameState.roundNumber - 1) {
            change = price - lastRoundPrices[asset];
            percentChange = (change / lastRoundPrices[asset]) * 100;
        }

        // Determine change class
        let changeClass = '';
        let changeSign = '';

        if (change > 0) {
            changeClass = 'change-positive';
            changeSign = '+';
        } else if (change < 0) {
            changeClass = 'change-negative';
            changeSign = '';
        }

        tickerItem.innerHTML = `
            <span class="asset-name">${asset}:</span>
            <span class="price">$${formatCurrency(price)}</span>
            <span class="${changeClass}">${changeSign}${percentChange.toFixed(2)}%</span>
        `;

        priceTicker.appendChild(tickerItem);
    }
}

// Update portfolio chart
function updatePortfolioChart() {
    const chartCanvas = document.getElementById('portfolio-chart');
    if (!chartCanvas) return;

    // Prepare data
    const labels = Array.from({ length: playerState.portfolioValueHistory.length }, (_, i) => `Round ${i}`);
    const data = playerState.portfolioValueHistory;

    // Create or update chart
    if (!window.portfolioChart) {
        window.portfolioChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
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
                                return '$' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    } else {
        // Update existing chart
        window.portfolioChart.data.labels = labels;
        window.portfolioChart.data.datasets[0].data = data;
        window.portfolioChart.update();
    }
}

// Update portfolio allocation chart
function updatePortfolioAllocationChart() {
    const chartCanvas = document.getElementById('portfolio-allocation-chart');
    if (!chartCanvas) return;

    // Prepare data
    const assets = Object.keys(playerState.portfolio).filter(asset => playerState.portfolio[asset] > 0);
    const values = assets.map(asset => playerState.portfolio[asset] * gameState.assetPrices[asset]);
    const total = values.reduce((sum, value) => sum + value, 0);
    const percentages = values.map(value => (value / total) * 100);

    // Colors for each asset
    const colors = {
        'S&P 500': 'rgba(54, 162, 235, 0.8)',
        'Bonds': 'rgba(75, 192, 192, 0.8)',
        'Real Estate': 'rgba(255, 99, 132, 0.8)',
        'Gold': 'rgba(255, 206, 86, 0.8)',
        'Commodities': 'rgba(153, 102, 255, 0.8)',
        'Bitcoin': 'rgba(255, 159, 64, 0.8)'
    };

    // Create or update chart
    if (!window.portfolioAllocationChart) {
        window.portfolioAllocationChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: assets,
                datasets: [{
                    data: percentages,
                    backgroundColor: assets.map(asset => colors[asset] || 'rgba(128, 128, 128, 0.8)'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const asset = context.label;
                                const value = playerState.portfolio[asset] * gameState.assetPrices[asset];
                                return `${asset}: $${formatCurrency(value)} (${context.parsed.toFixed(1)}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // Update existing chart
        window.portfolioAllocationChart.data.labels = assets;
        window.portfolioAllocationChart.data.datasets[0].data = percentages;
        window.portfolioAllocationChart.data.datasets[0].backgroundColor = assets.map(asset => colors[asset] || 'rgba(128, 128, 128, 0.8)');
        window.portfolioAllocationChart.update();
    }
}

// Update asset price charts
function updateAssetPriceCharts() {
    // Initialize asset price charts object if it doesn't exist
    if (!window.assetPriceCharts) {
        window.assetPriceCharts = {};
    }

    // Update mini charts in market data table
    for (const [asset, priceHistory] of Object.entries(gameState.priceHistory)) {
        const assetId = asset.replace(/[^a-zA-Z0-9]/g, '-');
        const chartCanvas = document.getElementById(`mini-chart-${assetId}`);

        if (chartCanvas) {
            // Prepare data
            const data = priceHistory;

            // Create or update chart
            if (!window.assetPriceCharts[asset]) {
                window.assetPriceCharts[asset] = new Chart(chartCanvas, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: data.length }, (_, i) => i),
                        datasets: [{
                            data: data,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            pointRadius: 0,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                display: false
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            }
                        },
                        elements: {
                            line: {
                                tension: 0.4
                            }
                        }
                    }
                });
            } else {
                // Update existing chart
                window.assetPriceCharts[asset].data.labels = Array.from({ length: data.length }, (_, i) => i);
                window.assetPriceCharts[asset].data.datasets[0].data = data;
                window.assetPriceCharts[asset].update();
            }
        }
    }
}

// Update CPI chart
function updateCPIChart() {
    const chartCanvas = document.getElementById('cpi-chart');
    if (!chartCanvas) return;

    // Prepare data
    const labels = Array.from({ length: gameState.CPIHistory.length }, (_, i) => `Round ${i}`);
    const data = gameState.CPIHistory;

    // Create or update chart
    if (!window.cpiChart) {
        window.cpiChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CPI',
                    data: data,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    } else {
        // Update existing chart
        window.cpiChart.data.labels = labels;
        window.cpiChart.data.datasets[0].data = data;
        window.cpiChart.update();
    }
}

// Update Bitcoin market phase indicator
function updateBitcoinMarketPhase() {
    // Check if Bitcoin utils are available
    if (typeof window.BitcoinUtils === 'undefined') {
        console.log('Bitcoin utils not available');
        return;
    }

    // Get current Bitcoin market phase
    const marketPhase = window.BitcoinUtils.getBitcoinMarketPhase(gameState.roundNumber);

    // Try to find Bitcoin row in market data table
    const bitcoinRow = document.querySelector('#market-data-table-body tr:nth-child(6)');
    if (bitcoinRow) {
        // Check if phase indicator already exists
        let phaseIndicator = bitcoinRow.querySelector('.bitcoin-phase-indicator');

        if (!phaseIndicator) {
            // Create phase indicator if it doesn't exist
            const bitcoinCell = bitcoinRow.querySelector('td:first-child');
            if (bitcoinCell) {
                phaseIndicator = document.createElement('span');
                phaseIndicator.className = 'badge ml-2 bitcoin-phase-indicator';
                phaseIndicator.id = 'bitcoin-phase-indicator';
                bitcoinCell.appendChild(phaseIndicator);
            }
        }

        if (phaseIndicator) {
            // Update phase text
            phaseIndicator.textContent = marketPhase.charAt(0).toUpperCase() + marketPhase.slice(1);

            // Update phase color
            phaseIndicator.className = 'badge ml-2 bitcoin-phase-indicator';
            switch (marketPhase) {
                case 'accumulation':
                    phaseIndicator.classList.add('badge-info');
                    break;
                case 'bull':
                    phaseIndicator.classList.add('badge-success');
                    break;
                case 'distribution':
                    phaseIndicator.classList.add('badge-warning');
                    break;
                case 'bear':
                    phaseIndicator.classList.add('badge-danger');
                    break;
                default:
                    phaseIndicator.classList.add('badge-secondary');
            }
        }
    }
}

// Update comparative returns chart
function updateComparativeReturnsChart() {
    const chartCanvas = document.getElementById('comparative-returns-chart');
    if (!chartCanvas) return;

    // Prepare data
    const labels = Array.from({ length: gameState.roundNumber + 1 }, (_, i) => `Round ${i}`);

    // Calculate returns for each asset
    const datasets = [];

    // Colors for each asset
    const colors = {
        'S&P 500': 'rgba(54, 162, 235, 1)',
        'Bonds': 'rgba(75, 192, 192, 1)',
        'Real Estate': 'rgba(255, 99, 132, 1)',
        'Gold': 'rgba(255, 206, 86, 1)',
        'Commodities': 'rgba(153, 102, 255, 1)',
        'Bitcoin': 'rgba(255, 159, 64, 1)',
        'CPI': 'rgba(220, 53, 69, 1)'
    };

    // Add datasets for each asset
    for (const [asset, priceHistory] of Object.entries(gameState.priceHistory)) {
        if (priceHistory.length > 0) {
            const initialPrice = priceHistory[0];
            const returns = priceHistory.map(price => ((price / initialPrice) - 1) * 100);

            datasets.push({
                label: asset,
                data: returns,
                borderColor: colors[asset] || 'rgba(128, 128, 128, 1)',
                backgroundColor: colors[asset] || 'rgba(128, 128, 128, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: false,
                hidden: asset !== 'S&P 500' && asset !== 'Bitcoin' // Only show S&P 500 and Bitcoin by default
            });
        }
    }

    // Add CPI dataset
    if (gameState.CPIHistory.length > 0) {
        const initialCPI = gameState.CPIHistory[0];
        const cpiReturns = gameState.CPIHistory.map(cpi => ((cpi / initialCPI) - 1) * 100);

        datasets.push({
            label: 'CPI',
            data: cpiReturns,
            borderColor: colors['CPI'],
            backgroundColor: colors['CPI'],
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            fill: false,
            hidden: true // Hide CPI by default
        });
    }

    // Create or update chart
    if (!window.comparativeReturnsChart) {
        window.comparativeReturnsChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    }
                }
            }
        });

        // Set up checkbox listeners for toggling datasets
        if (!window.checkboxListenersSet) {
            setupCheckboxListeners();
            window.checkboxListenersSet = true;
        }
    } else {
        // Update existing chart
        window.comparativeReturnsChart.data.labels = labels;
        window.comparativeReturnsChart.data.datasets = datasets;
        window.comparativeReturnsChart.update();
    }
}

// Setup checkbox listeners for toggling datasets
function setupCheckboxListeners() {
    const checkboxes = {
        'show-sp500': 'S&P 500',
        'show-bonds': 'Bonds',
        'show-real-estate': 'Real Estate',
        'show-gold': 'Gold',
        'show-commodities': 'Commodities',
        'show-bitcoin': 'Bitcoin',
        'show-cpi': 'CPI'
    };

    for (const [checkboxId, datasetLabel] of Object.entries(checkboxes)) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const chart = window.comparativeReturnsChart;
                if (chart) {
                    const datasetIndex = chart.data.datasets.findIndex(dataset => dataset.label === datasetLabel);
                    if (datasetIndex !== -1) {
                        chart.setDatasetVisibility(datasetIndex, checkbox.checked);
                        chart.update();
                    }
                }
            });
        }
    }

    // Reset zoom button
    const resetZoomBtn = document.getElementById('reset-comparative-zoom');
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', function() {
            if (window.comparativeReturnsChart) {
                window.comparativeReturnsChart.resetZoom();
            }
        });
    }
}

// Update asset price in trade form
function updateAssetPrice() {
    const assetSelect = document.getElementById('asset-select');
    const currentPriceDisplay = document.getElementById('current-price-display');

    if (assetSelect && currentPriceDisplay) {
        const asset = assetSelect.value;
        const price = gameState.assetPrices[asset] || 0;
        currentPriceDisplay.textContent = formatCurrency(price);
    }
}

// Initialize trading form with amount input
document.addEventListener('DOMContentLoaded', function() {
    const assetSelect = document.getElementById('asset-select');
    const actionSelect = document.getElementById('action-select');
    const quantityInput = document.getElementById('quantity-input');
    const amountInput = document.getElementById('amount-input');
    const availableCashDisplay = document.getElementById('available-cash-display');
    const amountSlider = document.getElementById('amount-slider');
    const quantitySlider = document.getElementById('quantity-slider');
    const amountPercentage = document.getElementById('amount-percentage');
    const quantityPercentage = document.getElementById('quantity-percentage');
    const amountPercentBtns = document.querySelectorAll('.amount-percent-btn');
    const quantityPercentBtns = document.querySelectorAll('.quantity-percent-btn');
    const quantityUnit = document.getElementById('quantity-unit');

    // Initialize available cash display
    if (availableCashDisplay && playerState) {
        availableCashDisplay.textContent = formatCurrency(playerState.cash);
    }

    // Update quantity unit based on selected asset
    if (assetSelect && quantityUnit) {
        assetSelect.addEventListener('change', function() {
            const asset = assetSelect.value;
            if (asset === 'Bitcoin') {
                quantityUnit.textContent = 'BTC';
            } else {
                quantityUnit.textContent = 'units';
            }
        });
    }

    // Asset select change
    if (assetSelect) {
        assetSelect.addEventListener('change', function() {
            updateAssetPrice();
            updateTotalCost();
        });
    }

    // Action select change
    if (actionSelect) {
        actionSelect.addEventListener('change', function() {
            updateTotalCost();
        });
    }

    // Quantity input change
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            updateTotalCost();
        });
    }

    // Amount input change
    if (amountInput && assetSelect) {
        amountInput.addEventListener('input', function() {
            const asset = assetSelect.value;
            const price = gameState.assetPrices[asset] || 0;
            const amount = parseFloat(amountInput.value) || 0;

            if (price > 0) {
                const quantity = amount / price;
                quantityInput.value = quantity.toFixed(6);

                // Update total cost
                updateTotalCost();

                // Update amount slider and percentage
                if (amountSlider && amountPercentage && playerState) {
                    const percentage = Math.min(100, (amount / playerState.cash) * 100);
                    amountSlider.value = percentage;
                    amountPercentage.value = percentage.toFixed(0);
                }
            }
        });
    }

    // Amount slider functionality
    if (amountSlider && amountInput && playerState) {
        amountSlider.addEventListener('input', function() {
            const percentage = parseFloat(amountSlider.value) || 0;
            const maxAmount = playerState.cash;
            const amount = (percentage / 100) * maxAmount;
            amountInput.value = amount.toFixed(2);
            amountPercentage.value = percentage.toFixed(0);

            // Trigger the amount input event to update quantity
            const event = new Event('input', { bubbles: true });
            amountInput.dispatchEvent(event);
        });
    }

    // Quantity slider functionality
    if (quantitySlider && quantityInput && assetSelect && actionSelect) {
        quantitySlider.addEventListener('input', function() {
            const percentage = parseFloat(quantitySlider.value) || 0;
            const asset = assetSelect.value;
            const action = actionSelect.value;

            if (action === 'sell') {
                const maxQuantity = playerState.portfolio[asset] || 0;
                const quantity = (percentage / 100) * maxQuantity;
                quantityInput.value = quantity.toFixed(6);
                quantityPercentage.value = percentage.toFixed(0);

                // Trigger the quantity input event to update amount
                const event = new Event('input', { bubbles: true });
                quantityInput.dispatchEvent(event);
            }
        });
    }

    // Amount percentage input functionality
    if (amountPercentage && amountInput && playerState) {
        amountPercentage.addEventListener('input', function() {
            const percentage = Math.min(100, Math.max(0, parseFloat(amountPercentage.value) || 0));
            const maxAmount = playerState.cash;
            const amount = (percentage / 100) * maxAmount;
            amountInput.value = amount.toFixed(2);
            amountSlider.value = percentage;

            // Trigger the amount input event to update quantity
            const event = new Event('input', { bubbles: true });
            amountInput.dispatchEvent(event);
        });
    }

    // Quantity percentage input functionality
    if (quantityPercentage && quantityInput && assetSelect && actionSelect) {
        quantityPercentage.addEventListener('input', function() {
            const percentage = Math.min(100, Math.max(0, parseFloat(quantityPercentage.value) || 0));
            const asset = assetSelect.value;
            const action = actionSelect.value;

            if (action === 'sell') {
                const maxQuantity = playerState.portfolio[asset] || 0;
                const quantity = (percentage / 100) * maxQuantity;
                quantityInput.value = quantity.toFixed(6);
                quantitySlider.value = percentage;

                // Trigger the quantity input event to update amount
                const event = new Event('input', { bubbles: true });
                quantityInput.dispatchEvent(event);
            }
        });
    }

    // Amount percentage buttons
    if (amountPercentBtns.length > 0) {
        amountPercentBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const percentage = parseInt(this.getAttribute('data-percent'));
                amountPercentage.value = percentage;

                // Trigger the percentage input event
                const event = new Event('input', { bubbles: true });
                amountPercentage.dispatchEvent(event);
            });
        });
    }

    // Quantity percentage buttons
    if (quantityPercentBtns.length > 0) {
        quantityPercentBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const percentage = parseInt(this.getAttribute('data-percent'));
                quantityPercentage.value = percentage;

                // Trigger the percentage input event
                const event = new Event('input', { bubbles: true });
                quantityPercentage.dispatchEvent(event);
            });
        });
    }

    // Select all assets button
    const selectAllAssetsBtn = document.getElementById('select-all-assets-btn');
    if (selectAllAssetsBtn) {
        selectAllAssetsBtn.addEventListener('click', function(event) {
            event.preventDefault();
            const checkboxes = document.querySelectorAll('.diversify-asset');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        });
    }

    // Deselect all assets button
    const deselectAllAssetsBtn = document.getElementById('deselect-all-assets-btn');
    if (deselectAllAssetsBtn) {
        deselectAllAssetsBtn.addEventListener('click', function(event) {
            event.preventDefault();
            const checkboxes = document.querySelectorAll('.diversify-asset');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        });
    }

    // Add event listener for buy-selected-btn
    const buySelectedBtn = document.getElementById('buy-selected-btn');
    if (buySelectedBtn) {
        buySelectedBtn.addEventListener('click', function(event) {
            event.preventDefault();
            buySelectedAssets();
        });
    }

    // Add event listener for buy-all-btn
    const buyAllBtn = document.getElementById('buy-all-btn');
    if (buyAllBtn) {
        buyAllBtn.addEventListener('click', function(event) {
            event.preventDefault();
            buyAllAssets();
        });
    }

    // Add event listener for sell-all-btn
    const sellAllBtn = document.getElementById('sell-all-btn');
    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', function(event) {
            event.preventDefault();
            sellAllAssets();
        });
    }
});
