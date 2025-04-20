# Investment Odyssey - Implementation Task List

## Project Setup

1. **Create Project Structure**
   - [ ] Create the main project folder: `investment-odyssey`
   - [ ] Set up file structure:
     ```
     investment-odyssey/
     ├── index.html
     ├── about.html
     ├── leaderboard.html
     ├── class-game.html
     ├── ta-controls.html
     ├── css/
     │   ├── styles.css
     │   ├── header-styles.css
     │   └── responsive.css
     ├── js/
     │   ├── game-core.js
     │   ├── game-ui.js
     │   ├── game-trading.js
     │   ├── class-game.js
     │   ├── leaderboard.js
     │   └── ta-controls.js
     └── images/
     ```

2. **Set Up Basic HTML Structure**
   - [ ] Create HTML boilerplate in each HTML file
   - [ ] Add meta tags for responsiveness
   - [ ] Link CSS and JavaScript files
   - [ ] Add external libraries:
     - [ ] Bootstrap CSS and JS
     - [ ] Chart.js for visualization
     - [ ] Font Awesome for icons
     - [ ] Supabase JavaScript client

3. **Design Header and Navigation**
   - [ ] Create a consistent header for all pages
   - [ ] Design responsive navigation menu
   - [ ] Implement game title and description
   - [ ] Add user authentication status display

## Game Core Logic

4. **Define Game State Structure**
   - [ ] Create gameState object with:
     - [ ] roundNumber
     - [ ] assetPrices
     - [ ] priceHistory
     - [ ] maxRounds (default: 20)
     - [ ] CPI (inflation tracker)
   - [ ] Create playerState object with:
     - [ ] cash (start with $10,000)
     - [ ] portfolio (holdings of each asset)
     - [ ] tradeHistory
     - [ ] portfolioValueHistory

5. **Implement Asset Price Generation**
   - [ ] Define assetReturns with parameters for each asset class
   - [ ] Create correlationMatrix for realistic asset correlations
   - [ ] Implement generateNewPrices() function using correlation data
   - [ ] Add special logic for Bitcoin cycles (including potential crashes)
   - [ ] Implement updateCPI() function for inflation simulation

6. **Create Game Flow Functions**
   - [ ] Implement initializeGame() to reset game state
   - [ ] Create startGame() function to begin a new game
   - [ ] Develop nextRound() function to advance the game
   - [ ] Implement endGame() function to calculate final results
   - [ ] Add generateCashInjection() for periodic income simulation

7. **Setup Local Storage**
   - [ ] Create saveGameState() function
   - [ ] Implement loadGameState() function
   - [ ] Add functions to save scores to leaderboard

## Trading Interface

8. **Build Asset Selection UI**
   - [ ] Create dropdown for asset selection
   - [ ] Add real-time price display
   - [ ] Implement action select (buy/sell)
   - [ ] Design portfolio holdings display

9. **Implement Trading Controls**
   - [ ] Create amount input with validation
   - [ ] Add quantity input with real-time conversion
   - [ ] Implement percentage sliders for easier input
   - [ ] Create execute trade button
   - [ ] Add quick-action buttons for common operations

10. **Develop Trading Logic**
    - [ ] Implement executeTrade() function
    - [ ] Create buyAllAssets() for portfolio diversification
    - [ ] Implement sellAllAssets() function
    - [ ] Add input validation and error handling
    - [ ] Create trade history log

## Data Visualization

11. **Implement Portfolio Chart**
    - [ ] Set up Chart.js configuration
    - [ ] Create updatePortfolioChart() function
    - [ ] Add zoom and pan functionality
    - [ ] Implement responsive sizing

12. **Create Asset Allocation Chart**
    - [ ] Design pie chart for portfolio allocation
    - [ ] Add color coding for different assets
    - [ ] Implement updatePortfolioAllocationChart() function
    - [ ] Add hover tooltips with percentages

13. **Build Asset Price Charts**
    - [ ] Create line charts for historical asset prices
    - [ ] Implement updateAssetPriceCharts() function
    - [ ] Add CPI tracking chart
    - [ ] Create comparative returns chart

14. **Implement Market Data Display**
    - [ ] Design asset prices table with change indicators
    - [ ] Create price ticker for visual appeal
    - [ ] Add color coding for price changes
    - [ ] Implement animations for price updates

## User Interface

15. **Design Game Controls**
    - [ ] Create start game button
    - [ ] Add next round button
    - [ ] Implement restart game button with confirmation
    - [ ] Design round progress indicator

