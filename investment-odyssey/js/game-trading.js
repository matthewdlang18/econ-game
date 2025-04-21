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

// Make functions available globally
window.updateTradeForm = function() {
    const assetSelect = document.getElementById('asset-select');
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
        } else {
            buyBtn.style.display = 'none';
            sellBtn.style.display = 'inline-block';
        }
    }
};
