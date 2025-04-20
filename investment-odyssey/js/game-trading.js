// Trading Functions for Investment Odyssey

// Update total cost
function updateTotalCost() {
    const assetSelect = document.getElementById('asset-select');
    const actionSelect = document.getElementById('action-select');
    const quantityInput = document.getElementById('quantity-input');
    const amountInput = document.getElementById('amount-input');
    const totalCostDisplay = document.getElementById('total-cost-display');
    const maxQuantityDisplay = document.getElementById('max-quantity-display');
    const quantitySlider = document.getElementById('quantity-slider');
    const quantityPercentage = document.getElementById('quantity-percentage');
    const quantityControls = document.getElementById('quantity-controls');
    const amountControls = document.getElementById('amount-controls');

    if (assetSelect && actionSelect && quantityInput && totalCostDisplay) {
        const asset = assetSelect.value;
        const action = actionSelect.value;
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = gameState.assetPrices[asset] || 0;
        const totalCost = quantity * price;

        // Update total cost display
        if (action === 'buy') {
            totalCostDisplay.textContent = `-$${formatCurrency(totalCost)}`;
            totalCostDisplay.className = 'text-danger';
        } else {
            totalCostDisplay.textContent = `+$${formatCurrency(totalCost)}`;
            totalCostDisplay.className = 'text-success';
        }

        // Update amount input
        if (amountInput) {
            amountInput.value = totalCost.toFixed(2);
        }

        // Update max quantity display for sell action
        if (maxQuantityDisplay && action === 'sell') {
            const maxQuantity = playerState.portfolio[asset] || 0;
            maxQuantityDisplay.textContent = maxQuantity.toFixed(4);

            // Update quantity slider max value
            if (quantitySlider && quantityPercentage) {
                if (maxQuantity > 0) {
                    const percentage = Math.min(100, (quantity / maxQuantity) * 100);
                    quantitySlider.value = percentage;
                    quantityPercentage.value = percentage.toFixed(0);
                } else {
                    quantitySlider.value = 0;
                    quantityPercentage.value = '0';
                }
            }
        }

        // Show/hide appropriate controls based on action
        if (quantityControls && amountControls) {
            if (action === 'buy') {
                quantityControls.style.display = 'none';
                amountControls.style.display = 'block';
            } else {
                quantityControls.style.display = 'block';
                amountControls.style.display = 'none';
            }
        }
    }
}

// Execute trade
function executeTrade() {
    const assetSelect = document.getElementById('asset-select');
    const actionSelect = document.getElementById('action-select');
    const quantityInput = document.getElementById('quantity-input');

    if (assetSelect && actionSelect && quantityInput) {
        const asset = assetSelect.value;
        const action = actionSelect.value;
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = gameState.assetPrices[asset] || 0;
        const totalCost = quantity * price;

        // Validate trade
        if (quantity <= 0) {
            showNotification('Please enter a valid quantity.', 'warning');
            return false;
        }

        if (action === 'buy') {
            // Check if player has enough cash
            if (totalCost > playerState.cash) {
                showNotification('Not enough cash to complete this purchase.', 'danger');
                return false;
            }

            // Execute buy
            playerState.cash -= totalCost;

            // Add to portfolio
            if (playerState.portfolio[asset]) {
                playerState.portfolio[asset] += quantity;
            } else {
                playerState.portfolio[asset] = quantity;
            }

            // Add to trade history
            playerState.tradeHistory.push({
                timestamp: new Date().toISOString(),
                asset: asset,
                action: 'buy',
                quantity: quantity,
                price: price,
                totalCost: totalCost
            });

            // Show notification
            showNotification(`Successfully purchased ${quantity.toFixed(4)} ${asset} for $${formatCurrency(totalCost)}.`, 'success');
        } else {
            // Check if player has enough of the asset
            if (!playerState.portfolio[asset] || playerState.portfolio[asset] < quantity) {
                showNotification(`Not enough ${asset} in your portfolio.`, 'danger');
                return false;
            }

            // Execute sell
            playerState.cash += totalCost;
            playerState.portfolio[asset] -= quantity;

            // Remove asset from portfolio if quantity is 0
            if (playerState.portfolio[asset] <= 0) {
                delete playerState.portfolio[asset];
            }

            // Add to trade history
            playerState.tradeHistory.push({
                timestamp: new Date().toISOString(),
                asset: asset,
                action: 'sell',
                quantity: quantity,
                price: price,
                totalCost: totalCost
            });

            // Show notification
            showNotification(`Successfully sold ${quantity.toFixed(4)} ${asset} for $${formatCurrency(totalCost)}.`, 'success');
        }

        // Update UI
        updateUI();

        // Reset form
        quantityInput.value = '';

        // Save game state
        saveGameState();

        return true;
    }

    return false;
}

