# Investment Odyssey

A financial market simulation game designed to help users understand investment strategies, risk management, and portfolio diversification through hands-on experience.

## Overview

Investment Odyssey simulates real market behavior using correlation-based asset price generation and includes special mechanics like Bitcoin's 4-year cycle to provide an educational yet engaging experience.

## Features

- **Realistic Market Simulation**: Uses correlation-based price generation to create realistic market behavior
- **Multiple Asset Classes**: Invest in S&P 500, Bonds, Real Estate, Gold, Commodities, and Bitcoin
- **Bitcoin Special Mechanics**: Experience Bitcoin's 4-year market cycle and price-dependent behavior
- **Portfolio Management**: Build and manage your investment portfolio
- **Data Visualization**: Track your performance with interactive charts
- **Game Modes**: Play in single-player mode or join a class game
- **Leaderboard**: Compare your performance with other players

## How to Play

1. **Start a Game**: Choose between Single Player or Class Mode.
2. **Initial Capital**: You start with $10,000 in cash.
3. **Buy Assets**: Use the trading interface to purchase assets.
4. **Advance Rounds**: Each round represents a time period where asset prices change.
5. **Monitor Performance**: Track your portfolio value and asset allocation.
6. **Diversify**: Spread your investments across different asset classes to manage risk.
7. **Adapt to Market Changes**: Adjust your strategy as market conditions evolve.
8. **Complete the Game**: After all rounds, see your final performance and compare with others.

## Asset Classes

| Asset Class | Average Return | Standard Deviation | Min Return | Max Return |
|------------|----------------|-------------------|------------|------------|
| S&P 500 | 11.51% | 19.49% | -43% | 50% |
| Bonds | 3.34% | 3.01% | 0.03% | 14% |
| Real Estate | 4.39% | 6.20% | -12% | 24% |
| Gold | 6.48% | 20.76% | -32% | 125% |
| Commodities | 8.15% | 15.22% | -25% | 200% |
| Bitcoin | 50.0% | 100.0% | -73% | 250% |

## Technical Details

- **Frontend**: HTML, CSS, JavaScript
- **Visualizations**: Chart.js
- **Backend**: Supabase for authentication, database, and real-time capabilities
- **Database**: PostgreSQL (via Supabase)

## Installation

1. Clone the repository
2. Ensure Supabase connection is configured in `supabase.js`
3. Run the SQL scripts in `db-setup.sql` to create the necessary tables
4. Open `index.html` in your browser

## License

This project is part of the Macroeconomics Game Portal developed for ECON courses.

## Credits

Developed based on the Investment Odyssey Product Requirements Document and Action-Based Implementation Plan.
