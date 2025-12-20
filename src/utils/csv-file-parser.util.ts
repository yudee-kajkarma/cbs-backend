/**
 * Generic CSV File Parser Service
 * Provides reusable parsing and validation for CSV file uploads
 */

import { parse } from 'csv-parse/sync';

export interface CsvParseResult<T = any> {
  json: T[];
  errors: CsvParseError[];
  warnings: CsvParseWarning[];
}

export interface CsvParseError {
  type: 'column' | 'row';
  rowIndex?: number;
  message: string;
  errorFields?: string[];
  expected?: string[];
}

export interface CsvParseWarning {
  rowIndex: number;
  message: string;
}

export interface ParsedCsvResponse<T = any> {
  valid: boolean;
  data: T[];
  errors: CsvParseError[];
  warnings: CsvParseWarning[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    hasColumnErrors: boolean;
  };
}

/**
 * Generic CSV parser configuration
 */
export interface CsvParserConfig<T = any> {
  columnMap: Record<string, string>;
  requiredFields: string[];
  rowValidator: (row: Record<string, any>) => { data?: T; errorFields?: string[] };
}

/**
 * Parse and validate CSV file content with custom validation logic
 * This is a generic utility that can be used across different modules
 * 
 * @param csvContent - The CSV file content as string
 * @param config - Parser configuration with column mapping and validation logic
 * @returns Parsed result with valid data, errors, and warnings
 */
export async function parseAndValidateCsv<T = any>(
  csvContent: string,
  config: CsvParserConfig<T>
): Promise<ParsedCsvResponse<T>> {
  try {
    const { columnMap, requiredFields, rowValidator } = config;

    // Parse CSV content
    const records: Record<string, string>[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Check if CSV has any data
    if (!records || records.length === 0) {
      return {
        valid: false,
        data: [],
        errors: [{
          type: 'column',
          message: 'CSV file is empty',
          expected: Object.keys(columnMap),
        }],
        warnings: [],
        summary: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          hasColumnErrors: true,
        },
      };
    }

    // Check for missing required columns
    const csvColumns = Object.keys(records[0] || {});
    const missingColumns = checkMissingRequiredColumns(csvColumns, columnMap, requiredFields);
    
    if (missingColumns.length > 0) {
      const requiredColumnNames = Object.entries(columnMap)
        .filter(([_, modelField]) => requiredFields.includes(modelField))
        .map(([colName]) => colName);
      
      return {
        valid: false,
        data: [],
        errors: [{
          type: 'column',
          message: `CSV is missing required columns: [${missingColumns.join(', ')}]`,
          expected: requiredColumnNames,
        }],
        warnings: [],
        summary: {
          totalRows: records.length,
          validRows: 0,
          invalidRows: records.length,
          hasColumnErrors: true,
        },
      };
    }

    // Process each row with custom validator
    const errors: CsvParseError[] = [];
    const json: T[] = [];
    const warnings: CsvParseWarning[] = [];

    records.forEach((row, index) => {
      const result = rowValidator(row);
      
      if (result.errorFields && result.errorFields.length > 0) {
        errors.push({
          type: 'row',
          rowIndex: index + 2, // +2 because CSV is 1-indexed and has header
          message: `Row ${index + 2} has validation errors`,
          errorFields: result.errorFields,
        });
      } else if (result.data) {
        json.push(result.data);
      }
    });

    return {
      valid: errors.length === 0,
      data: json,
      errors,
      warnings,
      summary: {
        totalRows: records.length,
        validRows: json.length,
        invalidRows: errors.filter(e => e.type === 'row').length,
        hasColumnErrors: errors.some(e => e.type === 'column'),
      },
    };
  } catch (error: any) {
    return {
      valid: false,
      data: [],
      errors: [{
        type: 'column',
        message: `Failed to parse CSV: ${error.message}`,
      }],
      warnings: [],
      summary: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        hasColumnErrors: true,
      },
    };
  }
}

/**
 * Check for missing required columns
 */
function checkMissingRequiredColumns(
  csvColumns: string[],
  columnMap: Record<string, string>,
  requiredFields: string[]
): string[] {
  const requiredColumnNames = Object.entries(columnMap)
    .filter(([_, modelField]) => requiredFields.includes(modelField))
    .map(([colName]) => colName);
  
  return requiredColumnNames.filter(col => !csvColumns.includes(col));
}

/**
 * Normalize enum value using case-insensitive matching
 * Helper function for validators
 */
export function normalizeEnumValue(value: string, validValues: string[]): string | undefined {
  if (!value || value === '') return undefined;
  
  const normalized = value.trim();
  return validValues.find(v => v.toLowerCase() === normalized.toLowerCase());
}
