import {UsersRepository} from '../repositories';

const jsonToSql = async (table: string, someRepository: UsersRepository) => {
  const objs: any[] = require(`../../assets/${table}.json`);
  for await (const obj of objs) {
    let entires = Object.entries(obj);
    let keys = entires.map(entire => entire[0].toLowerCase()).join('","');
    let values = entires.map(entire => {
      let value = entire[1];
      if (typeof value === 'object') {
        return `E'${JSON.stringify(value)}'`;
      } else {
        return `E'${value}'`;
      }
    }).join(',');
    let sql = `INSERT INTO ${table} ("${keys}") VALUES (${values}) ON CONFLICT DO NOTHING;`;
    //console.log(sql);
    await someRepository.execute(sql);
  }
}

export async function Populate(someRepository: UsersRepository) {
  try {
    console.log("Populating Database...")
    await someRepository.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await jsonToSql('users', someRepository);
    await jsonToSql('roles', someRepository);
    await jsonToSql('permissions', someRepository);

    console.log("Populating Successful!");
  } catch (error) {
    console.log("Error while populating: ", error);
  }
}