import { plainToInstance } from 'class-transformer';

/**
 * Helper function to create a deep copy and ensure ObjectIds are consistently converted to strings
 */
function ensureObjectIdToString(obj: any): any {
  if (obj && typeof obj === 'object') {
    // Use JSON parse/stringify for deep cloning to avoid immutable object issues
    const copy = JSON.parse(JSON.stringify(obj));

    if (copy._id && typeof copy._id === 'object' && copy._id.buffer) {
      copy._id = copy._id.toString();
    }

    // Recursively process nested objects and arrays
    for (const key in copy) {
      if (copy[key] && typeof copy[key] === 'object') {
        if (Array.isArray(copy[key])) {
          copy[key] = copy[key].map((item: any) => ensureObjectIdToString(item));
        } else {
          copy[key] = ensureObjectIdToString(copy[key]);
        }
      }
    }

    return copy;
  }
  return obj;
}

/**
 * Transform a single entity to DTO
 * @param dtoClass - The DTO class to transform to
 * @param entity - The entity to transform
 * @returns Transformed DTO instance
 */
export function toDto<T, V>(dtoClass: new (...args: any[]) => T, entity: V): T {
  // Ensure ObjectIds are converted to strings before DTO transformation
  const processedEntity = ensureObjectIdToString(entity);

  return plainToInstance(dtoClass, processedEntity, {
    excludeExtraneousValues: true, // Only include @Expose fields
    enableImplicitConversion: true,
  });
}

/**
 * Transform an array of entities to DTOs
 * @param dtoClass - The DTO class to transform to
 * @param entities - The array of entities to transform
 * @returns Array of transformed DTO instances
 */
export function toDtoList<T, V>(dtoClass: new (...args: any[]) => T, entities: V[]): T[] {
  return entities.map(entity => toDto(dtoClass, entity));
}
