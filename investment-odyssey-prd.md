# Investment Odyssey - Product Requirements Document

## Executive Summary
Investment Odyssey is an interactive financial market simulation game designed to help users understand investment strategies, risk management, and portfolio diversification. Players navigate through market cycles, make investment decisions across various asset classes, and learn how different investments perform over time.

## Product Overview

### Product Vision
Create an engaging, educational game that teaches fundamental concepts of investing through simulated market experiences, allowing players to develop practical investment skills without risking real money.

### Target Audience
- College students (primarily economics and finance students)
- Individuals interested in learning about investing
- Teachers and instructors for classroom use
- Financial literacy programs

### User Personas
1. **Student**: College student in an economics course who needs to learn investment concepts through hands-on experience
2. **Instructor**: Teaching assistant who wants to run investment simulations for classroom sections
3. **Individual Learner**: Self-directed learner interested in developing investment skills

## Game Modes

### Single Player Mode
- Players start with $10,000 virtual cash
- Game consists of 20 rounds (market cycles)
- Players can invest in different asset classes
- Final portfolio value is recorded on the leaderboard
- Players can track their performance history

### Class Game Mode
- TAs can create and manage game sessions for their sections
- Students join their TA's active game session
- Everyone progresses through rounds together at the TA's pace
- Real-time rankings within the section
- Promotes collaborative learning and discussion

## Core Features

### Asset Classes
Six distinct asset classes with unique risk-return characteristics:
- S&P 500: Moderate growth potential with moderate volatility (11.5% avg. return, 19.5% std. dev.)
- Bonds: Lower risk with lower returns (3.3% avg. return, 3.0% std. dev.)
- Real Estate: Moderate growth with some volatility (4.4% avg. return, 6.2% std. dev.)
- Gold: Store of value during economic uncertainty (6.5% avg. return, 20.8% std. dev.)
- Commodities: Highly cyclical with high volatility (8.2% avg. return, 15.2% std. dev.)
- Bitcoin: Extremely high volatility with potential for significant returns (50% avg. return, 100% std. dev.)

### Trading Interface
- Asset selection with current price display
- Buy/sell options
- Dollar amount and quantity inputs with percentage sliders
- Visual representation of portfolio allocation
- Trade history log

### Market Simulation
- Realistic market cycles with correlated asset returns
- Bitcoin 4-year cycle with potential crashes
- Inflation simulation through CPI tracking
- Cash injections representing income or economic growth

### Portfolio Management
- Real-time portfolio value calculation
- Asset allocation visualization
- Performance tracking over time
- Comparison with different asset classes

### Data Visualization
- Portfolio value chart
- Asset allocation pie chart
- Comparative returns chart
- Asset price history charts
- CPI tracking

### Leaderboard System
- Track top performers in single player mode
- Class-specific leaderboards
- Filter by time period and section
- Personal statistics and achievements

## Technical Requirements

### Front-end Technologies
- HTML5, CSS3, JavaScript
- Bootstrap for responsive design
- Chart.js for interactive data visualization
- Firebase authentication for user accounts

### Back-end Technologies
- Firebase Firestore for database storage
- Real-time synchronization for class game mode
- Local storage fallback for offline use

### Authentication System
- Student accounts with section selection
- TA accounts with section management
- Guest mode for quick access

## User Experience

### Game Flow
1. **Start Game**: Player begins with $10,000 virtual cash
2. **Each Round**: Market prices update based on simulated market conditions
3. **Trading**: Player buys/sells assets to build their portfolio
4. **Next Round**: Player advances to the next market cycle
5. **End Game**: After 20 rounds, final portfolio value is calculated and saved

### User Interface Requirements
- Intuitive navigation between game modes and features
- Responsive design for desktop and mobile use
- Real-time updates of portfolio value and asset prices
- Clear visualization of market trends and portfolio performance
- Accessibility considerations for all users

## Analytics and Metrics
- Track user engagement and game completion rates
- Measure average portfolio performance across players
- Identify popular investment strategies
- Monitor class participation rates

## Future Enhancements
- Advanced mode with more complex investment options
- Customizable game parameters for instructors
- Market event simulations (crashes, booms, black swan events)
- Integration with external financial education resources

## Development Timeline
- Phase 1: Core game functionality (single player mode)
- Phase 2: Class game mode and TA controls
- Phase 3: Leaderboard and statistics features
- Phase 4: Performance optimization and UI enhancements

## Success Criteria
- Student engagement and completion rates
- Improved understanding of investment concepts (measured through surveys)
- Positive feedback from instructors on educational value
- Active participation in class game sessions