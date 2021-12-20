import {
  ObjectUtilityError as OUError,
  ObjecUtilityErrorCode as OUErrorCode,
  ObjectSchema as OS,
  ObjectPropSchema as OPS,
  ObjectPropSchemaArrayChild as OPSAC,
  ObjectPropSchemaValidateType as OPSVT,
} from '@banez/object-utility/types';
import type { ObjectUtility as OU } from '@banez/object-utility';

export const ObjectUtilityError = OUError;
export type ObjectUtilityErrorCode = OUErrorCode;
export type ObjectSchema = OS;
export type ObjectPropSchema = OPS;
export type ObjectPropSchemaArrayChild = OPSAC;
export type ObjectPropSchemaValidateType = OPSVT;
export type ObjectUtility = typeof OU;
