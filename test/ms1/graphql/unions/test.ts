import { QLUnionPrototype, QLUnion } from '../../../../src';
import { Test, Test2 } from '../objects';

export interface TestU extends Test, Test2 {}

@QLUnion({
  name: 'TestUnion',
  types: ['Test', 'Test2'],
})
export class TestUnion implements QLUnionPrototype {
  name: string;
  types: string[];
}
