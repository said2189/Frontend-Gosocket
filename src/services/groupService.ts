import { db } from '../db/db';

export const getGroupTotalSolicitudes = async (groupId: string): Promise<number> => {
  
  const directSolicitudes = await db.solicitudes.where('groupId').equals(groupId).count();
  const subGroups = await db.grupos.where('parentId').equals(groupId).toArray();
  
  let subGroupTotals = 0;
  for (const subGroup of subGroups) {
    subGroupTotals += await getGroupTotalSolicitudes(subGroup.id);
  }

  return directSolicitudes + subGroupTotals;
};