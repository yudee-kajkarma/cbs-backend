

import { ForecastType, ForecastStatus, ForecastCategory } from '../constants/forecast.constants';
import { parseAndValidateCsv, normalizeEnumValue, ParsedCsvResponse } from './csv-file-parser.util';

export interface CsvParseResult {
  json: any[];
  errors: any[];
  warnings: any[];
}

/**
 * Required CSV columns mapping
 * Maps CSV column names to model field names
 */
const COLUMN_MAP: Record<string, string> = {
  'Date': 'date',
  'Type': 'type',
  'Category': 'category',
  'Description': 'description',
  'Amount': 'amount',
  'Currency': 'currency',
  'Bank Account': 'bankAccount',
  'Status': 'status',
};

/**
 * Required fields that must be present in CSV
 */
const REQUIRED_FIELDS = ['date', 'type', 'category', 'description', 'amount', 'bankAccount'];

/**
 * Convert CSV row to forecast data
 */
function convertRowToForecast(
  row: Record<string, string>
): { data?: any; errorFields?: string[] } {
  const forecast: any = {};
  const errorFields: string[] = [];

  // Process Date
  const dateStr = row['Date']?.trim();
  if (!dateStr) {
    errorFields.push('Date is required');
  } else {
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      errorFields.push(`Date has invalid format: '${dateStr}'`);
    } else {
      forecast.date = parsedDate;
    }
  }

  // Process Type
  const typeValue = row['Type']?.trim();
  if (!typeValue) {
    errorFields.push('Type is required');
  } else {
    const normalizedType = normalizeEnumValue(typeValue, Object.values(ForecastType));
    if (!normalizedType) {
      errorFields.push(`Type has invalid value: '${typeValue}', expected one of: [${Object.values(ForecastType).join(', ')}]`);
    } else {
      forecast.type = normalizedType;
    }
  }

  // Process Category
  const categoryValue = row['Category']?.trim();
  if (!categoryValue) {
    errorFields.push('Category is required');
  } else {
    const normalizedCategory = normalizeEnumValue(categoryValue, Object.values(ForecastCategory));
    if (!normalizedCategory) {
      errorFields.push(`Category has invalid value: '${categoryValue}', expected one of: [${Object.values(ForecastCategory).join(', ')}]`);
    } else {
      forecast.category = normalizedCategory;
    }
  }

  // Process Description
  const description = row['Description']?.trim();
  if (!description) {
    errorFields.push('Description is required');
  } else if (description.length > 500) {
    errorFields.push('Description cannot exceed 500 characters');
  } else {
    forecast.description = description;
  }

  // Process Amount
  const amountStr = row['Amount']?.trim();
  if (!amountStr) {
    errorFields.push('Amount is required');
  } else {
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (isNaN(amount)) {
      errorFields.push(`Amount has invalid value: '${amountStr}'`);
    } else if (amount <= 0) {
      errorFields.push('Amount must be greater than 0');
    } else {
      forecast.amount = amount;
    }
  }

  // Process Currency (optional, defaults to KWD)
  const currency = row['Currency']?.trim();
  if (currency) {
    if (currency.length !== 3) {
      errorFields.push(`Currency must be a 3-letter ISO code: '${currency}'`);
    } else {
      forecast.currency = currency.toUpperCase();
    }
  } else {
    forecast.currency = 'KWD';
  }

  // Process Bank Account
  const bankAccount = row['Bank Account']?.trim();
  if (!bankAccount) {
    errorFields.push('Bank Account is required');
  } else if (bankAccount.length > 200) {
    errorFields.push('Bank Account cannot exceed 200 characters');
  } else {
    forecast.bankAccount = bankAccount;
  }

  // Process Status (optional, defaults to PLANNED)
  const statusValue = row['Status']?.trim();
  if (statusValue) {
    const normalizedStatus = normalizeEnumValue(statusValue, Object.values(ForecastStatus));
    if (!normalizedStatus) {
      errorFields.push(`Status has invalid value: '${statusValue}', expected one of: [${Object.values(ForecastStatus).join(', ')}]`);
    } else {
      forecast.status = normalizedStatus;
    }
  } else {
    forecast.status = ForecastStatus.PLANNED;
  }

  return errorFields.length > 0 ? { errorFields } : { data: forecast };
}

/**
 * Parse CSV file content and validate for Forecast module
 * Uses generic CSV parser with forecast-specific validation
 */
export async function parseForecastCsv(csvContent: string): Promise<CsvParseResult> {
  const result = await parseAndValidateCsv(csvContent, {
    columnMap: COLUMN_MAP,
    requiredFields: REQUIRED_FIELDS,
    rowValidator: convertRowToForecast,
  });

  return {
    json: result.data,
    errors: result.errors,
    warnings: result.warnings,
  };
}
