import { Expose, Type } from 'class-transformer';

// ============================================================================
// IT MODULE DTOs
// ============================================================================

export class NewHardwareStatsDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  inactive!: number;
}

export class SoftwareStatsDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  expired!: number;
}

export class NetworkEquipmentStatsDto {
  @Expose()
  total!: number;

  @Expose()
  online!: number;

  @Expose()
  offline!: number;

  @Expose()
  maintenance!: number;
}

export class SupportStatsDto {
  @Expose()
  total!: number;

  @Expose()
  open!: number;

  @Expose()
  inProgress!: number;

  @Expose()
  resolved!: number;
}

export class SimStatsDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  inactive!: number;
}

export class HardwareTransferStatsDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  completed!: number;
}

export class ITModulesDto {
  @Expose()
  @Type(() => NewHardwareStatsDto)
  newHardware!: NewHardwareStatsDto;

  @Expose()
  @Type(() => SoftwareStatsDto)
  software!: SoftwareStatsDto;

  @Expose()
  @Type(() => NetworkEquipmentStatsDto)
  networkEquipment!: NetworkEquipmentStatsDto;

  @Expose()
  @Type(() => SupportStatsDto)
  support!: SupportStatsDto;

  @Expose()
  @Type(() => SimStatsDto)
  sim!: SimStatsDto;

  @Expose()
  @Type(() => HardwareTransferStatsDto)
  hardwareTransfer!: HardwareTransferStatsDto;
}

export class ITOverviewResponseDto {
  @Expose()
  totalAssets!: number;

  @Expose()
  @Type(() => ITModulesDto)
  modules!: ITModulesDto;
}

// ============================================================================
// ASSETS MODULE DTOs
// ============================================================================

export class AssetModuleStatsDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  inactive!: number;
}

export class AssetModulesDto {
  @Expose()
  @Type(() => AssetModuleStatsDto)
  property!: AssetModuleStatsDto;

  @Expose()
  @Type(() => AssetModuleStatsDto)
  vehicle!: AssetModuleStatsDto;

  @Expose()
  @Type(() => AssetModuleStatsDto)
  equipment!: AssetModuleStatsDto;

  @Expose()
  @Type(() => AssetModuleStatsDto)
  furniture!: AssetModuleStatsDto;
}

export class AssetsOverviewResponseDto {
  @Expose()
  totalAssets!: number;

  @Expose()
  @Type(() => AssetModulesDto)
  modules!: AssetModulesDto;
}

// ============================================================================
// COMPANY DOCUMENTS MODULE DTOs
// ============================================================================

export class CompanyDocModuleStatsDto {
  @Expose()
  total!: number;
}

export class CompanyDocModulesDto {
  @Expose()
  @Type(() => CompanyDocModuleStatsDto)
  legalDocs!: CompanyDocModuleStatsDto;

  @Expose()
  @Type(() => CompanyDocModuleStatsDto)
  audit!: CompanyDocModuleStatsDto;

  @Expose()
  @Type(() => CompanyDocModuleStatsDto)
  iso!: CompanyDocModuleStatsDto;
}

export class CompanyDocsOverviewResponseDto {
  @Expose()
  totalDocuments!: number;

  @Expose()
  @Type(() => CompanyDocModulesDto)
  modules!: CompanyDocModulesDto;
}

// ============================================================================
// BANK MODULE DTOs
// ============================================================================

export class BankAccountStatsDto {
  @Expose()
  total!: number;

  @Expose()
  active!: number;

  @Expose()
  inactive!: number;
}

export class ChequeStatsDto {
  @Expose()
  total!: number;

  @Expose()
  printed!: number;

  @Expose()
  cleared!: number;

  @Expose()
  pending!: number;
}

export class TelexTransferStatsDto {
  @Expose()
  total!: number;

  @Expose()
  completed!: number;

  @Expose()
  pending!: number;

  @Expose()
  draft!: number;
}

export class ForecastStatsDto {
  @Expose()
  total!: number;

  @Expose()
  income!: number;

  @Expose()
  expense!: number;

  @Expose()
  planned!: number;

  @Expose()
  completed!: number;
}

export class BankModulesDto {
  @Expose()
  @Type(() => BankAccountStatsDto)
  bankAccounts!: BankAccountStatsDto;

  @Expose()
  @Type(() => ChequeStatsDto)
  cheques!: ChequeStatsDto;

  @Expose()
  @Type(() => TelexTransferStatsDto)
  telexTransfers!: TelexTransferStatsDto;

  @Expose()
  @Type(() => ForecastStatsDto)
  forecasts!: ForecastStatsDto;
}

export class BankOverviewResponseDto {
  @Expose()
  totalRecords!: number;

  @Expose()
  @Type(() => BankModulesDto)
  modules!: BankModulesDto;
}
