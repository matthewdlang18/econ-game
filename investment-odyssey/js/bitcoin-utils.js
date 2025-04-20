// Bitcoin Utilities for Investment Odyssey

// Bitcoin price analysis functions
window.BitcoinUtils = {
    // Calculate Bitcoin's halving cycle position (0-1 where 1 is a halving event)
    calculateHalvingCyclePosition: function(roundNumber) {
        // In our simplified model, a halving occurs every 4 rounds
        return (roundNumber % 4) / 4;
    },
    
    // Get Bitcoin's current market phase based on halving cycle
    getBitcoinMarketPhase: function(roundNumber) {
        const cyclePosition = this.calculateHalvingCyclePosition(roundNumber);
        
        if (cyclePosition < 0.25) {
            return 'accumulation'; // Post-halving accumulation phase
        } else if (cyclePosition < 0.5) {
            return 'bull'; // Bull market phase
        } else if (cyclePosition < 0.75) {
            return 'distribution'; // Distribution/top phase
        } else {
            return 'bear'; // Bear market phase
        }
    },
    
    // Get Bitcoin's volatility multiplier based on market phase
    getVolatilityMultiplier: function(roundNumber) {
        const phase = this.getBitcoinMarketPhase(roundNumber);
        
        switch (phase) {
            case 'accumulation':
                return 0.8; // Lower volatility during accumulation
            case 'bull':
                return 1.5; // Higher volatility during bull market
            case 'distribution':
                return 2.0; // Highest volatility during distribution/top
            case 'bear':
                return 1.2; // Moderate volatility during bear market
            default:
                return 1.0;
        }
    },
    
    // Get Bitcoin's return bias based on market phase
    getReturnBias: function(roundNumber) {
        const phase = this.getBitcoinMarketPhase(roundNumber);
        
        switch (phase) {
            case 'accumulation':
                return 0.2; // Slightly positive bias
            case 'bull':
                return 0.5; // Strong positive bias
            case 'distribution':
                return 0.0; // Neutral bias
            case 'bear':
                return -0.3; // Negative bias
            default:
                return 0.0;
        }
    },
    
    // Calculate crash probability based on market phase and rounds since last crash
    getCrashProbability: function(roundNumber, lastCrashRound) {
        const phase = this.getBitcoinMarketPhase(roundNumber);
        const roundsSinceLastCrash = roundNumber - lastCrashRound;
        
        // Base probability depends on market phase
        let baseProbability;
        switch (phase) {
            case 'accumulation':
                baseProbability = 0.05; // Low crash probability
                break;
            case 'bull':
                baseProbability = 0.1; // Moderate crash probability
                break;
            case 'distribution':
                baseProbability = 0.3; // High crash probability
                break;
            case 'bear':
                baseProbability = 0.2; // Moderate-high crash probability
                break;
            default:
                baseProbability = 0.1;
        }
        
        // Increase probability based on rounds since last crash
        const additionalProbability = Math.min(0.4, roundsSinceLastCrash * 0.05);
        
        return Math.min(0.7, baseProbability + additionalProbability);
    },
    
    // Generate a crash severity based on market phase
    getCrashSeverity: function(roundNumber, shockRange) {
        const phase = this.getBitcoinMarketPhase(roundNumber);
        
        // Base severity from shock range
        const baseSeverity = shockRange[0] + Math.random() * (shockRange[1] - shockRange[0]);
        
        // Adjust severity based on market phase
        let multiplier;
        switch (phase) {
            case 'accumulation':
                multiplier = 0.7; // Less severe crashes
                break;
            case 'bull':
                multiplier = 0.8; // Moderate crashes
                break;
            case 'distribution':
                multiplier = 1.2; // More severe crashes
                break;
            case 'bear':
                multiplier = 1.0; // Standard crashes
                break;
            default:
                multiplier = 1.0;
        }
        
        return baseSeverity * multiplier;
    }
};
