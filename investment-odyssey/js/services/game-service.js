/**
 * Game Service for Investment Odyssey
 *
 * Handles game state management, saving and loading game data.
 */

import BaseService from './base-service.js';

class GameService extends BaseService {
  constructor() {
    super();
  }

  // Initialize service
  initialize() {
    console.log('Game service initialized');
  }

  // Create a new game
  async createGame(type, creatorId, sectionId = null, maxRounds = 20) {
    try {
      if (!type || !creatorId) {
        return this.error('Game type and creator ID are required');
      }

      // Create game in Supabase
      const { data: game, error } = await this.supabase
        .from('games')
        .insert({
          type: type,
          creator_id: creatorId,
          section_id: sectionId,
          status: 'active',
          current_round: 0,
          max_rounds: maxRounds,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.error('Error creating game', error);
      }

      return this.success(game);
    } catch (error) {
      return this.error('Error creating game', error);
    }
  }

  // Get a game by ID
  async getGame(gameId) {
    try {
      if (!gameId) {
        return this.error('Game ID is required');
      }

      // Get game from Supabase
      const { data: game, error } = await this.supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        return this.error('Error getting game', error);
      }

      return this.success(game);
    } catch (error) {
      return this.error('Error getting game', error);
    }
  }

  // Update game status
  async updateGameStatus(gameId, status) {
    try {
      if (!gameId || !status) {
        return this.error('Game ID and status are required');
      }

      // Update game status in Supabase
      const { data: game, error } = await this.supabase
        .from('games')
        .update({ status: status })
        .eq('id', gameId)
        .select()
        .single();

      if (error) {
        return this.error('Error updating game status', error);
      }

      return this.success(game);
    } catch (error) {
      return this.error('Error updating game status', error);
    }
  }

  // Update game round
  async updateGameRound(gameId, roundNumber) {
    try {
      if (!gameId || roundNumber === undefined) {
        return this.error('Game ID and round number are required');
      }

      // Update game round in Supabase
      const { data: game, error } = await this.supabase
        .from('games')
        .update({ current_round: roundNumber })
        .eq('id', gameId)
        .select()
        .single();

      if (error) {
        return this.error('Error updating game round', error);
      }

      return this.success(game);
    } catch (error) {
      return this.error('Error updating game round', error);
    }
  }

  // Save game round
  async saveGameRound(gameId, roundNumber, assetPrices, priceHistory, cpi, cpiHistory) {
    try {
      if (!gameId || roundNumber === undefined || !assetPrices) {
        return this.error('Game ID, round number, and asset prices are required');
      }

      // Check if round already exists
      const { data: existingRound, error: checkError } = await this.supabase
        .from('game_rounds')
        .select('id')
        .eq('game_id', gameId)
        .eq('round_number', roundNumber)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        return this.error('Error checking for existing round', checkError);
      }

      let gameRound;

      if (existingRound) {
        // Update existing round
        const { data: updatedRound, error: updateError } = await this.supabase
          .from('game_rounds')
          .update({
            asset_prices: assetPrices,
            price_history: priceHistory,
            cpi: cpi,
            cpi_history: cpiHistory
          })
          .eq('id', existingRound.id)
          .select()
          .single();

        if (updateError) {
          return this.error('Error updating game round', updateError);
        }

        gameRound = updatedRound;
      } else {
        // Create new round
        const { data: newRound, error: insertError } = await this.supabase
          .from('game_rounds')
          .insert({
            game_id: gameId,
            round_number: roundNumber,
            asset_prices: assetPrices,
            price_history: priceHistory,
            cpi: cpi,
            cpi_history: cpiHistory,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          return this.error('Error creating game round', insertError);
        }

        gameRound = newRound;
      }

      return this.success(gameRound);
    } catch (error) {
      return this.error('Error saving game round', error);
    }
  }

  // Get game round
  async getGameRound(gameId, roundNumber) {
    try {
      if (!gameId || roundNumber === undefined) {
        return this.error('Game ID and round number are required');
      }

      // Get game round from Supabase
      const { data: gameRound, error } = await this.supabase
        .from('game_rounds')
        .select('*')
        .eq('game_id', gameId)
        .eq('round_number', roundNumber)
        .single();

      if (error) {
        return this.error('Error getting game round', error);
      }

      return this.success(gameRound);
    } catch (error) {
      return this.error('Error getting game round', error);
    }
  }

