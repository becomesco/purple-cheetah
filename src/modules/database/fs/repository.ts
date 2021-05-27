import { v4 as uuidv4 } from 'uuid';
import type {
  FSDBEntity,
  FSDBRepository,
  FSDBRepositoryConfig,
} from '../../../types';
import { useLogger, useObjectUtility } from '../../../util';
import { useFSDB } from './main';

const objectUtility = useObjectUtility();

export function createFSDBRepository<T extends FSDBEntity>({
  name,
  collection,
  schema,
}: FSDBRepositoryConfig): FSDBRepository<T> {
  const logger = useLogger({ name });
  const fsdb = useFSDB().register<T>(collection);

  function checkSchema(entity: T) {
    const result = objectUtility.compareWithSchema(entity, schema, 'entity');
    if (!result.ok) {
      throw new Error(`Invalid Entity schema: ${result.error}`);
    }
  }
  function throwError(place: string, message: unknown) {
    logger.error(place, message);
    return Error(message as string);
  }

  const self: FSDBRepository<T> = {
    async findBy(query) {
      const entries: T[] = JSON.parse(JSON.stringify(fsdb.get()));
      for (const id in entries) {
        if (query(entries[id])) {
          return entries[id];
        }
      }
      return null;
    },
    async findAllBy(query) {
      const entries: T[] = JSON.parse(JSON.stringify(fsdb.get()));
      const output: T[] = [];
      for (const id in entries) {
        if (query(entries[id])) {
          output.push(entries[id]);
        }
      }
      return output;
    },
    async findAll() {
      return JSON.parse(JSON.stringify(fsdb.get()));
    },
    async findById(id) {
      return self.findBy((e) => e._id === id);
    },
    async findAllById(ids) {
      return self.findAllBy((e) => ids.includes(e._id));
    },
    async add(entity) {
      if (!entity._id) {
        entity._id = uuidv4();
      } else {
        if (await self.findById(entity._id)) {
          throwError(
            'add',
            `Entity with ID "${entity._id}" already exist. ` +
              `Please use "update" method.`,
          );
        }
      }
      entity.createdAt = Date.now();
      entity.updatedAt = Date.now();
      try {
        checkSchema(entity);
      } catch (e) {
        logger.error('add', e);
        throw e;
      }
      fsdb.set(entity);
      return entity;
    },
    async addMany(entities) {
      const output: T[] = [];
      for (let i = 0; i < entities.length; i++) {
        output.push(await self.add(entities[i]));
      }
      return output;
    },
    async update(entity) {
      const targetEntity = await self.findById(entity._id);
      if (!targetEntity) {
        throwError(
          'update',
          `Entity with ID "${entity._id}" does not exist. ` +
            `Please use "add" method.`,
        );
      }
      entity.createdAt = targetEntity._id;
      entity.updatedAt = Date.now();
    },
    async updateMany(query, update) {},
    async deleteById(id: string) {},
    async deleteOne(query) {},
    async deleteMany(query) {},
    async count() {},
  };
  return self;
}
