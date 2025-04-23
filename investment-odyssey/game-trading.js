// Trading Functions for Investment Odyssey

// Set amount based on percentage of available cash
function setAmountPercentage(percentage) {
    const amountInput = document.getElementById('trade-amount');
    const actionSelect = document.getElementById('trade-action');

    if (!amountInput || !actionSelect) return;

    const action = actionSelect.value;

    if (action === 'buy' && playerState.cash > 0) {
        const amount = (playerState.cash * (percentage / 100)).toFixed(2);
        amountInput.value = amount;
        // Trigger the input event to update related fields
        amountInput.dispatchEvent(new Event('input'));
    }
}

// Set quantity based on percentage of available asset
function setQuantityPercentage(percentage) {
    const quantityInput = document.getElementById('trade-quantity');
    const assetSelect = document.getElementById('trade-asset');
    const actionSelect = document.getElementById('trade-action');

    if (!quantityInput || !assetSelect || !actionSelect) return;

    const asset = assetSelect.value;
    const action = actionSelect.value;

    if (action === 'sell' && asset) {
        const availableQuantity = playerState.portfolio[asset] || 0;
        if (availableQuantity > 0) {
            const quantity = (availableQuantity * (percentage / 100)).toFixed(6);
            quantityInput.value = quantity;
            // Trigger the input event to update related fields
            quantityInput.dispatchEvent(new Event('input'));
        }
    }
}

// Execute trade
function executeTrade() {
    const assetSelect = document.getElementById('trade-asset');
    const actionSelect = document.getElementById('trade-action');
    const quantityInput = document.getElementById('trade-quantity');

    if (!assetSelect || !actionSelect || !quantityInput) return;

    const asset = assetSelect.value;
    const action = actionSelect.value;
    const quantity = parseFloat(quantityInput.value) || 0;

    if (!asset || quantity <= 0) {
        showNotification('Please select an asset and enter a valid quantity', 'warning');
        return;
    }

    const price = gameState.assetPrices[asset] || 0;

    if (price <= 0) {
        showNotification('Invalid asset price', 'danger');
        return;
    }

    if (action === 'buy') {
        // Check if player has enough cash
        const cost = price * quantity;

        if (playerState.cash < cost) {
            showNotification('Not enough cash to complete this purchase', 'warning');
            return;
        }

        // Update player state
        playerState.cash -= cost;

        if (!playerState.portfolio[asset]) {
            playerState.portfolio[asset] = 0;
        }

        playerState.portfolio[asset] += quantity;

        // Add to trade history
        playerState.tradeHistory.push({
            asset: asset,
            action: 'buy',
            quantity: quantity,
            price: price,
            cost: cost,
            timestamp: new Date(),
            round: currentRound
        });

        showNotification(`Successfully bought ${quantity.toFixed(6)} ${asset} for $${cost.toFixed(2)}`, 'success');
    } else {
        // Check if player has enough of the asset
        const currentQuantity = playerState.portfolio[asset] || 0;

        if (currentQuantity < quantity) {
            showNotification('Not enough of this asset to sell', 'warning');
            return;
        }

        // Calculate value
        const value = price * quantity;

        // Update player state
        playerState.cash += value;
        playerState.portfolio[asset] -= quantity;

        // Remove asset from portfolio if quantity is 0
        if (playerState.portfolio[asset] <= 0) {
            delete playerState.portfolio[asset];
        }

        // Add to trade history
        playerState.tradeHistory.push({
            asset: asset,
            action: 'sell',
            quantity: quantity,
            price: price,
            value: value,
            timestamp: new Date(),
            round: currentRound
        });

        showNotification(`Successfully sold ${quantity.toFixed(6)} ${asset} for $${value.toFixed(2)}`, 'success');
    }

    // Update UI
    updateUI();

    // Reset form
    quantityInput.value = '';
    document.getElementById('trade-amount').value = '';
    updateTradeSummary();

    // Save game state
    saveGameState();
}

