/**
 * Settings Service
 * Manages system configuration and settings
 */

import knex from '../config/database.js';

class SettingsService {
  constructor() {
    this.settingsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all settings
   * @returns {object} All system settings
   */
  async getAllSettings() {
    try {
      // Check cache first
      if (this.settingsCache.has('all_settings')) {
        const cached = this.settingsCache.get('all_settings');
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      const settings = await knex('settings').select('*');
      const settingsObject = {};

      settings.forEach(setting => {
        settingsObject[setting.key] = {
          key: setting.key,
          value: this.parseValue(setting.value, setting.data_type),
          type: setting.data_type,
          description: setting.description,
          updated_at: setting.updated_at
        };
      });

      // Cache the result
      this.settingsCache.set('all_settings', {
        data: settingsObject,
        timestamp: Date.now()
      });

      return settingsObject;
    } catch (error) {
      console.error('Error in getAllSettings:', error);
      throw new Error(`Failed to get all settings: ${error.message}`);
    }
  }

  /**
   * Get a single setting by key
   * @param {string} key - Setting key
   * @returns {object} Setting value and metadata
   */
  async getSetting(key) {
    try {
      const setting = await knex('settings').where('key', key).first();

      if (!setting) {
        throw new Error(`Setting not found: ${key}`);
      }

      return {
        key: setting.key,
        value: this.parseValue(setting.value, setting.data_type),
        type: setting.data_type,
        description: setting.description,
        updated_at: setting.updated_at
      };
    } catch (error) {
      console.error('Error in getSetting:', error);
      throw new Error(`Failed to get setting: ${error.message}`);
    }
  }

  /**
   * Update a setting
   * @param {string} key - Setting key
   * @param {*} value - New value
   * @param {string} updatedBy - User who updated (optional)
   * @returns {object} Updated setting
   */
  async updateSetting(key, value, updatedBy = null) {
    try {
      // Validate setting exists
      const existing = await knex('settings').where('key', key).first();
      if (!existing) {
        throw new Error(`Setting not found: ${key}`);
      }

      // Validate value based on data type
      const validated = this.validateValue(value, existing.data_type);

      // Update the setting
      await knex('settings')
        .where('key', key)
        .update({
          value: validated.toString(),
          updated_at: new Date(),
          updated_by: updatedBy
        });

      // Clear cache
      this.clearCache(key);

      return {
        key,
        value: validated,
        type: existing.data_type,
        description: existing.description,
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error in updateSetting:', error);
      throw new Error(`Failed to update setting: ${error.message}`);
    }
  }

  /**
   * Create a new setting
   * @param {string} key - Setting key
   * @param {*} value - Initial value
   * @param {string} dataType - Data type (string, number, boolean, json)
   * @param {string} description - Setting description
   * @returns {object} Created setting
   */
  async createSetting(key, value, dataType = 'string', description = '') {
    try {
      // Check if setting already exists
      const existing = await knex('settings').where('key', key).first();
      if (existing) {
        throw new Error(`Setting already exists: ${key}`);
      }

      // Validate value
      const validated = this.validateValue(value, dataType);

      // Insert new setting
      const [setting] = await knex('settings').insert({
        key,
        value: validated.toString(),
        data_type: dataType,
        description,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*');

      // Clear cache
      this.clearCache();

      return {
        key: setting.key,
        value: validated,
        type: setting.data_type,
        description: setting.description,
        created_at: setting.created_at
      };
    } catch (error) {
      console.error('Error in createSetting:', error);
      throw new Error(`Failed to create setting: ${error.message}`);
    }
  }

  /**
   * Delete a setting
   * @param {string} key - Setting key
   * @returns {boolean} Success
   */
  async deleteSetting(key) {
    try {
      const result = await knex('settings').where('key', key).del();

      if (result === 0) {
        throw new Error(`Setting not found: ${key}`);
      }

      // Clear cache
      this.clearCache(key);

      return true;
    } catch (error) {
      console.error('Error in deleteSetting:', error);
      throw new Error(`Failed to delete setting: ${error.message}`);
    }
  }

  /**
   * Get revenue settings
   * @returns {object} Revenue percentage settings
   */
  async getRevenueSettings() {
    try {
      const settings = await this.getAllSettings();

      return {
        tenant_percentage: parseFloat(settings.revenue_tenant_percentage?.value || 97),
        pengelola_percentage: parseFloat(settings.revenue_pengelola_percentage?.value || 2),
        system_percentage: parseFloat(settings.revenue_system_percentage?.value || 1),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error in getRevenueSettings:', error);
      throw new Error(`Failed to get revenue settings: ${error.message}`);
    }
  }

  /**
   * Update revenue percentages
   * @param {number} tenantPercentage - Tenant share percentage
   * @param {number} pengelolaPercentage - Pengelola share percentage
   * @param {number} systemPercentage - System share percentage
   * @returns {object} Updated settings
   */
  async updateRevenueSettings(tenantPercentage, pengelolaPercentage, systemPercentage) {
    try {
      // Validate total is 100
      const total = tenantPercentage + pengelolaPercentage + systemPercentage;
      if (Math.abs(total - 100) > 0.01) {
        throw new Error(`Revenue percentages must sum to 100 (got ${total})`);
      }

      // Validate each is positive
      if (tenantPercentage < 0 || pengelolaPercentage < 0 || systemPercentage < 0) {
        throw new Error('Revenue percentages must be positive');
      }

      // Update each setting
      await this.updateSetting('revenue_tenant_percentage', tenantPercentage.toString());
      await this.updateSetting('revenue_pengelola_percentage', pengelolaPercentage.toString());
      await this.updateSetting('revenue_system_percentage', systemPercentage.toString());

      return {
        tenant_percentage: tenantPercentage,
        pengelola_percentage: pengelolaPercentage,
        system_percentage: systemPercentage,
        total: 100,
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error in updateRevenueSettings:', error);
      throw new Error(`Failed to update revenue settings: ${error.message}`);
    }
  }

  /**
   * Get general settings
   * @returns {object} General system settings
   */
  async getGeneralSettings() {
    try {
      const settings = await this.getAllSettings();

      return {
        qr_expiry_hours: parseInt(settings.qr_expiry_hours?.value || 24),
        tax_percentage: parseFloat(settings.tax_percentage?.value || 10),
        business_name: settings.business_name?.value || 'Food Court POS System',
        business_address: settings.business_address?.value || '',
        phone_number: settings.phone_number?.value || '',
        email: settings.email?.value || '',
        timezone: settings.timezone?.value || 'Asia/Jakarta'
      };
    } catch (error) {
      console.error('Error in getGeneralSettings:', error);
      throw new Error(`Failed to get general settings: ${error.message}`);
    }
  }

  /**
   * Update general settings
   * @param {object} updates - Settings to update
   * @returns {object} Updated settings
   */
  async updateGeneralSettings(updates) {
    try {
      const updated = {};

      for (const [key, value] of Object.entries(updates)) {
        const settingKey = this.mapSettingKey(key);
        await this.updateSetting(settingKey, value);
        updated[key] = value;
      }

      return {
        ...updated,
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error in updateGeneralSettings:', error);
      throw new Error(`Failed to update general settings: ${error.message}`);
    }
  }

  /**
   * Get notification settings
   * @returns {object} Notification preferences
   */
  async getNotificationSettings() {
    try {
      const settings = await this.getAllSettings();

      return {
        email_notifications: settings.email_notifications?.value === 'true',
        sms_notifications: settings.sms_notifications?.value === 'true',
        push_notifications: settings.push_notifications?.value === 'true',
        notification_email: settings.notification_email?.value || '',
        notify_on_payment_failure: settings.notify_on_payment_failure?.value === 'true',
        notify_on_refund: settings.notify_on_refund?.value === 'true'
      };
    } catch (error) {
      console.error('Error in getNotificationSettings:', error);
      throw new Error(`Failed to get notification settings: ${error.message}`);
    }
  }

  /**
   * Update notification settings
   * @param {object} updates - Notification settings to update
   * @returns {object} Updated settings
   */
  async updateNotificationSettings(updates) {
    try {
      for (const [key, value] of Object.entries(updates)) {
        const settingKey = this.mapSettingKey(key);
        await this.updateSetting(settingKey, value.toString());
      }

      return {
        ...updates,
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error in updateNotificationSettings:', error);
      throw new Error(`Failed to update notification settings: ${error.message}`);
    }
  }

  /**
   * Parse value based on data type
   * @param {string} value - String value from database
   * @param {string} dataType - Data type specification
   * @returns {*} Parsed value
   */
  parseValue(value, dataType) {
    if (!value) return null;

    switch (dataType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      default:
        return value;
    }
  }

  /**
   * Validate value against data type
   * @param {*} value - Value to validate
   * @param {string} dataType - Expected data type
   * @returns {*} Validated/converted value
   */
  validateValue(value, dataType) {
    switch (dataType) {
      case 'number': {
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error('Value must be a valid number');
        }
        return num;
      }
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          throw new Error('Value must be true or false');
        }
        return value === 'true' || value === true ? 'true' : 'false';
      case 'json':
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return value;
          } catch (e) {
            throw new Error('Value must be valid JSON');
          }
        }
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  /**
   * Map setting key names (camelCase to snake_case)
   * @param {string} key - Camel case key
   * @returns {string} Snake case key
   */
  mapSettingKey(key) {
    return key.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * Clear cache for a setting or all
   * @param {string} key - Specific setting key (optional)
   */
  clearCache(key = null) {
    if (key) {
      this.settingsCache.delete(key);
      this.settingsCache.delete('all_settings');
    } else {
      this.settingsCache.clear();
    }
  }

  /**
   * Initialize default settings
   * @returns {array} Created settings
   */
  async initializeDefaultSettings() {
    try {
      const defaults = [
        {
          key: 'revenue_tenant_percentage',
          value: '97',
          data_type: 'number',
          description: 'Tenant revenue share percentage'
        },
        {
          key: 'revenue_pengelola_percentage',
          value: '2',
          data_type: 'number',
          description: 'Food court manager revenue share percentage'
        },
        {
          key: 'revenue_system_percentage',
          value: '1',
          data_type: 'number',
          description: 'System/platform revenue share percentage'
        },
        {
          key: 'qr_expiry_hours',
          value: '24',
          data_type: 'number',
          description: 'QR code expiry time in hours'
        },
        {
          key: 'tax_percentage',
          value: '10',
          data_type: 'number',
          description: 'Sales tax percentage'
        },
        {
          key: 'business_name',
          value: 'Food Court POS System',
          data_type: 'string',
          description: 'Business name'
        },
        {
          key: 'business_address',
          value: '',
          data_type: 'string',
          description: 'Business address'
        },
        {
          key: 'phone_number',
          value: '',
          data_type: 'string',
          description: 'Business phone number'
        },
        {
          key: 'email',
          value: '',
          data_type: 'string',
          description: 'Business email'
        },
        {
          key: 'timezone',
          value: 'Asia/Jakarta',
          data_type: 'string',
          description: 'System timezone'
        },
        {
          key: 'email_notifications',
          value: 'true',
          data_type: 'boolean',
          description: 'Enable email notifications'
        },
        {
          key: 'sms_notifications',
          value: 'false',
          data_type: 'boolean',
          description: 'Enable SMS notifications'
        },
        {
          key: 'push_notifications',
          value: 'true',
          data_type: 'boolean',
          description: 'Enable push notifications'
        },
        {
          key: 'notification_email',
          value: '',
          data_type: 'string',
          description: 'Email for notifications'
        },
        {
          key: 'notify_on_payment_failure',
          value: 'true',
          data_type: 'boolean',
          description: 'Notify on payment failure'
        },
        {
          key: 'notify_on_refund',
          value: 'true',
          data_type: 'boolean',
          description: 'Notify on refund'
        }
      ];

      const created = [];
      for (const setting of defaults) {
        try {
          const result = await this.createSetting(
            setting.key,
            setting.value,
            setting.data_type,
            setting.description
          );
          created.push(result);
        } catch (e) {
          // Setting already exists, skip
          if (!e.message.includes('already exists')) {
            throw e;
          }
        }
      }

      return created;
    } catch (error) {
      console.error('Error in initializeDefaultSettings:', error);
      throw new Error(`Failed to initialize settings: ${error.message}`);
    }
  }
}

export default new SettingsService();
