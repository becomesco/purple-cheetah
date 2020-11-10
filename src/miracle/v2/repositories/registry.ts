import Axios from 'axios';
import { ObjectUtility } from '../../../util';
import {
  MiracleV2Registry,
  MiracleV2RegistryInstance,
  MiracleV2ServiceHeartbeatResponseSchema,
} from '../types';

export class MiracleV2RegistryRepository {
  private static registries: MiracleV2Registry[] = [];

  static init() {
    setInterval(() => {
      MiracleV2RegistryRepository.interval().catch((error) => {
        console.error(error);
      });
    }, 5000);
  }

  static async interval() {
    const removeRegistries: string[] = [];
    for (let i = 0; i < this.registries.length; i = i + 1) {
      const registry = this.registries[i];
      const removeInstances: string[] = [];
      for (let j = 0; j < registry.instances.length; j = j + 1) {
        const instance = registry.instances[j];
        try {
          const response = await Axios({
            url: `${instance.origin}/miracle/heartbeat`,
            method: 'GET',
          });
          ObjectUtility.compareWithSchema(
            response.data,
            MiracleV2ServiceHeartbeatResponseSchema,
          );
          this.registries[i].instances[j].stats = {
            cpu: response.data.cpu,
            ram: response.data.ram,
            lastCheck: Date.now(),
          };
        } catch (e) {
          removeInstances.push(instance.id);
        }
      }
      if (removeInstances.length > 0) {
        this.registries[i].instances = this.registries[i].instances.filter(
          (instance) => !removeInstances.includes(instance.id),
        );
      }
      if (this.registries[i].instances.length === 0) {
        removeRegistries.push(this.registries[i].name);
      }
    }
    this.registries = this.registries.filter(
      (registry) => !removeRegistries.includes(registry.name),
    );
  }

  static findAll(): MiracleV2Registry[] {
    return JSON.parse(JSON.stringify(this.registries));
  }

  static findByName(name: string): MiracleV2Registry {
    return this.registries.find((registry) => registry.name === name);
  }

  static findNextInstance(name: string): MiracleV2RegistryInstance {
    for (const i in this.registries) {
      if (this.registries[i].name === name) {
        this.registries[i].instancePointer =
          (this.registries[i].instancePointer + 1) %
          this.registries[i].instances.length;
        return this.registries[i].instances[this.registries[i].instancePointer];
      }
    }
  }

  static findById(id: string): MiracleV2Registry {
    return this.registries.find((registry) =>
      registry.instances.find((instance) => instance.id === id),
    );
  }

  static add(name: string, instance: MiracleV2RegistryInstance) {
    for (const i in this.registries) {
      if (this.registries[i].name === name) {
        for (const j in this.registries[i].instances) {
          if (this.registries[i].instances[j].id === instance.id) {
            return;
          }
        }
        this.registries[i].instances.push(instance);
        return;
      }
    }
    this.registries.push({
      name,
      instancePointer: 0,
      instances: [instance],
    });
  }

  static clear() {
    this.registries = [];
  }
}
