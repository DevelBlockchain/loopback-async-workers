import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { Type, Types, Variable } from '../compiler/vm/data';
import { ContractsVarsSimulation, Simulations } from '../models';
import { ContractsVarsRepository, ContractsVarsSimulationRepository } from '../repositories';
import { SimulationsRepository } from '../repositories/simulations.repository';

@injectable({ scope: BindingScope.TRANSIENT })
export class ContractsVarsProvider {

  constructor(
    @repository(ContractsVarsRepository) private contractsVarsRepository: ContractsVarsRepository,
    @repository(ContractsVarsSimulationRepository) private contractsVarsSimulationRepository: ContractsVarsSimulationRepository,
    @repository(SimulationsRepository) private simulationsRepository: SimulationsRepository,
  ) { }

  consolideVars = async (simulateId: string) => {
    const sims = await this.simulationsRepository.find({
      where: {
        simulateId,
      }
    })
    const addresses: { address: string, registers: string[] }[] = [];
    sims.forEach(sim => {
      let address: { address: string, registers: string[] } | undefined;
      addresses.forEach(addr => {
        if (addr.address === sim.address) {
          address = addr;
        }
      });
      if (!address) {
        address = {
          address: sim.address,
          registers: []
        }
        addresses.push(address);
      }
      if (!address.registers.includes(sim.registerId)) {
        address.registers.push(sim.registerId);
      }
    })
    for await (const address of addresses) {
      for await (const registerId of address.registers) {
        await this.contractsVarsRepository.deleteAll({
          address: address.address,
          registerId: registerId
        });
        let sql = `INSERT INTO contractsvars ("id","address","registerid","indexkey","key","value","type") `;
        sql += `SELECT uuid_generate_v4() as "id", "address", "registerid", "indexkey", "key", "value", "type" `;
        sql += `FROM contractsvarssimulation WHERE simulateid = '${simulateId}' AND address = '${address.address}' AND registerid = '${registerId}';`;
        await this.contractsVarsRepository.execute(sql);
      }
    }
    for await (const sim of sims) {
      await this.simulationsRepository.delete(sim);
    }
    await this.contractsVarsSimulationRepository.deleteAll({ simulateId });
  }

