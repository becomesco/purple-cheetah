export interface MiracleRegistryInstance {
  origin: string;
  available: boolean;
  ssl: boolean;
  stats: {
    lastCheck: number;
    cpu: number;
    ram: number;
  };
}

export interface MiracleRegistry {
  name: string;
  instances: MiracleRegistryInstance[];
  heartbeat: string;
}

export interface MiracleRegistryExtended {
  name: string;
  instancePointer: number;
  instances: MiracleRegistryInstance[];
  heartbeat: string;
}
