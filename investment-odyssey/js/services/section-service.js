/**
 * Section Service for Investment Odyssey
 *
 * Handles section management for TAs and students.
 */

import BaseService from './base-service.js';

class SectionService extends BaseService {
  constructor() {
    super();
  }

  // Initialize service
  initialize() {
    console.log('Section service initialized');
  }

  // Get all sections
  async getAllSections() {
    try {
      // Get sections ordered by day and time
      const { data: sections, error } = await this.supabase
        .from('sections')
        .select(`
          id,
          day,
          time,
          location,
          ta_id,
          profiles:ta_id (name)
        `)
        .order('day')
        .order('time');

      if (error) {
        return this.error('Error getting sections', error);
      }

      // Format the sections
      const formattedSections = sections.map(section => ({
        id: section.id,
        day: section.day,
        time: section.time,
        location: section.location,
        ta: section.profiles?.name || 'Unknown'
      }));

      return this.success(formattedSections);
    } catch (error) {
      return this.error('Error getting sections', error);
    }
  }

  // Get sections for a TA
  async getTASections(taId) {
    try {
      if (!taId) {
        return this.error('TA ID is required');
      }

      // Get sections for the TA
      const { data: sections, error } = await this.supabase
        .from('sections')
        .select('*')
        .eq('ta_id', taId)
        .order('day')
        .order('time');

      if (error) {
        return this.error('Error getting TA sections', error);
      }

      return this.success(sections);
    } catch (error) {
      return this.error('Error getting TA sections', error);
    }
  }

  // Get a section by ID
  async getSection(sectionId) {
    try {
      if (!sectionId) {
        return this.error('Section ID is required');
      }

      // Get section
      const { data: section, error } = await this.supabase
        .from('sections')
        .select(`
          id,
          day,
          time,
          location,
          ta_id,
          profiles:ta_id (name)
        `)
        .eq('id', sectionId)
        .single();

      if (error) {
        return this.error('Error getting section', error);
      }

      // Format the section
      const formattedSection = {
        id: section.id,
        day: section.day,
        time: section.time,
        location: section.location,
        ta: section.profiles?.name || 'Unknown'
      };

      return this.success(formattedSection);
    } catch (error) {
      return this.error('Error getting section', error);
    }
  }

  // Create a section
  async createSection(taId, day, time, location) {
    try {
      if (!taId || !day || !time) {
        return this.error('TA ID, day, time, and location are required');
      }

      // Get TA name for reference
      const { data: ta, error: taError } = await this.supabase
        .from('profiles')
        .select('name')
        .eq('id', taId)
        .single();

      if (taError) {
        return this.error('TA not found', taError);
      }

      // Create section
      const { data: section, error: sectionError } = await this.supabase
        .from('sections')
        .insert({
          day,
          time,
          location: location || 'TBD',
          ta_id: taId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sectionError) {
        return this.error('Error creating section', sectionError);
      }

      return this.success(section);
    } catch (error) {
      return this.error('Error creating section', error);
    }
  }

  // Update a section
  async updateSection(sectionId, day, time, location) {
    try {
      if (!sectionId) {
        return this.error('Section ID is required');
      }

      // Build update object
      const updates = {};
      if (day !== undefined) updates.day = day;
      if (time !== undefined) updates.time = time;
      if (location !== undefined) updates.location = location;

      // Update section
      const { data: section, error } = await this.supabase
        .from('sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) {
        return this.error('Error updating section', error);
      }

      return this.success(section);
    } catch (error) {
      return this.error('Error updating section', error);
    }
  }

  // Delete a section
  async deleteSection(sectionId) {
    try {
      if (!sectionId) {
        return this.error('Section ID is required');
      }

      // Delete section
      const { error } = await this.supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

      if (error) {
        return this.error('Error deleting section', error);
      }

      return this.success();
    } catch (error) {
      return this.error('Error deleting section', error);
    }
  }

  // Get students in a section
  async getSectionStudents(sectionId) {
    try {
      if (!sectionId) {
        return this.error('Section ID is required');
      }

      // Get students in the section
      const { data: students, error } = await this.supabase
        .from('profiles')
        .select('id, name, custom_id, last_login')
        .eq('section_id', sectionId)
        .eq('role', 'student')
        .order('name');

      if (error) {
        return this.error('Error getting section students', error);
      }

      return this.success(students);
    } catch (error) {
      return this.error('Error getting section students', error);
    }
  }

  // Add a student to a section
  async addStudentToSection(studentId, sectionId) {
    try {
      if (!studentId || !sectionId) {
        return this.error('Student ID and section ID are required');
      }

      // Update student profile
      const { data: student, error } = await this.supabase
        .from('profiles')
        .update({ section_id: sectionId })
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        return this.error('Error adding student to section', error);
      }

      return this.success(student);
    } catch (error) {
      return this.error('Error adding student to section', error);
    }
  }

  // Remove a student from a section
  async removeStudentFromSection(studentId) {
    try {
      if (!studentId) {
        return this.error('Student ID is required');
      }

      // Update student profile
      const { data: student, error } = await this.supabase
        .from('profiles')
        .update({ section_id: null })
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        return this.error('Error removing student from section', error);
      }

      return this.success(student);
    } catch (error) {
      return this.error('Error removing student from section', error);
    }
  }
}

// Create and export a singleton instance
const sectionService = new SectionService();
export default sectionService;
