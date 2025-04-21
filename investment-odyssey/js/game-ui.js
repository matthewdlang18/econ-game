/**
 * Game UI for Investment Odyssey
 *
 * This file contains the UI-related functions for the game.
 */

// Chart objects
let portfolioChart = null;
let portfolioAllocationChart = null;
let assetPriceCharts = {};
let cpiChart = null;
let comparativeReturnsChart = null;

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

        // Update round display
        updateElementText('current-round-display', gameState.roundNumber);

        // Update round progress
        const progressPercent = (gameState.roundNumber / gameState.maxRounds) * 100;
        const roundProgress = document.getElementById('round-progress');
        if (roundProgress) {
            roundProgress.style.width = `${progressPercent}%`;
            roundProgress.setAttribute('aria-valuenow', progressPercent);
            roundProgress.textContent = `${progressPercent.toFixed(0)}%`;
        }

        // Update cash display
        updateElementText('cash-display', playerState.cash.toFixed(2));

        // Update portfolio value display
        const portfolioValue = calculatePortfolioValue();
        updateElementText('portfolio-value-display', portfolioValue.toFixed(2));
        updateElementText('portfolio-value-badge', portfolioValue.toFixed(2));

        // Update total value display
        updateElementText('total-value-display', (playerState.cash + portfolioValue).toFixed(2));

        // Update CPI display
        updateElementText('cpi-display', gameState.CPI.toFixed(2));

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

// Update market data table
function updateMarketData() {
    const marketDataBody = document.getElementById('asset-prices-table');
    if (!marketDataBody) return;

    marketDataBody.innerHTML = '';

    // Update the round display in the market data header
    const marketRoundDisplay = document.getElementById('market-round-display');
    if (marketRoundDisplay) {
        marketRoundDisplay.textContent = gameState.roundNumber;
    }

    for (const asset in gameState.assetPrices) {
        const row = document.createElement('tr');
        const price = gameState.assetPrices[asset];

        // Calculate price change
        let change = 0;
        let percentChange = 0;
        let changeClass = '';
        let changeIcon = '';

        if (gameState.priceHistory[asset] && gameState.priceHistory[asset].length > 0) {
            const previousPrice = gameState.priceHistory[asset][gameState.priceHistory[asset].length - 1];
            change = price - previousPrice;
            percentChange = (change / previousPrice) * 100;

            if (change > 0) {
                changeClass = 'text-success';
                changeIcon = '<i class="fas fa-arrow-up mr-1"></i>';
            } else if (change < 0) {
                changeClass = 'text-danger';
                changeIcon = '<i class="fas fa-arrow-down mr-1"></i>';
            }
        }

        // Get portfolio quantity and value
        const quantity = playerState.portfolio[asset] || 0;
        const value = quantity * price;
        const portfolioTotal = calculatePortfolioValue() + playerState.cash;
        const percentage = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;

        row.innerHTML = `
            <td>${asset}</td>
            <td>$${price.toFixed(2)}</td>
            <td class="${changeClass}">${changeIcon}${change.toFixed(2)} (${percentChange.toFixed(2)}%)</td>
            <td>${quantity.toFixed(4)}</td>
            <td>$${value.toFixed(2)}</td>
            <td>${percentage.toFixed(1)}%</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-success btn-sm buy-asset-btn" data-asset="${asset}">Buy</button>
                    ${quantity > 0 ? `<button type="button" class="btn btn-outline-danger btn-sm sell-asset-btn" data-asset="${asset}">Sell</button>` : ''}
                </div>
            </td>
        `;

        marketDataBody.appendChild(row);
    }

    // Add event listeners to the buy/sell buttons
    const buyButtons = document.querySelectorAll('.buy-asset-btn');
    const sellButtons = document.querySelectorAll('.sell-asset-btn');

    buyButtons.forEach(button => {
        button.addEventListener('click', handleBuyAssetClick);
    });

    sellButtons.forEach(button => {
        button.addEventListener('click', handleSellAssetClick);
    });
}