  init = async (simulateId: string, address: string, registerId: string): Promise<void> => {
    const sim = await this.simulationsRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
      }
    })
    if (!sim) {
      let sql = `INSERT INTO contractsvarssimulation("id","simulateid","address","registerid","indexkey","key","value","type") `;
      sql += `SELECT uuid_generate_v4() as "id", '${simulateId}' as "simulateid", "address", "registerid", "indexkey", "key", "value", "type" `;
      sql += `FROM contractsvars WHERE address = '${address}' AND registerid = '${registerId}';`;
      await this.contractsVarsSimulationRepository.execute(sql);
      await this.simulationsRepository.create(new Simulations({
        simulateId,
        address,
        registerId,
      }))
    }
  }

  isInitialized = async (simulateId: string, address: string, registerId: string): Promise<boolean> => {
    const sim = await this.simulationsRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
      }
    })
    return sim !== null;
  }

  getArrayLength = async (simulateId: string, address: string, registerId: string): Promise<number> => {
    let isInit = await this.isInitialized(simulateId, address, registerId);
    if (isInit) {
      const size = (await this.contractsVarsSimulationRepository.count({
        simulateId,
        address,
        registerId,
      })).count;
      return size;
    } else {
      const size = (await this.contractsVarsRepository.count({
        address,
        registerId,
      })).count;
      return size;
    }
  }

  getArray = async (simulateId: string, address: string, registerId: string, index: number): Promise<Variable | null> => {
    let isInit = await this.isInitialized(simulateId, address, registerId);
    let selectedRow = null;
    if (isInit) {
      const simRow = await this.contractsVarsSimulationRepository.findOne({
        where: {
          simulateId,
          address,
          registerId,
          indexKey: index
        }
      });
      if (simRow) {
        selectedRow = simRow;
      }
    } else {
      const row = await this.contractsVarsRepository.findOne({
        where: {
          address,
          registerId,
          indexKey: index
        }
      });
      if (row) {
        selectedRow = row;
      }
    }
    if (selectedRow) {
      let type = Types.getType(selectedRow.type);
      if (!type) throw new Error(`invalid type "${selectedRow.type}" at ${selectedRow.id}`);
      return new Variable(type, selectedRow.value);
    } else {
      return null;
    }
  }

  arrayPush = async (simulateId: string, address: string, registerId: string, value: string, type: Type, index: number | undefined) => {
    await this.init(simulateId, address, registerId);
    const size = (await this.contractsVarsSimulationRepository.count({
      simulateId,
      address,
      registerId,
    })).count;

    if (index !== undefined) {
      if (index < 0 || index > size) {
        throw new Error(`invalid index "${index}" at ${registerId} - size of array ${size}`);
      }
      await this.contractsVarsSimulationRepository.execute(`UPDATE contractsvarssimulation SET "indexkey"="indexkey" + 1 WHERE "indexkey" >= ${index};`);
    } else {
      index = size;
    }
    let newRow = new ContractsVarsSimulation({
      simulateId,
      address,
      registerId,
      indexKey: index,
      value: value,
      type: type.name,
    });
    await this.contractsVarsSimulationRepository.create(newRow);
  }

  arrayPop = async (simulateId: string, address: string, registerId: string, index: number | undefined): Promise<Variable> => {
    await this.init(simulateId, address, registerId);
    const size = (await this.contractsVarsSimulationRepository.count({
      simulateId,
      address,
      registerId,
    })).count;
    if (index === undefined) {
      index = size - 1;
    }
    const simRow = await this.contractsVarsSimulationRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
        indexKey: index
      }
    });
    if (!simRow) {
      throw new Error(`invalid index "${index}" at ${registerId} - size of array ${size}`);
    }
    let type = Types.getType(simRow.type);
    if (!type) throw new Error(`invalid contractsVars type "${simRow.type}" at ${simRow.id}`);
    let returnVar = new Variable(type, simRow.value);
    await this.contractsVarsSimulationRepository.delete(simRow);
    await this.contractsVarsSimulationRepository.execute(`UPDATE contractsvarssimulation SET "indexkey"="indexkey" - 1 WHERE "indexkey" > ${index};`);
    return returnVar;
  }

  getMap = async (simulateId: string, address: string, registerId: string, key: string): Promise<Variable | null> => {
    let isInit = await this.isInitialized(simulateId, address, registerId);
    let selectedRow = null;
    if (isInit) {
      const simRow = await this.contractsVarsSimulationRepository.findOne({
        where: {
          simulateId,
          address,
          registerId,
          key
        }
      });
      if (simRow) {
        selectedRow = simRow;
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
        selectedRow = row;
      }
    }
    if (selectedRow) {
      let type = Types.getType(selectedRow.type);
      if (!type) throw new Error(`invalid type "${selectedRow.type}" at ${selectedRow.id}`);
      return new Variable(type, selectedRow.value);
    } else {
      return null;
    }
  }

  setMap = async (simulateId: string, address: string, registerId: string, key: string, value: string, type: Type) => {
    await this.init(simulateId, address, registerId);
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
      await this.contractsVarsSimulationRepository.update(simRow);
    } else {
      let newRow = new ContractsVarsSimulation({
        simulateId,
        address,
        registerId,
        key: key,
        value: value,
        type: type.name,
      });
      await this.contractsVarsSimulationRepository.create(newRow);
    }
  }

  delMap = async (simulateId: string, address: string, registerId: string, key: string) => {
    await this.init(simulateId, address, registerId);
    const simRow = await this.contractsVarsSimulationRepository.findOne({
      where: {
        simulateId,
        address,
        registerId,
        key
      }
    });
    if (simRow) {
      await this.contractsVarsSimulationRepository.delete(simRow);
    }
  }
}