// Buy all assets evenly
function buyAllAssets() {
    try {
        console.log('Buying all assets evenly...');

        // Check if there are assets to buy
        const assetNames = Object.keys(gameState.assetPrices);

        if (assetNames.length === 0) {
            showNotification('No assets available to buy.', 'warning');
            return;
        }

        // Check if player has cash
        if (playerState.cash <= 0) {
            showNotification('No cash available to buy assets.', 'warning');
            return;
        }

        // Calculate amount per asset
        const amountPerAsset = playerState.cash / assetNames.length;

        if (amountPerAsset <= 0) {
            showNotification('Not enough cash to distribute.', 'warning');
            return;
        }

        console.log(`Distributing $${playerState.cash.toFixed(2)} across ${assetNames.length} assets ($${amountPerAsset.toFixed(2)} per asset)`);

        // Buy assets
        for (const asset of assetNames) {
            const price = gameState.assetPrices[asset];
            if (!price || price <= 0) {
                console.log(`Price not available for ${asset}, skipping.`);
                continue;
            }

            // Calculate quantity
            const quantity = amountPerAsset / price;

            console.log(`Buying ${asset}: Price=${price}, Quantity=${quantity.toFixed(6)}, Cost=${amountPerAsset.toFixed(2)}`);

            if (quantity > 0) {
                // Update player state
                if (!playerState.portfolio[asset]) {
                    playerState.portfolio[asset] = 0;
                }

                playerState.portfolio[asset] += quantity;

                // Add to trade history
                playerState.tradeHistory.push({
                    asset: asset,
                    action: 'buy',
                    quantity: quantity,
                    price: price,
                    cost: amountPerAsset,
                    timestamp: new Date(),
                    round: currentRound
                });
            }
        }

        // Set cash to 0
        playerState.cash = 0;

        // Update UI
        updateUI();

        // Save game state
        saveGameState();

        showNotification('Distributed cash evenly across all assets.', 'success');
    } catch (error) {
        console.error('Error in buyAllAssets:', error);
        showNotification('Error buying all assets. Please try again.', 'danger');
    }
}

// Buy selected assets evenly
function buySelectedAssets() {
    try {
        console.log('Buying selected assets evenly...');

        // Get selected assets
        const checkboxes = document.querySelectorAll('.diversify-asset:checked');
        let selectedAssets = Array.from(checkboxes).map(checkbox => checkbox.value);

        if (selectedAssets.length === 0) {
            showNotification('Please select at least one asset for diversification.', 'warning');
            return;
        }

        console.log(`Selected assets for diversification: ${selectedAssets.join(', ')}`);

        // Check if we have cash first
        if (playerState.cash <= 0) {
            showNotification('No cash to distribute.', 'warning');
            return;
        }

        // Calculate cash per asset
        const cashPerAsset = playerState.cash / selectedAssets.length;

        if (cashPerAsset <= 0) {
            showNotification('Not enough cash to distribute.', 'warning');
            return;
        }

        console.log(`Distributing $${playerState.cash.toFixed(2)} across ${selectedAssets.length} selected assets ($${cashPerAsset.toFixed(2)} per asset)`);

        // Buy each selected asset
        for (const asset of selectedAssets) {
            const price = gameState.assetPrices[asset];
            if (!price) {
                console.log(`Price not available for ${asset}, skipping.`);
                continue;
            }

            const quantity = cashPerAsset / price;

            console.log(`Buying ${asset}: Price=${price}, Quantity=${quantity.toFixed(6)}, Cost=${cashPerAsset.toFixed(2)}`);

            if (quantity > 0) {
                // Update player state
                if (!playerState.portfolio[asset]) {
                    playerState.portfolio[asset] = 0;
                }
                playerState.portfolio[asset] += quantity;

                // Add to trade history
                playerState.tradeHistory.push({
                    asset: asset,
                    action: 'buy',
                    quantity: quantity,
                    price: price,
                    cost: cashPerAsset,
                    timestamp: new Date(),
                    round: currentRound
                });
            }
        }

        // Set cash to 0
        playerState.cash = 0;

        // Update UI
        updateUI();

        // Save game state
        saveGameState();

        showNotification(`Distributed cash evenly across ${selectedAssets.length} selected assets.`, 'success');
    } catch (error) {
        console.error('Error buying selected assets:', error);
        showNotification('Error buying selected assets. Please try again.', 'danger');
    }
}

// Sell all assets
function sellAllAssets() {
    // Check if there are assets to sell
    const assetNames = Object.keys(playerState.portfolio);

    if (assetNames.length === 0) {
        showNotification('No assets in portfolio to sell.', 'warning');
        return;
    }

    // Sell assets
    for (const asset of assetNames) {
        const quantity = playerState.portfolio[asset];
        const price = gameState.assetPrices[asset];

        if (quantity <= 0 || !price || price <= 0) continue;

        // Calculate value
        const value = price * quantity;

        // Update player state
        playerState.cash += value;

        // Add to trade history
        playerState.tradeHistory.push({
            asset: asset,
            action: 'sell',
            quantity: quantity,
            price: price,
            value: value,
            timestamp: new Date(),
            round: currentRound
        });
    }

    // Clear portfolio
    playerState.portfolio = {};

    // Update UI
    updateUI();

    // Save game state
    saveGameState();

    // Show notification
    showNotification('All assets sold successfully.', 'success');
}