// Update portfolio table
function updatePortfolioTable() {
    const portfolioBody = document.getElementById('portfolio-body');
    if (!portfolioBody) return;

    portfolioBody.innerHTML = '';

    // Remove existing event listeners
    const oldBuyButtons = document.querySelectorAll('.buy-asset-btn');
    const oldSellButtons = document.querySelectorAll('.sell-asset-btn');

    oldBuyButtons.forEach(button => {
        button.removeEventListener('click', handleBuyAssetClick);
    });

    oldSellButtons.forEach(button => {
        button.removeEventListener('click', handleSellAssetClick);
    });

    for (const asset in gameState.assetPrices) {
        const row = document.createElement('tr');
        const price = gameState.assetPrices[asset];

        // Calculate price change
        let change = 0;
        let percentChange = 0;
        let changeClass = '';
        let changeIcon = '';

        if (gameState.priceHistory[asset] && gameState.priceHistory[asset].length > 0) {
            const previousPrice = gameState.priceHistory[asset][gameState.priceHistory[asset].length - 1];
            change = price - previousPrice;
            percentChange = (change / previousPrice) * 100;

            if (change > 0) {
                changeClass = 'text-success';
                changeIcon = '<i class="fas fa-arrow-up mr-1"></i>';
            } else if (change < 0) {
                changeClass = 'text-danger';
                changeIcon = '<i class="fas fa-arrow-down mr-1"></i>';
            }
        }

        // Get asset ID for DOM elements
        const assetId = asset.replace(/[^a-zA-Z0-9]/g, '-');

        // Get portfolio quantity and value
        const quantity = playerState.portfolio[asset] || 0;
        const value = quantity * price;
        const portfolioTotal = calculatePortfolioValue() + playerState.cash;
        const percentage = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;

        row.innerHTML = `
            <td>${asset}</td>
            <td class="price-cell" id="price-${assetId}">$${price.toFixed(2)}</td>
            <td class="${changeClass}" id="change-${assetId}">${changeIcon}${change.toFixed(2)} (${percentChange.toFixed(2)}%)</td>
            <td id="quantity-${assetId}">${quantity.toFixed(4)}</td>
            <td id="value-${assetId}">$${value.toFixed(2)}</td>
            <td id="percentage-${assetId}">${percentage.toFixed(1)}%</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-success btn-sm buy-asset-btn" data-asset="${asset}">Buy</button>
                    ${quantity > 0 ? `<button type="button" class="btn btn-outline-danger btn-sm sell-asset-btn" data-asset="${asset}">Sell</button>` : ''}
                </div>
            </td>
        `;

        portfolioBody.appendChild(row);
    }

    // Add event listeners to the new buttons
    const buyButtons = document.querySelectorAll('.buy-asset-btn');
    const sellButtons = document.querySelectorAll('.sell-asset-btn');

    buyButtons.forEach(button => {
        button.addEventListener('click', handleBuyAssetClick);
    });

    sellButtons.forEach(button => {
        button.addEventListener('click', handleSellAssetClick);
    });
}

// Update price ticker
function updatePriceTicker() {
    const priceTicker = document.getElementById('price-ticker');
    if (!priceTicker) return;

    priceTicker.innerHTML = '';

    for (const asset in gameState.assetPrices) {
        const price = gameState.assetPrices[asset];

        // Calculate price change
        let change = 0;
        let percentChange = 0;
        let changeClass = '';
        let changeIcon = '';

        if (gameState.priceHistory[asset] && gameState.priceHistory[asset].length > 0) {
            const previousPrice = gameState.priceHistory[asset][gameState.priceHistory[asset].length - 1];
            change = price - previousPrice;
            percentChange = (change / previousPrice) * 100;

            if (change > 0) {
                changeClass = 'ticker-up';
                changeIcon = '▲';
            } else if (change < 0) {
                changeClass = 'ticker-down';
                changeIcon = '▼';
            }
        }

        const tickerItem = document.createElement('div');
        tickerItem.className = 'ticker-item';
        tickerItem.innerHTML = `
            <span class="ticker-asset">${asset}</span>
            <span class="ticker-price">$${price.toFixed(2)}</span>
            <span class="ticker-change ${changeClass}">${changeIcon} ${percentChange.toFixed(2)}%</span>
        `;

        priceTicker.appendChild(tickerItem);
    }
}

// Update asset price in trade form
function updateAssetPrice() {
    const assetSelect = document.getElementById('asset-select');
    const assetPriceDisplay = document.getElementById('asset-price-display');
    const availableCashDisplay = document.getElementById('available-cash-display');

    if (!assetSelect || !assetPriceDisplay) return;

    const selectedAsset = assetSelect.value;
    const price = gameState.assetPrices[selectedAsset];

    if (price) {
        assetPriceDisplay.textContent = price.toFixed(2);
    }

    if (availableCashDisplay) {
        availableCashDisplay.textContent = playerState.cash.toFixed(2);
    }
}

