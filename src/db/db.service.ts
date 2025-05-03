import { Inject, Injectable } from '@nestjs/common';
import { access, readFile, writeFile } from 'fs/promises';
import { DbModuleOptions } from './db.module';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  private readonly options: DbModuleOptions;

  async write(obj: Record<string, any>) {
    await writeFile(this.options.path, JSON.stringify(obj), {
      encoding: 'utf-8',
      flag: 'w',
    });
  }

  async read() {
    const filePath = this.options.path;
    await access(filePath);

    const data = await readFile(filePath, {
      encoding: 'utf-8',
    });

    return JSON.parse(data);
  }
}