  // Save player state
  async savePlayerState(gameId, userId, roundNumber, cash, portfolio, tradeHistory, portfolioValue, portfolioHistory) {
    try {
      if (!gameId || !userId || roundNumber === undefined || cash === undefined || !portfolio) {
        return this.error('Game ID, user ID, round number, cash, and portfolio are required');
      }

      // Check if player state already exists
      const { data: existingState, error: checkError } = await this.supabase
        .from('player_states')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .eq('round_number', roundNumber)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        return this.error('Error checking for existing player state', checkError);
      }

      let playerState;

      if (existingState) {
        // Update existing state
        const { data: updatedState, error: updateError } = await this.supabase
          .from('player_states')
          .update({
            cash: cash,
            portfolio: portfolio,
            trade_history: tradeHistory,
            portfolio_value: portfolioValue,
            portfolio_history: portfolioHistory
          })
          .eq('id', existingState.id)
          .select()
          .single();

        if (updateError) {
          return this.error('Error updating player state', updateError);
        }

        playerState = updatedState;
      } else {
        // Create new state
        const { data: newState, error: insertError } = await this.supabase
          .from('player_states')
          .insert({
            game_id: gameId,
            user_id: userId,
            round_number: roundNumber,
            cash: cash,
            portfolio: portfolio,
            trade_history: tradeHistory,
            portfolio_value: portfolioValue,
            portfolio_history: portfolioHistory,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          return this.error('Error creating player state', insertError);
        }

        playerState = newState;
      }

      return this.success(playerState);
    } catch (error) {
      return this.error('Error saving player state', error);
    }
  }

  // Get player state
  async getPlayerState(gameId, userId, roundNumber) {
    try {
      if (!gameId || !userId || roundNumber === undefined) {
        return this.error('Game ID, user ID, and round number are required');
      }

      // Get player state from Supabase
      const { data: playerState, error } = await this.supabase
        .from('player_states')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .eq('round_number', roundNumber)
        .single();

      if (error) {
        return this.error('Error getting player state', error);
      }

      return this.success(playerState);
    } catch (error) {
      return this.error('Error getting player state', error);
    }
  }

  // Get all player states for a game
  async getGamePlayerStates(gameId) {
    try {
      if (!gameId) {
        return this.error('Game ID is required');
      }

      // Get all player states for the game
      const { data: playerStates, error } = await this.supabase
        .from('player_states')
        .select('*')
        .eq('game_id', gameId)
        .order('user_id')
        .order('round_number');

      if (error) {
        return this.error('Error getting game player states', error);
      }

      return this.success(playerStates);
    } catch (error) {
      return this.error('Error getting game player states', error);
    }
  }

  // Get player history for a game
  async getPlayerHistory(gameId, userId) {
    try {
      if (!gameId || !userId) {
        return this.error('Game ID and user ID are required');
      }

      // Get all player states for the game and user
      const { data: playerStates, error } = await this.supabase
        .from('player_states')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .order('round_number');

      if (error) {
        return this.error('Error getting player history', error);
      }

      return this.success(playerStates);
    } catch (error) {
      return this.error('Error getting player history', error);
    }
  }

  // Get latest player state
  async getLatestPlayerState(gameId, userId) {
    try {
      if (!gameId || !userId) {
        return this.error('Game ID and user ID are required');
      }

      // Get the latest player state for the game and user
      const { data: playerStates, error } = await this.supabase
        .from('player_states')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .order('round_number', { ascending: false })
        .limit(1);

      if (error) {
        return this.error('Error getting latest player state', error);
      }

      if (!playerStates || playerStates.length === 0) {
        return this.error('No player state found');
      }

      return this.success(playerStates[0]);
    } catch (error) {
      return this.error('Error getting latest player state', error);
    }
  }

  // Save game score to leaderboard
  async saveGameScore(userId, userName, gameId, gameType, gameMode, finalPortfolio, taName = null, sectionId = null) {
    try {
      if (!userId || !userName || !gameId || !gameType || !gameMode || finalPortfolio === undefined) {
        return this.error('User ID, user name, game ID, game type, game mode, and final portfolio are required');
      }

      // Create leaderboard entry
      const { data: score, error } = await this.supabase
        .from('leaderboard')
        .insert({
          user_id: userId,
          user_name: userName,
          game_id: gameId,
          game_type: gameType,
          game_mode: gameMode,
          final_portfolio: finalPortfolio,
          ta_name: taName,
          section_id: sectionId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.error('Error saving game score', error);
      }

      return this.success(score);
    } catch (error) {
      return this.error('Error saving game score', error);
    }
  }
}

// Create and export a singleton instance
const gameService = new GameService();
export default gameService;
