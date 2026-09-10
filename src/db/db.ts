import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface ISolicitud {
  id: string;
  name: string;
  type: string;
  payload: string;
  status: 'Pending' | 'Processed' | 'Failed';
  createdAt: Date;
  groupId?: string;
}

export interface IGroup {
  id: string;
  name: string;
  parentId?: string | null;
}

export class AppDatabase extends Dexie {
  solicitudes!: Table<ISolicitud, string>;
  grupos!: Table<IGroup, string>;

  constructor() {
    super('OfflineSyncDB');
    this.version(1).stores({
      solicitudes: 'id, name, type, status, groupId, createdAt',
      grupos: 'id, parentId, name'
    });
  }
}

export const db = new AppDatabase();