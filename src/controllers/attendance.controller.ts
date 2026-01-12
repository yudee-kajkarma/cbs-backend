import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceResponseDto, DailySummaryResponseDto } from '../dtos/attendance-dto';
import { toDto } from '../utils/dto-mapper.util';
import { ResponseUtil } from '../utils/response-formatter.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { INFO_MESSAGES } from '../constants/info-messages.constants';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { NetworkValidator } from '../utils/network-validator.util';

export class AttendanceController {
  /**
   * Mark attendance (check-in or check-out)
   */
  static async markAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, action } = req.params;
      const ipAddress = NetworkValidator.getClientIP(req);
      
      if (action !== 'check-in' && action !== 'check-out') {
        const error = ERROR_MESSAGES.CLIENT_ERRORS.INVALID_ATTENDANCE_ACTION;
        const response = ResponseUtil.error(error.code, error.message);
        res.status(error.status).json(response);
        return;
      }
      
      // Extract location from request body (optional)
      const location = req.body?.location ? {
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude
      } : undefined;
      
      const result = action === 'check-in' 
        ? await AttendanceService.checkIn(employeeId, ipAddress, location)
        : await AttendanceService.checkOut(employeeId, ipAddress, location);
      
      const message = action === 'check-in' 
        ? INFO_MESSAGES.ATTENDANCE.CHECKED_IN_SUCCESSFULLY 
        : INFO_MESSAGES.ATTENDANCE.CHECKED_OUT_SUCCESSFULLY;
      
      const attendanceDto = toDto(AttendanceResponseDto, result);
      const response = ResponseUtil.success(message, attendanceDto);
      res.status(action === 'check-in' ? 201 : 200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'markAttendance', employeeId: req.params.employeeId, action: req.params.action });
    }
  }

  /**
   * Get daily attendance summary with salary calculations
   */
  static async getDailySummary(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      const result = await AttendanceService.getDailySummary(query);
      const summaryDto = toDto(DailySummaryResponseDto, result);
      const response = ResponseUtil.success(INFO_MESSAGES.ATTENDANCE.DAILY_SUMMARY_RETRIEVED_SUCCESSFULLY, summaryDto);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getDailySummary', query: req.query });
    }
  }

  /**
   * Check network status
   */
  static async checkNetworkStatus(req: Request, res: Response): Promise<void> {
    try {
      const clientIP = NetworkValidator.getClientIP(req);
      const isOnCompanyNetwork = NetworkValidator.isCompanyNetwork(clientIP);
      
      const response = ResponseUtil.success(
        isOnCompanyNetwork ? INFO_MESSAGES.ATTENDANCE.NETWORK_STATUS_CONNECTED : INFO_MESSAGES.ATTENDANCE.NETWORK_STATUS_DISCONNECTED,
        {
          isOnCompanyNetwork,
          clientIP: clientIP,
          message: isOnCompanyNetwork ? INFO_MESSAGES.ATTENDANCE.NETWORK_MESSAGE_AUTHORIZED : INFO_MESSAGES.ATTENDANCE.NETWORK_MESSAGE_UNAUTHORIZED
        }
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'checkNetworkStatus' });
    }
  }

  /**
   * Get employee attendance history
   */
  static async getAttendanceHistory(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const query = res.locals.validatedQuery || req.query;
      const startDate = query.startDate ? new Date(query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = query.endDate ? new Date(query.endDate as string) : new Date();
      
      const records = await AttendanceService.getAttendanceHistory(employeeId, startDate, endDate);
      const response = ResponseUtil.success(INFO_MESSAGES.ATTENDANCE.LIST_RETRIEVED_SUCCESSFULLY, records);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getAttendanceHistory', employeeId: req.params.employeeId, query: req.query });
    }
  }

  /**
   * Get monthly statistics for employee
   */
  static async getMonthlyStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const query = res.locals.validatedQuery || req.query;
      const month = query.month ? parseInt(query.month as string) : new Date().getMonth() + 1;
      const year = query.year ? parseInt(query.year as string) : new Date().getFullYear();
      
      const statistics = await AttendanceService.getMonthlyStatistics(employeeId, month, year);
      const response = ResponseUtil.success(INFO_MESSAGES.ATTENDANCE.MONTHLY_STATISTICS_RETRIEVED_SUCCESSFULLY, statistics);
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getMonthlyStatistics', employeeId: req.params.employeeId, query: req.query });
    }
  }

  /**
   * Stream live attendance updates via Server-Sent Events (SSE)
   */
  static async streamLiveAttendance(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals.validatedQuery || req.query;
      await AttendanceService.streamLiveAttendance(req, res, query);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'streamLiveAttendance', query: req.query });
    }
  }

  /**
   * Get today's attendance status for an employee
   */
  static async getTodayStatus(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      const todayStatus = await AttendanceService.getTodayStatus(employeeId);
      
      const response = ResponseUtil.success(
        INFO_MESSAGES.ATTENDANCE.TODAY_STATUS_FETCHED,
        todayStatus
      );
      res.status(200).json(response);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res, { method: 'getTodayStatus', employeeId: req.params.employeeId });
    }
  }
}
