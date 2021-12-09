import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { Type, Types, Variable } from '../compiler/vm/data';
import { ContractsVars, ContractsVarsSimulation } from '../models';
import { ContractsVarsRepository, ContractsVarsSimulationRepository } from '../repositories';

@injectable({ scope: BindingScope.TRANSIENT })
export class ContractsVarsProvider {

  constructor(
    @repository(ContractsVarsRepository) private contractsVarsRepository: ContractsVarsRepository,
    @repository(ContractsVarsSimulationRepository) private contractsVarsSimulationRepository: ContractsVarsSimulationRepository,
  ) { }

  consolideVars = async (simulateId: string) => {
    const rows = await this.contractsVarsSimulationRepository.find({
      where: {
        simulateId
      }
    });
    for await (const simRow of rows) {
      const row = await this.contractsVarsRepository.findOne({
        where: {
          address: simRow.address,
          registerId: simRow.registerId,
          key: simRow.key
        }
      });
      if (simRow.del) {
        if (row) {
          await this.contractsVarsRepository.delete(row);
        }
      } else {
        if (row) {
          row.value = simRow.value;
          row.type = simRow.type;
          await this.contractsVarsRepository.update(row);
        } else {
          await this.contractsVarsRepository.create(new ContractsVars({
            address: simRow.address,
            registerId: simRow.registerId,
            key: simRow.key,
            value: simRow.value,
            type: simRow.type,
          }));
        }
      }
    }
  }

  getMap = async (simulateId: string, address: string, registerId: string, key: string): Promise<Variable | null> => {
    const simRow = await this.contractsVarsSimulationRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
        key
      }
    });
    if (simRow) {
      if (simRow.del) {
        return null;
      } else {
        let type = Types.getType(simRow.type);
        if (!type) throw new Error(`invalid contractsSimulateVars type "${simRow.type}" at ${simRow.id}`);
        return new Variable(type, simRow.value);
      }
    } else {
      const row = await this.contractsVarsRepository.findOne({
        where: {
          address,
          registerId,
          key
        }
      });
      if (row) {
        let type = Types.getType(row.type);
        if (!type) throw new Error(`invalid contractsVars type "${row.type}" at ${row.id}`);
        return new Variable(type, row.value);
      } else {
        return null;
      }
    }
  }

  setMap = async (simulateId: string, address: string, registerId: string, key: string, value: string, type: Type) => {
    const simRow = await this.contractsVarsSimulationRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
        key
      }
    });
    if (simRow) {
      simRow.value = value;
      simRow.type = type.name;
      simRow.del = false;
      await this.contractsVarsSimulationRepository.update(simRow);
    } else {
      let newRow = new ContractsVarsSimulation({
        simulateId,
        address,
        registerId,
        key: key,
        value: value,
        type: type.name,
        del: false,
      });
      await this.contractsVarsSimulationRepository.create(newRow);
    }
  }

  delMap = async (simulateId: string, address: string, registerId: string, key: string) => {
    const simRow = await this.contractsVarsSimulationRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
        key
      }
    });
    if (simRow) {
      simRow.del = true;
      simRow.value = '';
      simRow.type = '';
      await this.contractsVarsSimulationRepository.update(simRow);
    } else {
      let newRow = new ContractsVarsSimulation({
        simulateId,
        address,
        registerId,
        key: key,
        value: '',
        type: '',
        del: true,
      });
      await this.contractsVarsSimulationRepository.create(newRow);
    }
  }
}