// Update portfolio chart
function updatePortfolioChart() {
    const portfolioChartCanvas = document.getElementById('portfolio-chart');
    if (!portfolioChartCanvas) return;

    // Prepare data
    const labels = [];
    const cashData = [];
    const portfolioData = [];
    const totalData = [];

    // Add initial point if we have no history yet
    if (playerState.portfolioHistory.length === 0) {
        labels.push('Start');
        cashData.push(playerState.cash);
        portfolioData.push(calculatePortfolioValue());
        totalData.push(playerState.cash + calculatePortfolioValue());
    }

    // Add data from portfolio history
    for (const entry of playerState.portfolioHistory) {
        labels.push(`Round ${entry.round}`);
        cashData.push(entry.cash);
        portfolioData.push(entry.portfolioValue);
        totalData.push(entry.totalValue);
    }

    // Add current round if not in history yet
    if (gameState.roundNumber > 0 &&
        (playerState.portfolioHistory.length === 0 ||
         playerState.portfolioHistory[playerState.portfolioHistory.length - 1].round !== gameState.roundNumber)) {
        labels.push(`Round ${gameState.roundNumber}`);
        cashData.push(playerState.cash);
        portfolioData.push(calculatePortfolioValue());
        totalData.push(playerState.cash + calculatePortfolioValue());
    }

    // Create or update chart
    if (portfolioChart) {
        portfolioChart.data.labels = labels;
        portfolioChart.data.datasets[0].data = cashData;
        portfolioChart.data.datasets[1].data = portfolioData;
        portfolioChart.data.datasets[2].data = totalData;
        portfolioChart.update();
    } else {
        portfolioChart = new Chart(portfolioChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Cash',
                        data: cashData,
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Portfolio',
                        data: portfolioData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Total',
                        data: totalData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Value ($)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Value Over Time'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.raw.toFixed(2);
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
    const portfolioAllocationChartCanvas = document.getElementById('portfolio-allocation-chart');
    if (!portfolioAllocationChartCanvas) return;

    // Prepare data
    const labels = [];
    const data = [];
    const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];

    // Add cash
    labels.push('Cash');
    data.push(playerState.cash);

    // Add assets
    let i = 0;
    for (const asset in playerState.portfolio) {
        const quantity = playerState.portfolio[asset];
        const value = quantity * gameState.assetPrices[asset];

        if (value > 0) {
            labels.push(asset);
            data.push(value);
        }

        i++;
    }

    // Create or update chart
    if (portfolioAllocationChart) {
        portfolioAllocationChart.data.labels = labels;
        portfolioAllocationChart.data.datasets[0].data = data;
        portfolioAllocationChart.update();
    } else {
        portfolioAllocationChart = new Chart(portfolioAllocationChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Allocation'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return context.label + ': $' + value.toFixed(2) + ' (' + percentage + '%)';
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
    for (const asset in gameState.assetPrices) {
        const assetId = asset.replace(/[^a-zA-Z0-9]/g, '-');
        const chartCanvas = document.getElementById(`${assetId}-chart`);
        if (!chartCanvas) continue;

        // Prepare data
        const labels = [];
        const data = [];

        // Add data from price history
        for (let i = 0; i < gameState.priceHistory[asset].length; i++) {
            labels.push(`Round ${i}`);
            data.push(gameState.priceHistory[asset][i]);
        }

        // Add current price
        labels.push(`Round ${gameState.roundNumber}`);
        data.push(gameState.assetPrices[asset]);

        // Create or update chart
        if (assetPriceCharts[asset]) {
            assetPriceCharts[asset].data.labels = labels;
            assetPriceCharts[asset].data.datasets[0].data = data;
            assetPriceCharts[asset].update();
        } else {
            assetPriceCharts[asset] = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: asset,
                            data: data,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Price ($)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `${asset} Price History`
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': $' + context.raw.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

// Update CPI chart
function updateCPIChart() {
    const cpiChartCanvas = document.getElementById('cpi-chart');
    if (!cpiChartCanvas) return;

    // Prepare data
    const labels = [];
    const data = [];

    // Add data from CPI history
    for (let i = 0; i < gameState.CPIHistory.length; i++) {
        labels.push(`Round ${i}`);
        data.push(gameState.CPIHistory[i]);
    }

    // Add current CPI
    labels.push(`Round ${gameState.roundNumber}`);
    data.push(gameState.CPI);

    // Create or update chart
    if (cpiChart) {
        cpiChart.data.labels = labels;
        cpiChart.data.datasets[0].data = data;
        cpiChart.update();
    } else {
        cpiChart = new Chart(cpiChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'CPI',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'CPI'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Inflation (CPI) Over Time'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Handle buy asset button click
function handleBuyAssetClick(event) {
    const asset = event.currentTarget.getAttribute('data-asset');
    console.log(`Buy button clicked for ${asset}`);

    // Set the asset in the trade form
    const assetSelect = document.getElementById('asset-select');
    if (assetSelect) {
        assetSelect.value = asset;
        assetSelect.dispatchEvent(new Event('change'));
    }

    // Set action to buy
    const actionSelect = document.getElementById('action-select');
    if (actionSelect) {
        actionSelect.value = 'buy';
        actionSelect.dispatchEvent(new Event('change'));
    }

    // Update radio buttons
    const actionBuy = document.getElementById('action-buy');
    if (actionBuy) {
        actionBuy.checked = true;
    }

    // Show buy button, hide sell button
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');
    if (buyBtn && sellBtn) {
        buyBtn.style.display = 'inline-block';
        sellBtn.style.display = 'none';
    }

    // Focus on the amount input
    const amountInput = document.getElementById('amount-input');
    if (amountInput) {
        amountInput.focus();
        amountInput.value = '';
    }

    // Clear quantity input
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        quantityInput.value = '';
    }

    // Scroll to the trade form
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle sell asset button click
function handleSellAssetClick(event) {
    const asset = event.currentTarget.getAttribute('data-asset');
    console.log(`Sell button clicked for ${asset}`);

    // Set the asset in the trade form
    const assetSelect = document.getElementById('asset-select');
    if (assetSelect) {
        assetSelect.value = asset;
        assetSelect.dispatchEvent(new Event('change'));
    }

    // Set action to sell
    const actionSelect = document.getElementById('action-select');
    if (actionSelect) {
        actionSelect.value = 'sell';
        actionSelect.dispatchEvent(new Event('change'));
    }

    // Update radio buttons
    const actionSell = document.getElementById('action-sell');
    if (actionSell) {
        actionSell.checked = true;
    }

    // Show sell button, hide buy button
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');
    if (buyBtn && sellBtn) {
        buyBtn.style.display = 'none';
        sellBtn.style.display = 'inline-block';
    }

    // Focus on the amount input
    const amountInput = document.getElementById('amount-input');
    if (amountInput) {
        amountInput.focus();
        amountInput.value = '';
    }

    // Clear quantity input
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        quantityInput.value = '';
    }

    // Scroll to the trade form
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update comparative returns chart
function updateComparativeReturnsChart() {
    const comparativeReturnsChartCanvas = document.getElementById('comparative-returns-chart');
    if (!comparativeReturnsChartCanvas) return;

    // Prepare data
    const labels = Object.keys(gameState.assetPrices);
    const data = [];

    // Calculate returns
    for (const asset in gameState.assetPrices) {
        if (gameState.priceHistory[asset].length > 0) {
            const initialPrice = gameState.priceHistory[asset][0];
            const currentPrice = gameState.assetPrices[asset];
            const returnPercent = ((currentPrice / initialPrice) - 1) * 100;
            data.push(returnPercent);
        } else {
            data.push(0);
        }
    }

    // Create or update chart
    if (comparativeReturnsChart) {
        comparativeReturnsChart.data.labels = labels;
        comparativeReturnsChart.data.datasets[0].data = data;
        comparativeReturnsChart.update();
    } else {
        comparativeReturnsChart = new Chart(comparativeReturnsChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Return (%)',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Return (%)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparative Returns'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw.toFixed(2) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Reset all charts
function resetAllCharts() {
    if (portfolioChart) {
        portfolioChart.destroy();
        portfolioChart = null;
    }

    if (portfolioAllocationChart) {
        portfolioAllocationChart.destroy();
        portfolioAllocationChart = null;
    }

    for (const asset in assetPriceCharts) {
        if (assetPriceCharts[asset]) {
            assetPriceCharts[asset].destroy();
            delete assetPriceCharts[asset];
        }
    }

    if (cpiChart) {
        cpiChart.destroy();
        cpiChart = null;
    }

    if (comparativeReturnsChart) {
        comparativeReturnsChart.destroy();
        comparativeReturnsChart = null;
    }
}

// Handle buy asset button click
function handleBuyAssetClick(event) {
    const asset = event.currentTarget.getAttribute('data-asset');
    if (!asset) return;

    // Set the asset in the trade form
    const assetSelect = document.getElementById('asset-select');
    if (assetSelect) {
        assetSelect.value = asset;
    }

    // Set action to buy
    const actionSelect = document.getElementById('action-select');
    if (actionSelect) {
        actionSelect.value = 'buy';
    }

    // Update radio buttons
    const actionBuy = document.getElementById('action-buy');
    if (actionBuy) {
        actionBuy.checked = true;
    }

    // Update form
    updateTradeForm();

    // Scroll to trade form
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle sell asset button click
function handleSellAssetClick(event) {
    const asset = event.currentTarget.getAttribute('data-asset');
    if (!asset) return;

    // Set the asset in the trade form
    const assetSelect = document.getElementById('asset-select');
    if (assetSelect) {
        assetSelect.value = asset;
    }

    // Set action to sell
    const actionSelect = document.getElementById('action-select');
    if (actionSelect) {
        actionSelect.value = 'sell';
    }

    // Update radio buttons
    const actionSell = document.getElementById('action-sell');
    if (actionSell) {
        actionSell.checked = true;
    }

    // Update form
    updateTradeForm();

    // Set quantity to 100% of holdings
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        const quantity = playerState.portfolio[asset] || 0;
        quantityInput.value = quantity.toFixed(4);
    }

    // Scroll to trade form
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add chart zoom functionality
document.addEventListener('DOMContentLoaded', function() {
    // Portfolio chart zoom buttons
    const zoomInPortfolio = document.getElementById('zoom-in-portfolio');
    const zoomOutPortfolio = document.getElementById('zoom-out-portfolio');
    const resetZoomPortfolio = document.getElementById('reset-zoom-portfolio');

    if (zoomInPortfolio && zoomOutPortfolio && resetZoomPortfolio) {
        zoomInPortfolio.addEventListener('click', function() {
            if (portfolioChart) {
                const yScale = portfolioChart.scales.y;
                const currentMin = yScale.min || 0;
                const currentMax = yScale.max || 100;
                const range = currentMax - currentMin;
                const newMin = currentMin + range * 0.2;
                const newMax = currentMax - range * 0.2;

                portfolioChart.options.scales.y.min = newMin;
                portfolioChart.options.scales.y.max = newMax;
                portfolioChart.update();
            }
        });

        zoomOutPortfolio.addEventListener('click', function() {
            if (portfolioChart) {
                const yScale = portfolioChart.scales.y;
                const currentMin = yScale.min || 0;
                const currentMax = yScale.max || 100;
                const range = currentMax - currentMin;
                const newMin = Math.max(0, currentMin - range * 0.2);
                const newMax = currentMax + range * 0.2;

                portfolioChart.options.scales.y.min = newMin;
                portfolioChart.options.scales.y.max = newMax;
                portfolioChart.update();
            }
        });

        resetZoomPortfolio.addEventListener('click', function() {
            if (portfolioChart) {
                portfolioChart.options.scales.y.min = undefined;
                portfolioChart.options.scales.y.max = undefined;
                portfolioChart.update();
            }
        });
    }

    // Toggle doughnut/pie chart button
    const toggleDoughnut = document.getElementById('toggle-doughnut');
    if (toggleDoughnut) {
        toggleDoughnut.addEventListener('click', function() {
            if (portfolioAllocationChart) {
                const currentType = portfolioAllocationChart.config.type;
                portfolioAllocationChart.config.type = currentType === 'doughnut' ? 'pie' : 'doughnut';
                portfolioAllocationChart.update();
            }
        });
    }
});

// Make functions available globally
window.updateUI = updateUI;
window.updateMarketData = updateMarketData;
window.updatePortfolioTable = updatePortfolioTable;
window.updatePriceTicker = updatePriceTicker;
window.updateAssetPrice = updateAssetPrice;
window.updatePortfolioChart = updatePortfolioChart;
window.updatePortfolioAllocationChart = updatePortfolioAllocationChart;
window.updateAssetPriceCharts = updateAssetPriceCharts;
window.updateCPIChart = updateCPIChart;
window.updateComparativeReturnsChart = updateComparativeReturnsChart;
window.resetAllCharts = resetAllCharts;
window.handleBuyAssetClick = handleBuyAssetClick;
window.handleSellAssetClick = handleSellAssetClick;
