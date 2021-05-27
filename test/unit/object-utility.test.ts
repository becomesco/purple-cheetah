import { expect } from 'chai';
import type { ObjectSchema } from '../../src/types';
import { useObjectUtility } from '../../src';

const objectUtil = useObjectUtility();

describe('Object Utility', () => {
  it('should check string type', () => {
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

    const t1 = objectUtil.compareWithSchema(
      {
        required: '',
      },
      schema,
    );
    const t2 = objectUtil.compareWithSchema(
      {
        required: '',
        notRequired: '',
      },
      schema,
    );
    const t3 = objectUtil.compareWithSchema(
      {
        notRequired: '',
      },
      schema,
    );
    const t4 = objectUtil.compareWithSchema(
      {
        required: 1,
        notRequired: '',
      },
      schema,
    );
    const t5 = objectUtil.compareWithSchema(
      {
        required: '',
        notRequired: 1,
      },
      schema,
    );
    expect(t1.ok).to.eq(true, `t1 fail ---> ${t1.error}`);
    expect(t2.ok).to.eq(true, `t2 fail ---> ${t2.error}`);
    expect(t3.ok).to.eq(false, `t3 fail ---> ${t3.error}`);
    expect(t4.ok).to.eq(false, `t4 fail ---> ${t4.error}`);
    expect(t5.ok).to.eq(false, `t5 fail ---> ${t5.error}`);
  });
  it('should check number type', () => {
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

    const t1 = objectUtil.compareWithSchema(
      {
        required: 0,
      },
      schema,
    );
    const t2 = objectUtil.compareWithSchema(
      {
        required: 0,
        notRequired: 0,
      },
      schema,
    );
    const t3 = objectUtil.compareWithSchema(
      {
        notRequired: 0,
      },
      schema,
    );
    const t4 = objectUtil.compareWithSchema(
      {
        required: '',
        notRequired: 0,
      },
      schema,
    );
    const t5 = objectUtil.compareWithSchema(
      {
        required: 0,
        notRequired: '',
      },
      schema,
    );
    expect(t1.ok).to.eq(true, `t1 fail ---> ${t1.error}`);
    expect(t2.ok).to.eq(true, `t2 fail ---> ${t2.error}`);
    expect(t3.ok).to.eq(false, `t3 fail ---> ${t3.error}`);
    expect(t4.ok).to.eq(false, `t4 fail ---> ${t4.error}`);
    expect(t5.ok).to.eq(false, `t5 fail ---> ${t5.error}`);
  });
  it('should check boolean type', () => {
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

    const t1 = objectUtil.compareWithSchema(
      {
        required: false,
      },
      schema,
    );
    const t2 = objectUtil.compareWithSchema(
      {
        required: false,
        notRequired: true,
      },
      schema,
    );
    const t3 = objectUtil.compareWithSchema(
      {
        notRequired: false,
      },
      schema,
    );
    const t4 = objectUtil.compareWithSchema(
      {
        required: '',
        notRequired: false,
      },
      schema,
    );
    const t5 = objectUtil.compareWithSchema(
      {
        required: false,
        notRequired: '',
      },
      schema,
    );
    expect(t1.ok).to.eq(true, `t1 fail ---> ${t1.error}`);
    expect(t2.ok).to.eq(true, `t2 fail ---> ${t2.error}`);
    expect(t3.ok).to.eq(false, `t3 fail ---> ${t3.error}`);
    expect(t4.ok).to.eq(false, `t4 fail ---> ${t4.error}`);
    expect(t5.ok).to.eq(false, `t5 fail ---> ${t5.error}`);
  });
  it('should check function type', () => {
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

    const t1 = objectUtil.compareWithSchema(
      {
        required: () => {
          return '';
        },
      },
      schema,
    );
    const t2 = objectUtil.compareWithSchema(
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
    const t3 = objectUtil.compareWithSchema(
      {
        notRequired: () => {
          return '';
        },
      },
      schema,
    );
    const t4 = objectUtil.compareWithSchema(
      {
        required: '',
        notRequired: () => {
          return '';
        },
      },
      schema,
    );
    const t5 = objectUtil.compareWithSchema(
      {
        required: () => {
          return '';
        },
        notRequired: '',
      },
      schema,
    );
    expect(t1.ok).to.eq(true, `t1 fail ---> ${t1.error}`);
    expect(t2.ok).to.eq(true, `t2 fail ---> ${t2.error}`);
    expect(t3.ok).to.eq(false, `t3 fail ---> ${t3.error}`);
    expect(t4.ok).to.eq(false, `t4 fail ---> ${t4.error}`);
    expect(t5.ok).to.eq(false, `t5 fail ---> ${t5.error}`);
  });
  it('should check object type', () => {
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
            __required: true,
          },
        },
      },
    };

    const t1 = objectUtil.compareWithSchema(
      {
        required: {
          required: '',
        },
      },
      schema,
    );
    const t2 = objectUtil.compareWithSchema(
      {
        required: {
          required: '',
          notRequired: '',
        },
      },
      schema,
    );
    const t3 = objectUtil.compareWithSchema(
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
    const t4 = objectUtil.compareWithSchema(
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
    const t5 = objectUtil.compareWithSchema(
      {
        required: {
          required: '',
          notRequired: '',
        },
        notRequired: {
          required: 0,
          notRequired: '',
        },
      },
      schema,
    );
    const t6 = objectUtil.compareWithSchema(
      {
        notRequired: {
          required: '',
          notRequired: '',
        },
      },
      schema,
    );

    expect(t1.ok).to.eq(true, `t1 fail ---> ${t1.error}`);
    expect(t2.ok).to.eq(true, `t2 fail ---> ${t2.error}`);
    expect(t3.ok).to.eq(true, `t3 fail ---> ${t3.error}`);
    expect(t4.ok).to.eq(false, `t4 fail ---> ${t4.error}`);
    expect(t5.ok).to.eq(false, `t5 fail ---> ${t5.error}`);
    expect(t6.ok).to.eq(false, `t6 fail ---> ${t6.error}`);
  });
  it('should check array type', () => {
    const schema: ObjectSchema = {
      required: {
        __type: 'array',
        __required: true,
        __child: {
          __type: 'string',
        },
      },
      notRequired: {
        __type: 'array',
        __required: false,
        __child: {
          __type: 'string',
        },
      },
    };
    const t1 = objectUtil.compareWithSchema(
      {
        required: ['', '', ''],
      },
      schema,
    );
    const t2 = objectUtil.compareWithSchema(
      {
        required: ['', '', ''],
        notRequired: ['', '', ''],
      },
      schema,
    );
    const t3 = objectUtil.compareWithSchema(
      {
        notRequired: ['', '', ''],
      },
      schema,
    );
    const t4 = objectUtil.compareWithSchema(
      {
        required: 0,
        notRequired: ['', '', ''],
      },
      schema,
    );
    const t5 = objectUtil.compareWithSchema(
      {
        required: ['', '', ''],
        notRequired: 0,
      },
      schema,
    );
    const t6 = objectUtil.compareWithSchema(
      {
        required: ['', 0, ''],
        notRequired: ['', '', ''],
      },
      schema,
    );
    const t7 = objectUtil.compareWithSchema(
      {
        required: ['', '', ''],
        notRequired: ['', 0, ''],
      },
      schema,
    );

    expect(t1.ok).to.eq(true, `t1 fail ---> ${t1.error}`);
    expect(t2.ok).to.eq(true, `t2 fail ---> ${t2.error}`);
    expect(t3.ok).to.eq(false, `t3 fail ---> ${t3.error}`);
    expect(t4.ok).to.eq(false, `t4 fail ---> ${t4.error}`);
    expect(t5.ok).to.eq(false, `t5 fail ---> ${t5.error}`);
    expect(t6.ok).to.eq(false, `t6 fail ---> ${t6.error}`);
    expect(t7.ok).to.eq(false, `t7 fail ---> ${t7.error}`);
  });
});
