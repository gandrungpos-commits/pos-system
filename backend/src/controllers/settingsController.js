/**
 * Settings Controller
 * Handles settings requests and responses
 */

import { validationResult } from 'express-validator';
import SettingsService from '../services/SettingsService.js';

export const getAllSettings = async (req, res) => {
  try {
    const settings = await SettingsService.getAllSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getAllSettings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_ERROR',
        message: error.message
      }
    });
  }
};

export const getSetting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { key } = req.params;
    const setting = await SettingsService.getSetting(key);

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error in getSetting:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_ERROR',
        message: error.message
      }
    });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { key } = req.params;
    const { value } = req.body;

    const updated = await SettingsService.updateSetting(key, value);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error in updateSetting:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message }
      });
    }
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
};

export const getRevenueSettings = async (req, res) => {
  try {
    const settings = await SettingsService.getRevenueSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getRevenueSettings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_ERROR',
        message: error.message
      }
    });
  }
};

export const updateRevenueSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const { tenant_percentage, pengelola_percentage, system_percentage } = req.body;

    const updated = await SettingsService.updateRevenueSettings(
      parseFloat(tenant_percentage),
      parseFloat(pengelola_percentage),
      parseFloat(system_percentage)
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error in updateRevenueSettings:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
};

export const getGeneralSettings = async (req, res) => {
  try {
    const settings = await SettingsService.getGeneralSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getGeneralSettings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_ERROR',
        message: error.message
      }
    });
  }
};

export const updateGeneralSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const updates = req.body;
    const updated = await SettingsService.updateGeneralSettings(updates);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error in updateGeneralSettings:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
};

export const getNotificationSettings = async (req, res) => {
  try {
    const settings = await SettingsService.getNotificationSettings();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getNotificationSettings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_ERROR',
        message: error.message
      }
    });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() }
      });
    }

    const updates = req.body;
    const updated = await SettingsService.updateNotificationSettings(updates);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error in updateNotificationSettings:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
};

export const initializeSettings = async (req, res) => {
  try {
    const created = await SettingsService.initializeDefaultSettings();

    res.status(201).json({
      success: true,
      data: {
        created: created.length,
        settings: created
      }
    });
  } catch (error) {
    console.error('Error in initializeSettings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INITIALIZATION_ERROR',
        message: error.message
      }
    });
  }
};
