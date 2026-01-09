import { NewHardwareService } from "./newhardware.service";
import { SoftwareService } from "./software.service";
import { NetworkEquipmentService } from "./network-equipment.service";
import { SupportService } from "./support.service";
import { SimService } from "./sim.service";
import { HardwareTransferService } from "./hardwareTransfer.service";
import { PropertyService } from "./property.service";
import { VehicleService } from "./vehicle.service";
import { EquipmentService } from "./equipment.service";
import { FurnitureService } from "./furniture.service";
import { DocumentService } from "./legal-docs.service";
import { AuditService } from "./audit.service";
import { ISOService } from "./iso.service";
import { BankAccountService } from "./bankAccount.service";
import { ChequeService } from "./cheque.service";
import { TelexTransferService } from "./telex-transfer.service";
import { ForecastService } from "./forecast.service";
import { ErrorHandler } from "../utils/error-handler.util";
import { 
  ITOverviewAnalytics, 
  AssetsOverviewAnalytics, 
  CompanyDocsOverviewAnalytics,
  BankOverviewAnalytics
} from "../interfaces/model.interface";

export class AnalyticsService {

  /**
   * Get IT module overview analytics
   * Returns comprehensive statistics from all IT management modules
   */
  static async getITOverview(): Promise<ITOverviewAnalytics> {
    try {
      // Fetch counts in parallel for all modules
      const [
        hardwareStats,
        softwareStats,
        networkStats,
        supportStats,
        simStats,
        transferStats
      ] = await Promise.all([
        this.getHardwareStats(),
        this.getSoftwareStats(),
        this.getNetworkStats(),
        this.getSupportStats(),
        this.getSimStats(),
        this.getTransferStats()
      ]);

      // Calculate total assets
      const totalAssets = 
        hardwareStats.total +
        softwareStats.total +
        networkStats.total +
        supportStats.total +
        simStats.total +
        transferStats.total;

      return {
        totalAssets,
        modules: {
          hardware: hardwareStats,
          software: softwareStats,
          networkEquipment: networkStats,
          support: supportStats,
          sim: simStats,
          hardwareTransfers: transferStats
        }
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'AnalyticsService', 
        method: 'getITOverview'
      });
    }
  }

  /**
   * Get hardware statistics
   */
  private static async getHardwareStats() {
    return await NewHardwareService.getStats();
  }

  /**
   * Get software statistics
   */
  private static async getSoftwareStats() {
    return await SoftwareService.getStats();
  }

  /**
   * Get network equipment statistics
   */
  private static async getNetworkStats() {
    return await NetworkEquipmentService.getStats();
  }

  /**
   * Get support tickets statistics
   */
  private static async getSupportStats() {
    return await SupportService.getStats();
  }

  /**
   * Get SIM cards statistics
   */
  private static async getSimStats() {
    return await SimService.getStats();
  }

  /**
   * Get hardware transfer statistics
   */
  private static async getTransferStats() {
    return await HardwareTransferService.getStats();
  }

  /**
   * Get Assets module overview analytics
   * Returns comprehensive statistics from all asset management modules
   */
  static async getAssetsOverview(): Promise<AssetsOverviewAnalytics> {
    try {
      // Fetch counts in parallel for all asset modules
      const [
        propertyStats,
        vehicleStats,
        equipmentStats,
        furnitureStats
      ] = await Promise.all([
        this.getPropertyStats(),
        this.getVehicleStats(),
        this.getEquipmentStats(),
        this.getFurnitureStats()
      ]);

      // Calculate total assets
      const totalAssets = 
        propertyStats.total +
        vehicleStats.total +
        equipmentStats.total +
        furnitureStats.total;

      return {
        totalAssets,
        modules: {
          property: propertyStats,
          vehicle: vehicleStats,
          equipment: equipmentStats,
          furniture: furnitureStats
        }
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'AnalyticsService', 
        method: 'getAssetsOverview'
      });
    }
  }

  /**
   * Get property statistics
   */
  private static async getPropertyStats() {
    return await PropertyService.getStats();
  }

  /**
   * Get vehicle statistics
   */
  private static async getVehicleStats() {
    return await VehicleService.getStats();
  }

  /**
   * Get equipment statistics
   */
  private static async getEquipmentStats() {
    return await EquipmentService.getStats();
  }

  /**
   * Get furniture statistics
   */
  private static async getFurnitureStats() {
    return await FurnitureService.getStats();
  }

  /**
   * Get Company Documents module overview analytics
   * Returns comprehensive statistics from all company document modules
   */
  static async getCompanyDocsOverview(): Promise<CompanyDocsOverviewAnalytics> {
    try {
      // Fetch counts in parallel for all document modules
      const [
        legalDocsStats,
        auditStats,
        isoStats
      ] = await Promise.all([
        this.getLegalDocsStats(),
        this.getAuditStats(),
        this.getISOStats()
      ]);

      // Calculate total documents
      const totalDocuments = 
        legalDocsStats.total +
        auditStats.total +
        isoStats.total;

      return {
        totalDocuments,
        modules: {
          legalDocs: legalDocsStats,
          audit: auditStats,
          iso: isoStats
        }
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'AnalyticsService', 
        method: 'getCompanyDocsOverview'
      });
    }
  }

  /**
   * Get legal documents statistics
   */
  private static async getLegalDocsStats() {
    return await DocumentService.getStats();
  }

  /**
   * Get audit statistics
   */
  private static async getAuditStats() {
    return await AuditService.getStats();
  }

  /**
   * Get ISO statistics
   */
  private static async getISOStats() {
    return await ISOService.getStats();
  }

  /**
   * Get Bank module overview analytics
   * Returns comprehensive statistics from all bank-related modules
   */
  static async getBankOverview(): Promise<BankOverviewAnalytics> {
    try {
      // Fetch counts in parallel for all bank modules
      const [
        bankAccountStats,
        chequeStats,
        telexTransferStats,
        forecastStats
      ] = await Promise.all([
        this.getBankAccountStats(),
        this.getChequeStats(),
        this.getTelexTransferStats(),
        this.getForecastStats()
      ]);

      // Calculate total records
      const totalRecords = 
        bankAccountStats.total +
        chequeStats.total +
        telexTransferStats.total +
        forecastStats.total;

      return {
        totalRecords,
        modules: {
          bankAccounts: bankAccountStats,
          cheques: chequeStats,
          telexTransfers: telexTransferStats,
          forecasts: forecastStats
        }
      };
    } catch (error) {
      ErrorHandler.handleServiceError(error, { 
        serviceName: 'AnalyticsService', 
        method: 'getBankOverview'
      });
    }
  }

  /**
   * Get bank account statistics
   */
  private static async getBankAccountStats() {
    return await BankAccountService.getStats();
  }

  /**
   * Get cheque statistics
   */
  private static async getChequeStats() {
    return await ChequeService.getStats();
  }

  /**
   * Get telex transfer statistics
   */
  private static async getTelexTransferStats() {
    return await TelexTransferService.getStats();
  }

  /**
   * Get forecast statistics
   */
  private static async getForecastStats() {
    return await ForecastService.getStats();
  }
}
