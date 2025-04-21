/**
 * Leaderboard Service for Investment Odyssey
 *
 * Handles leaderboard data and calculations.
 */

import BaseService from './base-service.js';

class LeaderboardService extends BaseService {
  constructor() {
    super();
  }

  // Initialize service
  initialize() {
    console.log('Leaderboard service initialized');
  }

  // Get single player leaderboard
  async getSinglePlayerLeaderboard(limit = 100) {
    try {
      // Get the highest portfolio value for each player in single player games
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('*')
        .eq('game_mode', 'single')
        .order('final_portfolio', { ascending: false })
        .limit(limit);

      if (error) {
        return this.error('Error getting single player leaderboard', error);
      }

      return this.success(data || []);
    } catch (error) {
      return this.error('Error getting single player leaderboard', error);
    }
  }

  // Get class game leaderboard for a specific section
  async getClassLeaderboard(sectionId, limit = 100) {
    try {
      if (!sectionId) {
        return this.error('Section ID is required');
      }

      // Get the highest portfolio value for each player in the class game
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('*')
        .eq('game_mode', 'class')
        .eq('section_id', sectionId)
        .order('final_portfolio', { ascending: false })
        .limit(limit);

      if (error) {
        return this.error('Error getting class leaderboard', error);
      }

      return this.success(data || []);
    } catch (error) {
      return this.error('Error getting class leaderboard', error);
    }
  }

  // Get all class game leaderboards
  async getAllClassLeaderboards(limit = 100) {
    try {
      // Get all sections
      const { data: sections, error: sectionsError } = await this.supabase
        .from('sections')
        .select(`
          id,
          day,
          time,
          location,
          ta:ta_id (name)
        `)
        .order('day')
        .order('time');

      if (sectionsError) {
        return this.error('Error getting sections', sectionsError);
      }

      // Get leaderboard for each section
      const leaderboards = [];
      for (const section of sections) {
        const result = await this.getClassLeaderboard(section.id, limit);
        if (result.success) {
          leaderboards.push({
            section: {
              id: section.id,
              day: section.day,
              time: section.time,
              location: section.location,
              ta: section.ta?.name || 'Unknown'
            },
            leaderboard: result.data
          });
        }
      }

      return this.success(leaderboards);
    } catch (error) {
      return this.error('Error getting all class leaderboards', error);
    }
  }

  // Get player's best score (single player)
  async getPlayerBestScore(userId) {
    try {
      if (!userId) {
        return this.error('User ID is required');
      }

      // Get player's best score in single player games
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .eq('game_mode', 'single')
        .order('final_portfolio', { ascending: false })
        .limit(1);

      if (error) {
        return this.error('Error getting player best score', error);
      }

      return this.success(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      return this.error('Error getting player best score', error);
    }
  }

  // Get player's best class game score
  async getPlayerBestClassScore(userId, sectionId) {
    try {
      if (!userId) {
        return this.error('User ID is required');
      }

      // Build query
      let query = this.supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .eq('game_mode', 'class');

      // Add section filter if provided
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      // Execute query
      const { data, error } = await query
        .order('final_portfolio', { ascending: false })
        .limit(1);

      if (error) {
        return this.error('Error getting player best class score', error);
      }

      return this.success(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      return this.error('Error getting player best class score', error);
    }
  }

  // Get game statistics
  async getGameStatistics(gameType = 'investment-odyssey') {
    try {
      // Get statistics for the game type
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('final_portfolio')
        .eq('game_type', gameType);

      if (error) {
        return this.error('Error getting game statistics', error);
      }

      // Calculate statistics
      if (!data || data.length === 0) {
        return this.success({
          avgPortfolio: 0,
          topScore: 0,
          totalPlayers: 0,
          totalGames: 0
        });
      }

      const portfolios = data.map(item => item.final_portfolio);
      const sum = portfolios.reduce((a, b) => a + b, 0);
      const avg = sum / portfolios.length;
      const max = Math.max(...portfolios);

      return this.success({
        avgPortfolio: avg,
        topScore: max,
        totalPlayers: new Set(data.map(item => item.user_id)).size,
        totalGames: data.length
      });
    } catch (error) {
      return this.error('Error getting game statistics', error);
    }
  }

  // Get player statistics
  async getPlayerStatistics(userId, gameType = 'investment-odyssey') {
    try {
      if (!userId) {
        return this.error('User ID is required');
      }

      // Get all scores for the player
      const { data, error } = await this.supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .eq('game_type', gameType)
        .order('created_at', { ascending: false });

      if (error) {
        return this.error('Error getting player statistics', error);
      }

      // Calculate statistics
      if (!data || data.length === 0) {
        return this.success({
          totalGames: 0,
          bestScore: 0,
          avgScore: 0,
          recentScores: []
        });
      }

      const portfolios = data.map(item => item.final_portfolio);
      const sum = portfolios.reduce((a, b) => a + b, 0);
      const avg = sum / portfolios.length;
      const max = Math.max(...portfolios);

      return this.success({
        totalGames: data.length,
        bestScore: max,
        avgScore: avg,
        recentScores: data.slice(0, 5)
      });
    } catch (error) {
      return this.error('Error getting player statistics', error);
    }
  }
}

// Create and export a singleton instance
const leaderboardService = new LeaderboardService();
export default leaderboardService;
