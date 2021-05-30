import type {
  MongoDBEntity,
  MongoDBRepository,
  MongoDBRepositoryConfig,
} from '../../../types';
import { useLogger } from '../../../util';
import { Model, model } from 'mongoose';

export function createMongoDBRepository<Entity extends MongoDBEntity, Methods>({
  name,
  collection,
  schema,
  methods,
}: MongoDBRepositoryConfig<Entity, Methods>) {
  const logger = useLogger({ name });

  function throwError(place: string, message: unknown) {
    logger.error(place, message);
    return Error(message as string);
  }

  const intf: Model<Entity> = model(collection, schema);
  const self: MongoDBRepository<Entity, Methods> = {
    methods: undefined as never,
    async findBy(query) {
      return intf.findOne(query);
    },
  };
  if (methods) {
    self.methods = methods({
      name,
      collection,
      schema,
      repo: self,
      logger,
    });
  }
  return self;
}
