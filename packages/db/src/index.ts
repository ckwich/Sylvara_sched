import { Prisma, PrismaClient, ResourceType } from '@prisma/client';
import {
  formatMinuteToHHMM,
  minuteFieldUpdate as sharedMinuteFieldUpdate,
  parseHHMMToMinute,
  resolveAnchorMinute as sharedResolveAnchorMinute,
} from '@sylvara/shared';

export const prisma = new PrismaClient();

export function validateResourceInventoryQuantity(input: {
  resourceType: ResourceType;
  inventoryQuantity: number;
}) {
  if (input.resourceType === ResourceType.PERSON && input.inventoryQuantity !== 1) {
    throw new Prisma.PrismaClientValidationError(
      'PERSON resources must use inventory_quantity=1.',
    );
  }
}

export function resolveAnchorMinute(input: {
  minute?: number | null;
  legacyTime?: Date | null;
}): number | null {
  return sharedResolveAnchorMinute(input);
}

export function minuteFromHHMM(value: string): number {
  return parseHHMMToMinute(value);
}

export function minuteToHHMM(value: number): string {
  return formatMinuteToHHMM(value);
}

export function minuteFieldUpdate(input: {
  minute?: number | null;
  hhmm?: string | null;
}) {
  return sharedMinuteFieldUpdate(input);
}