16. **Build Portfolio Management UI**
    - [ ] Create portfolio table with asset details
    - [ ] Add value and percentage displays
    - [ ] Implement quick portfolio actions
    - [ ] Design cash display with animations

17. **Implement Responsive Design**
    - [ ] Create responsive layouts for all screen sizes
    - [ ] Optimize tables for mobile view
    - [ ] Adapt charts for different screen widths
    - [ ] Test on multiple devices

18. **Add Visual Feedback**
    - [ ] Implement notifications for trades
    - [ ] Add animations for price changes
    - [ ] Create loading indicators
    - [ ] Design confirmation dialogs

## Database Structure & Supabase Integration

19. **Configure Supabase Database Tables**
    - [ ] Set up `profiles` table:
       - id (uuid)
       - custom_id (uuid)
       - name (text)
       - role (text)
       - passcode (text)
       - section_id (uuid)
       - created_at (timestamp)
       - last_login (timestamp)
    - [ ] Create `sections` table:
       - id (uuid)
       - day (text)
       - time (text)
       - location (text)
       - ta_id (uuid)
       - created_at (timestamp)
    - [ ] Set up `games` table:
       - id (uuid)
       - type (text)
       - section_id (uuid)
       - creator_id (uuid)
       - status (text)
       - current_round (int4)
       - max_rounds (int4)
       - created_at (timestamp)
    - [ ] Create `game_rounds` table:
       - id (uuid)
       - game_id (uuid)
       - round_number (int4)
       - asset_prices (jsonb)
       - price_history (jsonb)
       - cpi (numeric)
       - cpi_history (jsonb)
       - created_at (timestamp)
    - [ ] Set up `player_states` table:
       - id (uuid)
       - game_id (uuid)
       - user_id (uuid)
       - round_number (int4)
       - cash (numeric)
       - portfolio (jsonb)
       - portfolio_value (numeric)
       - portfolio_history (jsonb)
       - trade_history (jsonb)
       - created_at (timestamp)
    - [ ] Create `leaderboard` table:
       - id (uuid)
       - user_id (text)
       - user_name (text)
       - game_id (text)
       - game_type (text)
       - game_mode (text)
       - final_portfolio (numeric)
       - ta_name (text)
       - section_id (text)
       - created_at (timestamp)

## User Authentication & Access Control

20. **Implement Supabase Authentication**
    - [ ] Set up authentication providers (email, magic link, or social login)
    - [ ] Create authentication UI components:
       - Sign-in form
       - Sign-up form
       - Password reset
       - Profile management
    - [ ] Implement user roles based on `profiles.role`:
       - Student
       - TA
       - Guest
    - [ ] Add section selection for students that updates `profiles.section_id`
    - [ ] Create auth state listeners and protected routes
    - [ ] Add authentication context provider
    - [ ] Implement guest mode that creates temporary profiles

## Game Session Management

21. **Develop Class Game Functionality**
    - [ ] Implement game session creation through `games` table:
       - Set type, section_id, creator_id, status
       - Initialize with current_round = 0 and max_rounds = 20
    - [ ] Create functions to update game status:
       - In Progress
       - Completed
       - Cancelled
    - [ ] Add round advancement that updates `current_round`
    - [ ] Implement participant tracking using `player_states` table
    - [ ] Add real-time updates using Supabase Realtime subscriptions:
       - Subscribe to game status changes
       - Subscribe to round updates
       - Subscribe to player state changes
    - [ ] Create class-specific leaderboard queries:
       - Filter by game_id
       - Sort by portfolio_value
       - Update in real-time

22. **Implement Single Player Game Mode**
    - [ ] Create game session for individual players
    - [ ] Store game states in local storage during play
    - [ ] Save final results to `leaderboard` table
    - [ ] Add game statistics and history tracking
    - [ ] Implement resume game functionality

## Leaderboard & Statistics

23. **Build Leaderboard System**
    - [ ] Create leaderboard UI with the following features:
       - Tabs for Single Player, Class Games, and Overall rankings
       - Filters for time period, section, and player
       - Pagination for large result sets
    - [ ] Implement leaderboard queries using the `leaderboard` table:
       - Get top performers
       - Filter by game_type
       - Filter by section_id
       - Filter by date range
    - [ ] Add player statistics summary:
       - Best score
       - Average score
       - Games played
       - Best rank
    - [ ] Implement global statistics display:
       - Average portfolio value
       - Top score
       - Total players
       - Total games

