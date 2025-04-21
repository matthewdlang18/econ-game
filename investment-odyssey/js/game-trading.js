/**
 * Game Trading for Investment Odyssey
 *
 * This file contains the trading-related functions for the game.
 */

// Initialize trading form
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const tradeForm = document.getElementById('trade-form');
    const assetSelect = document.getElementById('asset-select');
    const actionSelect = document.getElementById('action-select');
    const amountInput = document.getElementById('amount-input');
    const quantityInput = document.getElementById('quantity-input');
    const assetPriceDisplay = document.getElementById('asset-price-display');
    const availableCashDisplay = document.getElementById('available-cash-display');
    const amountPercentBtns = document.querySelectorAll('.amount-percent-btn');
    const quantityPercentBtns = document.querySelectorAll('.quantity-percent-btn');
    const quantityUnit = document.getElementById('quantity-unit');

    // Initialize available cash display
    if (availableCashDisplay && playerState) {
        availableCashDisplay.textContent = playerState.cash.toFixed(2);
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

    // Update asset price when asset is changed
    if (assetSelect && assetPriceDisplay) {
        assetSelect.addEventListener('change', function() {
            updateAssetPrice();
        });
    }

    // Handle amount percent buttons
    if (amountPercentBtns) {
        amountPercentBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (!playerState || !gameState) return;

                const percent = parseFloat(btn.getAttribute('data-percent'));
                const asset = assetSelect.value;
                const price = gameState.assetPrices[asset];
                const action = actionSelect.value;

                if (action === 'buy') {
                    // Calculate amount based on percentage of cash
                    const amount = playerState.cash * (percent / 100);
                    amountInput.value = amount.toFixed(2);

                    // Update quantity
                    if (price > 0) {
                        const quantity = amount / price;
                        quantityInput.value = quantity.toFixed(4);
                    }
                } else if (action === 'sell') {
                    // Calculate amount based on percentage of holdings
                    const quantity = (playerState.portfolio[asset] || 0) * (percent / 100);
                    quantityInput.value = quantity.toFixed(4);

                    // Update amount
                    const amount = quantity * price;
                    amountInput.value = amount.toFixed(2);
                }
            });
        });
    }

    // Handle quantity percent buttons
    if (quantityPercentBtns) {
        quantityPercentBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (!playerState || !gameState) return;

                const percent = parseFloat(btn.getAttribute('data-percent'));
                const asset = assetSelect.value;
                const price = gameState.assetPrices[asset];
                const action = actionSelect.value;

                if (action === 'sell') {
                    // Calculate quantity based on percentage of holdings
                    const quantity = (playerState.portfolio[asset] || 0) * (percent / 100);
                    quantityInput.value = quantity.toFixed(4);

                    // Update amount
                    const amount = quantity * price;
                    amountInput.value = amount.toFixed(2);
                } else if (action === 'buy') {
                    // Calculate quantity based on percentage of max affordable
                    const maxQuantity = playerState.cash / price;
                    const quantity = maxQuantity * (percent / 100);
                    quantityInput.value = quantity.toFixed(4);

                    // Update amount
                    const amount = quantity * price;
                    amountInput.value = amount.toFixed(2);
                }
            });
        });
    }

    // Update amount when quantity changes
    if (quantityInput && amountInput) {
        quantityInput.addEventListener('input', function() {
            if (!gameState) return;

            const quantity = parseFloat(quantityInput.value) || 0;
            const asset = assetSelect.value;
            const price = gameState.assetPrices[asset];

            // Update amount
            const amount = quantity * price;
            amountInput.value = amount.toFixed(2);
        });
    }

    // Update quantity when amount changes
    if (amountInput && quantityInput) {
        amountInput.addEventListener('input', function() {
            if (!gameState) return;

            const amount = parseFloat(amountInput.value) || 0;
            const asset = assetSelect.value;
            const price = gameState.assetPrices[asset];

            // Update quantity
            if (price > 0) {
                const quantity = amount / price;
                quantityInput.value = quantity.toFixed(4);
            }
        });
    }

    // Handle action change
    if (actionSelect) {
        actionSelect.addEventListener('change', function() {
            // Reset inputs
            amountInput.value = '';
            quantityInput.value = '';

            // Update button labels
            const action = actionSelect.value;
            const buyBtn = document.getElementById('buy-btn');
            const sellBtn = document.getElementById('sell-btn');

            if (buyBtn && sellBtn) {
                if (action === 'buy') {
                    buyBtn.style.display = 'inline-block';
                    sellBtn.style.display = 'none';
                } else {
                    buyBtn.style.display = 'none';
                    sellBtn.style.display = 'inline-block';
                }
            }
        });
    }

    // Handle trade form submission
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const asset = assetSelect.value;
            const action = actionSelect.value;
            const amount = parseFloat(amountInput.value) || 0;
            const quantity = parseFloat(quantityInput.value) || 0;

            if (asset && action && (amount > 0 || quantity > 0)) {
                // Execute the trade
                const success = executeTrade(asset, action, amount, quantity);

                if (success) {
                    // Reset form
                    amountInput.value = '';
                    quantityInput.value = '';

                    // Show success message
                    alert(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity.toFixed(4)} ${asset} for $${amount.toFixed(2)}`);
                }
            } else {
                alert('Please enter a valid amount or quantity');
            }
        });
    }
});

// Diversify portfolio function
function diversifyPortfolio() {
    if (!playerState || !gameState) {
        console.error('Game state not initialized');
        return false;
    }

    // Check if player has cash
    if (playerState.cash <= 0) {
        alert('You need cash to diversify your portfolio');
        return false;
    }

    try {
        // Get all available assets
        const assetNames = Object.keys(gameState.assetPrices);

        // Calculate amount to allocate to each asset
        const cashToInvest = playerState.cash * 0.9; // Keep 10% as cash
        const amountPerAsset = cashToInvest / assetNames.length;

        // Update player cash
        playerState.cash -= cashToInvest;

        // Buy assets
        for (const asset of assetNames) {
            const price = gameState.assetPrices[asset];
            if (!price || price <= 0) {
                console.log(`Price not available for ${asset}, skipping.`);
                continue;
            }

            // Calculate quantity
            const quantity = amountPerAsset / price;

            console.log(`Buying ${asset}: Price=${price}, Quantity=${quantity.toFixed(4)}, Cost=${amountPerAsset.toFixed(2)}`);

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
                    timestamp: new Date()
                });
            }
        }

        // Update UI
        updateUI();

        // Save game state
        saveGameState();

        alert('Portfolio diversified successfully!');
        return true;
    } catch (error) {
        console.error('Error diversifying portfolio:', error);
        return false;
    }
}

// Sell all assets function
function sellAllAssets() {
    if (!playerState || !gameState) {
        console.error('Game state not initialized');
        return false;
    }

    try {
        // Check if there are assets to sell
        const assetNames = Object.keys(playerState.portfolio);

        if (assetNames.length === 0) {
            alert('No assets in portfolio to sell.');
            return false;
        }

        let totalValue = 0;

        // Sell assets
        for (const asset of assetNames) {
            const quantity = playerState.portfolio[asset];
            const price = gameState.assetPrices[asset];

            if (quantity <= 0 || !price || price <= 0) continue;

            // Calculate value
            const value = price * quantity;
            totalValue += value;

            // Add to trade history
            playerState.tradeHistory.push({
                asset: asset,
                action: 'sell',
                quantity: quantity,
                price: price,
                value: value,
                timestamp: new Date()
            });
        }

        // Update player cash
        playerState.cash += totalValue;

        // Clear portfolio
        playerState.portfolio = {};

        // Update UI
        updateUI();

        // Save game state
        saveGameState();

        alert(`All assets sold for $${totalValue.toFixed(2)}`);
        return true;
    } catch (error) {
        console.error('Error selling all assets:', error);
        return false;
    }
}

// Initialize quick action buttons
document.addEventListener('DOMContentLoaded', function() {
    // Diversify button
    const diversifyBtn = document.getElementById('diversify-btn');
    if (diversifyBtn) {
        diversifyBtn.addEventListener('click', function() {
            diversifyPortfolio();
        });
    }

    // Sell all button
    const sellAllBtn = document.getElementById('sell-all-btn');
    if (sellAllBtn) {
        sellAllBtn.addEventListener('click', function() {
            sellAllAssets();
        });
    }

    // Radio buttons for buy/sell
    const actionBuy = document.getElementById('action-buy');
    const actionSell = document.getElementById('action-sell');
    if (actionBuy && actionSell) {
        actionBuy.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('action-select').value = 'buy';
                document.getElementById('buy-btn').style.display = 'inline-block';
                document.getElementById('sell-btn').style.display = 'none';
            }
        });

        actionSell.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('action-select').value = 'sell';
                document.getElementById('buy-btn').style.display = 'none';
                document.getElementById('sell-btn').style.display = 'inline-block';
            }
        });
    }
});

// Make functions available globally
window.updateTradeForm = function() {
    // Get form elements
    const actionSelect = document.getElementById('action-select');
    const amountInput = document.getElementById('amount-input');
    const quantityInput = document.getElementById('quantity-input');

    // Reset inputs
    if (amountInput) amountInput.value = '';
    if (quantityInput) quantityInput.value = '';

    // Update asset price
    updateAssetPrice();

    // Update button labels
    const action = actionSelect ? actionSelect.value : 'buy';
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');

    if (buyBtn && sellBtn) {
        if (action === 'buy') {
            buyBtn.style.display = 'inline-block';
            sellBtn.style.display = 'none';

            // Update radio buttons
            const actionBuy = document.getElementById('action-buy');
            if (actionBuy) actionBuy.checked = true;
        } else {
            buyBtn.style.display = 'none';
            sellBtn.style.display = 'inline-block';

            // Update radio buttons
            const actionSell = document.getElementById('action-sell');
            if (actionSell) actionSell.checked = true;
        }
    }
};

// Make diversify and sell all functions available globally
window.diversifyPortfolio = diversifyPortfolio;
window.sellAllAssets = sellAllAssets;
