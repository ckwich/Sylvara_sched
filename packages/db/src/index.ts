import { Prisma, PrismaClient, ResourceType } from '@prisma/client';

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