// Buy selected assets (for diversification)
function buySelectedAssets() {
    const checkboxes = document.querySelectorAll('.diversify-asset:checked');
    const diversifyAmountInput = document.getElementById('diversify-amount');

    if (checkboxes.length === 0) {
        showNotification('Please select at least one asset.', 'warning');
        return;
    }

    if (!diversifyAmountInput) {
        showNotification('Amount input not found.', 'danger');
        return;
    }

    const totalAmount = parseFloat(diversifyAmountInput.value) || 0;

    if (totalAmount <= 0) {
        showNotification('Please enter a valid amount.', 'warning');
        return;
    }

    if (totalAmount > playerState.cash) {
        showNotification('Not enough cash to complete this purchase.', 'danger');
        return;
    }

    // Calculate amount per asset
    const amountPerAsset = totalAmount / checkboxes.length;

    // Execute trades
    let successCount = 0;

    checkboxes.forEach(checkbox => {
        const asset = checkbox.value;
        const price = gameState.assetPrices[asset] || 0;

        if (price > 0) {
            const quantity = amountPerAsset / price;

            // Execute buy
            playerState.cash -= amountPerAsset;

            // Add to portfolio
            if (playerState.portfolio[asset]) {
                playerState.portfolio[asset] += quantity;
            } else {
                playerState.portfolio[asset] = quantity;
            }

            // Add to trade history
            playerState.tradeHistory.push({
                timestamp: new Date().toISOString(),
                asset: asset,
                action: 'buy',
                quantity: quantity,
                price: price,
                totalCost: amountPerAsset
            });

            successCount++;
        }
    });

    // Update UI
    updateUI();

    // Reset form
    diversifyAmountInput.value = '';

    // Save game state
    saveGameState();

    // Show notification
    showNotification(`Successfully purchased ${successCount} assets for $${formatCurrency(totalAmount)}.`, 'success');
}

// Buy all assets equally
function buyAllAssets() {
    const diversifyAmountInput = document.getElementById('diversify-amount');

    if (!diversifyAmountInput) {
        showNotification('Amount input not found.', 'danger');
        return;
    }

    const totalAmount = parseFloat(diversifyAmountInput.value) || 0;

    if (totalAmount <= 0) {
        showNotification('Please enter a valid amount.', 'warning');
        return;
    }

    if (totalAmount > playerState.cash) {
        showNotification('Not enough cash to complete this purchase.', 'danger');
        return;
    }

    // Get all assets
    const assets = Object.keys(gameState.assetPrices);

    // Calculate amount per asset
    const amountPerAsset = totalAmount / assets.length;

    // Execute trades
    let successCount = 0;

    assets.forEach(asset => {
        const price = gameState.assetPrices[asset] || 0;

        if (price > 0) {
            const quantity = amountPerAsset / price;

            // Execute buy
            playerState.cash -= amountPerAsset;

            // Add to portfolio
            if (playerState.portfolio[asset]) {
                playerState.portfolio[asset] += quantity;
            } else {
                playerState.portfolio[asset] = quantity;
            }

            // Add to trade history
            playerState.tradeHistory.push({
                timestamp: new Date().toISOString(),
                asset: asset,
                action: 'buy',
                quantity: quantity,
                price: price,
                totalCost: amountPerAsset
            });

            successCount++;
        }
    });

    // Update UI
    updateUI();

    // Reset form
    diversifyAmountInput.value = '';

    // Save game state
    saveGameState();

    // Show notification
    showNotification(`Successfully purchased all assets for $${formatCurrency(totalAmount)}.`, 'success');
}

// Sell all assets
function sellAllAssets() {
    // Check if portfolio is empty
    if (Object.keys(playerState.portfolio).length === 0) {
        showNotification('Your portfolio is empty.', 'warning');
        return;
    }

    // Execute trades
    let totalSaleAmount = 0;

    for (const [asset, quantity] of Object.entries(playerState.portfolio)) {
        const price = gameState.assetPrices[asset] || 0;
        const saleAmount = price * quantity;

        // Execute sell
        playerState.cash += saleAmount;

        // Add to trade history
        playerState.tradeHistory.push({
            timestamp: new Date().toISOString(),
            asset: asset,
            action: 'sell',
            quantity: quantity,
            price: price,
            totalCost: saleAmount
        });

        totalSaleAmount += saleAmount;
    }

    // Clear portfolio
    playerState.portfolio = {};

    // Update UI
    updateUI();

    // Save game state
    saveGameState();

    // Show notification
    showNotification(`Successfully sold all assets for $${formatCurrency(totalSaleAmount)}.`, 'success');
}

// Initialize trade form
document.addEventListener('DOMContentLoaded', function() {
    // Trade form
    const tradeForm = document.getElementById('trade-form');
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            executeTrade();
        });
    }

    // Asset select change
    const assetSelect = document.getElementById('asset-select');
    if (assetSelect) {
        assetSelect.addEventListener('change', function() {
            updateAssetPrice();
            updateTotalCost();
        });
    }

    // Action select change
    const actionSelect = document.getElementById('action-select');
    if (actionSelect) {
        actionSelect.addEventListener('change', function() {
            updateTotalCost();
        });
    }

    // Quantity input change
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            updateTotalCost();
        });
    }

    // Diversification percentage buttons
    const diversifyPercentBtns = document.querySelectorAll('.diversify-amount-container .amount-percent-btn');
    const diversifyAmountInput = document.getElementById('diversify-amount');

    if (diversifyPercentBtns.length > 0 && diversifyAmountInput) {
        diversifyPercentBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const percentage = parseInt(this.getAttribute('data-percent'));
                const maxAmount = playerState.cash;
                const amount = (percentage / 100) * maxAmount;
                diversifyAmountInput.value = amount.toFixed(2);
            });
        });
    }

    // Connect all percentage buttons to their respective inputs
    document.querySelectorAll('.amount-percent-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const percentage = parseInt(this.getAttribute('data-percent'));
            const maxAmount = playerState.cash;
            const amount = (percentage / 100) * maxAmount;

            // Find the closest input field
            const container = this.closest('.form-group');
            if (container) {
                const amountInput = container.querySelector('input[type="number"]');
                if (amountInput) {
                    amountInput.value = amount.toFixed(2);
                }
            }
        });
    });
});
