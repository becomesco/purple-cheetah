export function MountFSDBRepository(repositoryClass: any) {
  return (target: any, name: string | symbol) => {
    target[name] = new repositoryClass();
  };
}
