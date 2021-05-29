import { expect } from 'chai';
import { ObjectSchema, ObjectUtilityError } from '../../src/types';
import { useObjectUtility } from '../../src';

const objectUtil = useObjectUtility();

describe('Object Utility', () => {
  describe('type string', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'string',
        __required: true,
      },
      notRequired: {
        __type: 'string',
        __required: false,
      },
    };
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: '',
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: '',
          notRequired: '',
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should fail with error e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          notRequired: '',
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: 0,
          notRequired: '',
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: '',
          notRequired: 0,
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
  });
  describe('type number', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'number',
        __required: true,
      },
      notRequired: {
        __type: 'number',
        __required: false,
      },
    };
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: 0,
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: 0,
          notRequired: 0,
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should fail with error e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          notRequired: 0,
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: '',
          notRequired: 0,
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: 0,
          notRequired: '',
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
  });
  describe('type boolean', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'boolean',
        __required: true,
      },
      notRequired: {
        __type: 'boolean',
        __required: false,
      },
    };
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: true,
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: true,
          notRequired: false,
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should fail with error e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          notRequired: false,
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: '',
          notRequired: false,
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: true,
          notRequired: '',
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
  });
  describe('type function', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'function',
        __required: true,
      },
      notRequired: {
        __type: 'function',
        __required: false,
      },
    };
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: () => {
            return '';
          },
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: () => {
            return '';
          },
          notRequired: () => {
            return '';
          },
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should fail with error e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          notRequired: () => {
            return '';
          },
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: '',
          notRequired: () => {
            return '';
          },
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
    it('should fail with error e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: () => {
            return '';
          },
          notRequired: '',
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
  });
  describe('type object', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'object',
        __required: true,
        __child: {
          required: {
            __type: 'string',
            __required: true,
          },
          notRequired: {
            __type: 'string',
            __required: false,
          },
        },
      },
      notRequired: {
        __type: 'object',
        __required: false,
        __child: {
          required: {
            __type: 'string',
            __required: true,
          },
          notRequired: {
            __type: 'string',
            __required: false,
          },
        },
      },
    };
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            required: '',
          },
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            required: '',
            notRequired: '',
          },
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            required: '',
            notRequired: '',
          },
          notRequired: {
            required: '',
          },
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            required: '',
            notRequired: '',
          },
          notRequired: {
            required: '',
            notRequired: '',
          },
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with error code e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            notRequired: '',
          },
          notRequired: {
            required: '',
            notRequired: '',
          },
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should pass with error code e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          // required: {
          //   required: '',
          //   notRequired: '',
          // },
          notRequired: {
            required: '',
            notRequired: '',
          },
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should pass with error code e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            required: '',
            notRequired: '',
          },
          notRequired: {
            notRequired: '',
          },
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
    it('should pass with error code e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: {
            required: '',
            notRequired: 0,
          },
          notRequired: {
            required: '',
            notRequired: '',
          },
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
  });
  describe('type array', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'array',
        __required: true,
        __child: {
          __type: 'object',
          __content: {
            required: {
              __type: 'string',
              __required: true,
            },
            notRequired: {
              __type: 'string',
              __required: false,
            },
          },
        },
      },
      notRequired: {
        __type: 'array',
        __required: false,
        __child: {
          __type: 'object',
          __content: {
            required: {
              __type: 'string',
              __required: true,
            },
            notRequired: {
              __type: 'string',
              __required: false,
            },
          },
        },
      },
    };
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [],
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [
            {
              required: '',
            },
          ],
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [
            {
              required: '',
            },
          ],
          notRequired: [],
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should pass with no errors', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [
            {
              required: '',
              notRequired: '',
            },
          ],
          notRequired: [
            {
              required: '',
              notRequired: '',
            },
          ],
        },
        schema,
      );
      if (result instanceof ObjectUtilityError) {
        throw Error(result.message);
      }
    });
    it('should fail with error code e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [
            {
              required: '',
              notRequired: 0,
            },
          ],
          notRequired: [
            {
              required: '',
              notRequired: '',
            },
          ],
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
    it('should fail with error code e8', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [
            {
              required: '',
              notRequired: '',
            },
          ],
          notRequired: [
            {
              required: 0,
              notRequired: '',
            },
          ],
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e8');
    });
    it('should fail with error code e3', () => {
      const result = objectUtil.compareWithSchema(
        {
          required: [
            {
              required: '',
              notRequired: '',
            },
            0,
          ],
          notRequired: [
            {
              required: '',
              notRequired: '',
            },
          ],
        },
        schema,
      );
      expect(result).to.have.property('errorCode', 'e3');
    });
  });
});
