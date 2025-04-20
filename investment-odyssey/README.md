# Investment Odyssey

A financial market simulation game to help you understand investment strategies, risk management, and portfolio diversification.

## Features

- Simulates various financial assets (S&P 500, Bonds, Real Estate, Gold, Commodities, Bitcoin)
- Realistic market volatility and price movements
- Portfolio management and tracking
- Performance comparison between different assets
- Leaderboard to compare your results with others

## Supabase Setup

This game uses Supabase for authentication, storing game states, and leaderboard functionality. To set up the required database tables:

1. Create a Supabase project if you haven't already
2. Run the SQL migrations in the `migrations` folder:
   - `game_states_table.sql` - Creates the table for storing game progress across devices

### Database Schema

The game uses the following tables:

1. **leaderboard** - Stores game scores
   - `id` - UUID primary key
   - `user_id` - User ID
   - `user_name` - User name
   - `game_id` - Game ID
   - `game_type` - Game type (e.g., "investment-odyssey")
   - `game_mode` - Game mode (e.g., "single", "class")
   - `final_portfolio` - Final portfolio value
   - `ta_name` - TA name (for class games)
   - `section_id` - Section ID (for class games)
   - `created_at` - Timestamp

2. **game_states** - Stores game progress
   - `id` - UUID primary key
   - `user_id` - User ID
   - `game_type` - Game type (e.g., "investment-odyssey")
   - `game_data` - Game data in JSON format
   - `created_at` - Timestamp
   - `updated_at` - Timestamp

## How to Play

1. Start a new game
2. Each round, you'll receive cash injections to invest
3. Diversify your portfolio by buying different assets
4. Monitor asset performance and adjust your strategy
5. Try to maximize your portfolio value by the end of the game

## Game Mechanics

- The game runs for 20 rounds
- Each asset has different volatility and risk profiles
- Bitcoin has occasional crashes to simulate real-world volatility
- CPI (inflation) affects the real value of your investments
- Cash injections simulate regular income

## Tips for Success

- Diversify your portfolio to manage risk
- Monitor market trends and adjust your strategy
- Consider the impact of inflation on your investments
- Be cautious with highly volatile assets like Bitcoin