// Update trade summary
function updateTradeSummary() {
    const assetSelect = document.getElementById('trade-asset');
    const actionSelect = document.getElementById('trade-action');
    const quantityInput = document.getElementById('trade-quantity');
    const amountInput = document.getElementById('trade-amount');
    const summaryQuantity = document.getElementById('summary-quantity');
    const summaryCost = document.getElementById('summary-cost');
    const summaryCash = document.getElementById('summary-cash');
    const executeTradeBtn = document.getElementById('execute-trade-btn');

    if (!assetSelect || !actionSelect || !quantityInput || !amountInput ||
        !summaryQuantity || !summaryCost || !summaryCash || !executeTradeBtn) return;

    const asset = assetSelect.value;
    const action = actionSelect.value;
    const quantity = parseFloat(quantityInput.value) || 0;

    // Get current price
    const price = asset ? (gameState.assetPrices[asset] || 0) : 0;

    // Calculate total cost
    const totalCost = price * quantity;

    // Update summary
    summaryQuantity.textContent = quantity.toFixed(6);
    summaryCost.textContent = `$${totalCost.toFixed(2)}`;
    summaryCash.textContent = `$${playerState.cash.toFixed(2)}`;

    // Enable/disable execute button
    if (asset && quantity > 0) {
        if (action === 'buy' && totalCost <= playerState.cash) {
            executeTradeBtn.disabled = false;
        } else if (action === 'sell' && quantity <= (playerState.portfolio[asset] || 0)) {
            executeTradeBtn.disabled = false;
        } else {
            executeTradeBtn.disabled = true;
        }
    } else {
        executeTradeBtn.disabled = true;
    }

    // If amount input is changed, update quantity
    if (amountInput && price > 0 && amountInput === document.activeElement) {
        const amount = parseFloat(amountInput.value) || 0;
        if (action === 'buy') {
            const calculatedQuantity = amount / price;
            quantityInput.value = calculatedQuantity.toFixed(6);
        }
    }

    // If quantity input is changed, update amount
    if (quantityInput && price > 0 && quantityInput === document.activeElement) {
        const calculatedAmount = quantity * price;
        amountInput.value = calculatedAmount.toFixed(2);
    }
}

// Generate trade history rows for the trade history modal
function generateTradeHistoryRows() {
    if (!playerState.tradeHistory || playerState.tradeHistory.length === 0) {
        return '<tr><td colspan="6" class="text-center">No trades yet</td></tr>';
    }

    // Sort trade history by round (descending) and then by timestamp (descending)
    const sortedHistory = [...playerState.tradeHistory].sort((a, b) => {
        if (b.round !== a.round) {
            return b.round - a.round;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    let rows = '';
    for (const trade of sortedHistory) {
        const actionClass = trade.action === 'buy' ? 'text-success' : 'text-danger';
        const actionIcon = trade.action === 'buy' ?
            '<i class="fas fa-arrow-down text-success"></i>' :
            '<i class="fas fa-arrow-up text-danger"></i>';

        rows += `
            <tr>
                <td>${trade.round}</td>
                <td>${trade.asset}</td>
                <td class="${actionClass}">${actionIcon} ${trade.action.toUpperCase()}</td>
                <td>${trade.quantity.toFixed(6)}</td>
                <td>$${trade.price.toFixed(2)}</td>
                <td>$${(trade.action === 'buy' ? trade.cost : trade.value).toFixed(2)}</td>
            </tr>
        `;
    }

    return rows;
}

// Update asset price in trade form
function updateAssetPrice() {
    const assetSelect = document.getElementById('trade-asset');
    const currentPriceDisplay = document.getElementById('current-price-display');

    if (!assetSelect || !currentPriceDisplay) return;

    const asset = assetSelect.value;
    const price = asset ? (gameState.assetPrices[asset] || 0) : 0;

    currentPriceDisplay.textContent = price.toFixed(2);

    // Update trade summary
    updateTradeSummary();
}
