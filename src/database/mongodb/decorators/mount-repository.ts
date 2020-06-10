export function MountMongoDBRepository(repositoryClass: any) {
  return (target: any, name: string | symbol) => {
    target[name] = new repositoryClass();
  };
}