24. **Create Player Statistics Page**
    - [ ] Design personal statistics dashboard
    - [ ] Implement performance metrics queries from `player_states` and `leaderboard`
    - [ ] Create visualization of historical performance
    - [ ] Add achievement system based on game performance:
       - First Game
       - Portfolio Milestones
       - Diversification Achievements
       - Return Percentage Achievements

## TA Controls & Game Administration

25. **Build TA Dashboard**
    - [ ] Create section management UI that displays data from `sections` table
    - [ ] Implement game creation functionality:
       - Insert new record into `games` table
       - Initialize first round in `game_rounds` table
       - Set initial asset prices
    - [ ] Add round advancement controls:
       - Update `games.current_round`
       - Create new round in `game_rounds` table
       - Generate new asset prices
    - [ ] Design participant monitoring view:
       - Display participants from `player_states`
       - Show real-time portfolio values
       - Sort by performance
       - Track participation

26. **Implement Game Management Functions**
    - [ ] Create database functions for game administration:
       - Create game
       - Update game status
       - Advance round
       - End game
    - [ ] Implement round synchronization logic:
       - Generate consistent asset prices for all participants
       - Distribute updates via Supabase Realtime
    - [ ] Add end game functionality:
       - Update game status to "Completed"
       - Calculate final portfolio values
       - Save to leaderboard table
    - [ ] Create data export for instructors:
       - Game results summary
       - Participant performance
       - Asset performance statistics

## Testing, Optimization & Deployment

27. **Perform Testing**
    - [ ] Test game mechanics for accuracy:
       - Asset price generation
       - Portfolio calculations
       - Trading functionality
       - Round advancement logic
    - [ ] Verify database operations:
       - Single player game flow
       - Class game synchronization
       - Leaderboard updates
       - Player statistics
    - [ ] Test authentication and permissions:
       - Student role restrictions
       - TA role capabilities
       - Guest mode limitations
    - [ ] Verify real-time updates:
       - Supabase Realtime subscription behavior
       - UI updates with state changes
       - Class game synchronization

28. **Optimize Performance**
    - [ ] Minimize database reads/writes to Supabase:
       - Batch updates when possible
       - Use efficient query patterns
       - Implement pagination for large datasets
    - [ ] Optimize JavaScript code:
       - Implement memo and useMemo for expensive calculations
       - Lazy load components when appropriate
       - Use efficient state management
    - [ ] Implement caching strategies:
       - Cache static assets
       - Store game state locally during gameplay
       - Use service workers for offline capabilities
    - [ ] Apply performance best practices:
       - Code splitting
       - Tree shaking
       - Bundle optimization

29. **Configure Security & Access Control**
    - [ ] Set up Row Level Security (RLS) policies for each table:
       - `profiles`: Users can read all, update only their own
       - `sections`: TAs can create/update, all can read
       - `games`: TAs can create/update, participants can read
       - `game_rounds`: TAs can create/update, participants can read
       - `player_states`: Users can create/update their own, read all in their game
       - `leaderboard`: Users can create their own, read all
    - [ ] Implement database triggers for data integrity
    - [ ] Create stored procedures for complex operations
    - [ ] Set up audit logging for sensitive operations

30. **Finalize Deployment**
    - [ ] Deploy to web hosting platform:
       - Configure build pipeline
       - Set up environment variables
       - Implement CI/CD workflow
    - [ ] Configure Supabase production settings:
       - Database connection pool
       - Rate limiting
       - Backup schedule
       - Monitoring and alerts
    - [ ] Set up custom domain and SSL (if applicable)
    - [ ] Implement analytics and error tracking

## Additional Features

29. **Add Statistics Page**
    - [ ] Design personal statistics dashboard
    - [ ] Implement performance metrics
    - [ ] Add achievement system
    - [ ] Create investment insights

30. **Create Documentation**
    - [ ] Write user guide for students
    - [ ] Create instructor documentation
    - [ ] Add in-game help tooltips
    - [ ] Develop FAQ section

31. **Implement Accessibility Features**
    - [ ] Add keyboard navigation
    - [ ] Implement screen reader compatibility
    - [ ] Design high-contrast mode
    - [ ] Test with accessibility tools

## Launch and Monitor

32. **Prepare for Launch**
    - [ ] Conduct final testing
    - [ ] Create promotional materials
    - [ ] Set up feedback channels
    - [ ] Schedule training for instructors

33. **Launch and Monitor**
    - [ ] Release to initial user group
    - [ ] Monitor performance and errors
    - [ ] Collect user feedback
    - [ ] Plan for updates and improvements
