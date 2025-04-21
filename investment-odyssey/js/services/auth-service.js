/**
 * Authentication Service for Investment Odyssey
 *
 * Handles user authentication, registration, and session management.
 */

import BaseService from './base-service.js';

class AuthService extends BaseService {
  constructor() {
    super();

    // Local storage keys
    this.USER_ID_KEY = 'investment_odyssey_user_id';
    this.USER_NAME_KEY = 'investment_odyssey_user_name';
    this.USER_ROLE_KEY = 'investment_odyssey_user_role';
    this.USER_SECTION_KEY = 'investment_odyssey_user_section';
    this.GUEST_MODE_KEY = 'investment_odyssey_guest_mode';
  }

  // Initialize service
  initialize() {
    console.log('Auth service initialized');
  }

  // Register a student
  async registerStudent(name, passcode) {
    try {
      // Validate inputs
      if (!name || !passcode) {
        return this.error('Name and passcode are required');
      }

      // Check if student already exists
      const { data: existingProfiles, error: queryError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('name', name)
        .eq('role', 'student');

      if (queryError) {
        return this.error('Error checking for existing student', queryError);
      }

      if (existingProfiles && existingProfiles.length > 0) {
        return this.error('A student with this name already exists');
      }

      // Generate a unique ID for the student
      const userId = this.generateUserId(name);

      // Create the profile in Supabase
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          custom_id: userId,
          name: name,
          role: 'student',
          passcode: passcode,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        return this.error('Error creating student profile', profileError);
      }

      // Save session
      this.saveSession(
        profile.id,
        profile.name,
        profile.role,
        profile.section_id
      );

      return this.success(profile);
    } catch (error) {
      return this.error('Error registering student', error);
    }
  }

  // Login a student
  async loginStudent(name, passcode) {
    try {
      // Validate inputs
      if (!name || !passcode) {
        return this.error('Name and passcode are required');
      }

      // Query for student with matching name and passcode
      const { data: profiles, error: queryError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('name', name)
        .eq('passcode', passcode)
        .eq('role', 'student');

      if (queryError) {
        return this.error('Error querying for student', queryError);
      }

      if (!profiles || profiles.length === 0) {
        return this.error('Invalid name or passcode');
      }

      const profile = profiles[0];

      // Update last login time
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) {
        console.warn('Error updating last login time', updateError);
      }

      // Save session
      this.saveSession(
        profile.id,
        profile.name,
        profile.role,
        profile.section_id
      );

      return this.success(profile);
    } catch (error) {
      return this.error('Error logging in student', error);
    }
  }

  // Login a TA
  async loginTA(name, passcode) {
    try {
      // Validate inputs
      if (!name || !passcode) {
        return this.error('Name and passcode are required');
      }

      // Check if this is a known TA name
      const knownTAs = ['Akshay', 'Simran', 'Camilla', 'Hui Yann', 'Lars', 'Luorao'];
      const isKnownTA = knownTAs.includes(name);

      // Query for TA with matching name
      const { data: profiles, error: queryError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('name', name)
        .eq('role', 'ta');

      if (queryError) {
        return this.error('Error querying for TA', queryError);
      }

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];

        // Check passcode
        if (profile.passcode !== passcode) {
          return this.error('Invalid passcode');
        }

        // Update last login time
        const { error: updateError } = await this.supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', profile.id);

        if (updateError) {
          console.warn('Error updating last login time', updateError);
        }

        // Save session
        this.saveSession(
          profile.id,
          profile.name,
          profile.role,
          null
        );

        return this.success(profile);
      } else if (isKnownTA) {
        // Create TA on the fly if it's a known TA name
        const generatedPasscode = this.generateTAPasscode(name);

        // Check if provided passcode matches generated one
        if (passcode !== generatedPasscode) {
          return this.error('Invalid passcode');
        }

        // Generate a unique ID for the TA
        const userId = this.generateUserId(name);

        // Create the profile in Supabase
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: userId,
            custom_id: userId,
            name: name,
            role: 'ta',
            passcode: generatedPasscode,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          return this.error('Error creating TA profile', profileError);
        }

        // Save session
        this.saveSession(
          profile.id,
          profile.name,
          profile.role,
          null
        );

        return this.success(profile);
      } else {
        return this.error('Invalid TA name or passcode');
      }
    } catch (error) {
      return this.error('Error logging in TA', error);
    }
  }

  // Generate a user ID from name
  generateUserId(name) {
    // Create a deterministic ID based on the name
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${cleanName}_${randomPart}`;
  }

  // Generate a TA passcode
  generateTAPasscode(name) {
    // Simple algorithm to generate a passcode from the TA name
    // In a real app, this would be more secure
    const nameSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return (nameSum % 90000 + 10000).toString();
  }

  // Get current user
  getCurrentUser() {
    // First try our own keys
    let userId = localStorage.getItem(this.USER_ID_KEY);
    let userName = localStorage.getItem(this.USER_NAME_KEY);
    let userRole = localStorage.getItem(this.USER_ROLE_KEY);
    let sectionId = localStorage.getItem(this.USER_SECTION_KEY);

    // If not found, try the main app keys
    if (!userId || !userName) {
      userId = localStorage.getItem('student_id');
      userName = localStorage.getItem('student_name');
      userRole = localStorage.getItem('role') || 'student'; // Default to student if not specified
      sectionId = localStorage.getItem('section_id');

      // If found in main app keys, save to our keys for future use
      if (userId && userName) {
        this.saveSession(userId, userName, userRole, sectionId);
      }
    }

    if (!userId || !userName) {
      return null;
    }

    return {
      id: userId,
      name: userName,
      role: userRole,
      sectionId: sectionId
    };
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getCurrentUser() && !this.isGuest();
  }

  // Check if user is a TA
  isTA() {
    const user = this.getCurrentUser();
    return user && user.role === 'ta';
  }

  // Check if user is a student
  isStudent() {
    const user = this.getCurrentUser();
    return user && user.role === 'student';
  }

  // Set guest mode
  setGuestMode() {
    // Generate a guest ID
    const guestId = `guest_${Date.now()}`;

    // Save guest session
    this.saveSession(guestId, 'Guest', 'guest', null);
    localStorage.setItem(this.GUEST_MODE_KEY, 'true');

    return this.success();
  }

  // Check if user is in guest mode
  isGuest() {
    return localStorage.getItem(this.GUEST_MODE_KEY) === 'true';
  }

  // Save session
  saveSession(userId, userName, userRole, sectionId) {
    localStorage.setItem(this.USER_ID_KEY, userId);
    localStorage.setItem(this.USER_NAME_KEY, userName);
    localStorage.setItem(this.USER_ROLE_KEY, userRole);

    if (sectionId) {
      localStorage.setItem(this.USER_SECTION_KEY, sectionId);
    } else {
      localStorage.removeItem(this.USER_SECTION_KEY);
    }
  }

  // Clear session
  clearSession() {
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_NAME_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem(this.USER_SECTION_KEY);
    localStorage.removeItem(this.GUEST_MODE_KEY);
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
