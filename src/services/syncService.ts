import axios from 'axios';
import { db } from '../db/db';
import { processPayload } from './payloadProcessors';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'https://localhost:7066/Solicitudes';

export const syncPendingSolicitudes = async () => {
  if (!navigator.onLine) {
    throw new Error("No hay conexión a internet para sincronizar.");
  }

  const toSync = await db.solicitudes
    .where('status')
    .anyOf(['Pending', 'Failed'])
    .toArray();

  let successCount = 0;
  let failCount = 0;

  for (const sol of toSync) {
    try {

      const processedPayload = processPayload(sol.type, sol.payload);

      await axios.post(API_URL, {
        name: sol.name,
        type: sol.type,
        payload: processedPayload,
        groupId: sol.groupId || null
      });

      await db.solicitudes.update(sol.id, { status: 'Processed' });
      successCount++;
    } catch (error) {
      console.error(`Error sincronizando solicitud ${sol.id}`, error);
      await db.solicitudes.update(sol.id, { status: 'Failed' });
      failCount++;
    }
  }

  return { successCount, failCount, total: toSync.length };
};


export const createLocalSolicitud = async (name: string, type: string, payload: string, groupId?: string) => {
  const newSolicitud = {
    id: uuidv4(),
    name,
    type,
    payload,
    status: 'Pending' as const,
    createdAt: new Date(),
    groupId
  };
  await db.solicitudes.add(newSolicitud);
};