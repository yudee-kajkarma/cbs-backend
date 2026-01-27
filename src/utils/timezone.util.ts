import { find } from 'geo-tz';
import { ErrorHandler } from './error-handler.util';

/**
 * Timezone Utility Functions
 * Helper functions for timezone detection and conversion
 */
export class TimezoneUtil {
  /**
   * Detect timezone from GPS coordinates
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns IANA timezone string (e.g., "Asia/Dubai") or null if detection fails
   */
  static detectTimezone(latitude?: number, longitude?: number): string | null {
    try {
      if (latitude === undefined || longitude === null || 
          latitude === null || longitude === undefined) {
        return null;
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return null;
      }

      const timezones = find(latitude, longitude);
      return timezones && timezones.length > 0 ? timezones[0] : null;
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'TimezoneUtil', 
        method: 'detectTimezone', 
        latitude, 
        longitude,
        context: 'Non-critical timezone detection failure'
      });
      return null;
    }
  }
}
