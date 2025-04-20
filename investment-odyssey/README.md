# Investment Odyssey

Investment Odyssey is an interactive financial market simulation game designed to help users understand investment strategies, risk management, and portfolio diversification. Players navigate through market cycles, make investment decisions across various asset classes, and learn how different investments perform over time.

## Features

- **Single Player Mode**: Start with $10,000 virtual cash and navigate through 20 market cycles
- **Class Game Mode**: TAs can create and manage game sessions for their sections
- **Multiple Asset Classes**: Invest in S&P 500, Bonds, Real Estate, Gold, Commodities, and Bitcoin
- **Realistic Market Simulation**: Experience correlated asset returns and market cycles
- **Portfolio Management**: Track your portfolio value, asset allocation, and performance
- **Leaderboard System**: Compare your performance with other players

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account for database functionality

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/investment-odyssey.git
   ```

2. Set up Supabase:
   - Create a new project at [Supabase](https://supabase.com)
   - Run the SQL migration in `migrations/001_investment_odyssey_schema.sql`
   - Update the Supabase URL and anon key in `supabase.js`

3. Open `index.html` in your browser or deploy to a web server.

## Usage

### Student/Guest

1. Log in with your credentials or play as a guest
2. Choose between Single Player or Class Game mode
3. In Single Player mode:
   - Start with $10,000 virtual cash
   - Buy and sell assets to build your portfolio
   - Advance through 20 rounds of market cycles
   - Your final portfolio value will be recorded on the leaderboard

4. In Class Game mode:
   - Join your TA's active game session
   - Trade assets as the TA advances the rounds
   - See real-time rankings within your section

### Teaching Assistant (TA)

1. Log in with your TA credentials
2. View your assigned sections
3. Create a new game for a section
4. Manage the game:
   - Advance rounds at your own pace
   - Monitor student participation and performance
   - End the game when complete
5. View game history and results

## Asset Classes

The game includes six distinct asset classes with unique risk-return characteristics:

- **S&P 500**: Moderate growth potential with moderate volatility (11.5% avg. return, 19.5% std. dev.)
- **Bonds**: Lower risk with lower returns (3.3% avg. return, 3.0% std. dev.)
- **Real Estate**: Moderate growth with some volatility (4.4% avg. return, 6.2% std. dev.)
- **Gold**: Store of value during economic uncertainty (6.5% avg. return, 20.8% std. dev.)
- **Commodities**: Highly cyclical with high volatility (8.2% avg. return, 15.2% std. dev.)
- **Bitcoin**: Extremely high volatility with potential for significant returns (50% avg. return, 100% std. dev.)

## Technologies Used

- HTML5, CSS3, JavaScript
- Bootstrap 5 for responsive design
- Chart.js for data visualization
- Supabase for database and authentication

## Database Structure

The game uses the following Supabase tables:

- `profiles`: User information and authentication
- `sections`: Class sections with TA assignments
- `games`: Game sessions and their status
- `game_rounds`: Asset prices and market data for each round
- `player_states`: Player portfolio and trading history
- `leaderboard`: Final game results and rankings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Developed for economics and finance education
- Inspired by real-world market dynamics and investment strategies
