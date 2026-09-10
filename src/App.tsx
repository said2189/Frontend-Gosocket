import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { createLocalSolicitud, syncPendingSolicitudes } from './services/syncService';
import { getGroupTotalSolicitudes } from './services/groupService';

function App() {
  const [name, setName] = useState('');
  const [type, setType] = useState('transform_text');
  const [payload, setPayload] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [parentGroupId, setParentGroupId] = useState<string>('');

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const solicitudes = useLiveQuery(() => db.solicitudes.orderBy('createdAt').reverse().toArray());
  const grupos = useLiveQuery(() => db.grupos.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !payload) return alert('Por favor, completa todos los campos.');
    
    await createLocalSolicitud(
      name, 
      type, 
      payload, 
      selectedGroupId ? selectedGroupId : undefined
    );
    setName('');
    setPayload('');
    setSelectedGroupId('');
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return alert('Por favor, escribe un nombre para el grupo.');

    await db.grupos.add({
      id: crypto.randomUUID(),
      name: groupName,
      parentId: parentGroupId ? parentGroupId : null
    });

    setGroupName('');
    setParentGroupId('');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncPendingSolicitudes();
      alert(`Sincronización finalizada.\nEnviadas con éxito: ${result.successCount}\nFallidas: ${result.failCount}`);
    } catch (error: any) {
      alert(`Error durante la sincronización: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      
      <div className="max-w-6xl mx-auto flex justify-end mb-4">
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-gray-700">
            {isOnline ? 'Conectado (Online)' : 'Sin conexión (Offline)'}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="space-y-6 col-span-1">
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Crear Grupo / Subgrupo</h2>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Nombre del Grupo</label>
                <input 
                  type="text" 
                  value={groupName} 
                  onChange={e => setGroupName(e.target.value)} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" 
                  placeholder="Ej. Proyecto Principal"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Grupo Padre (Opcional para subgrupos)</label>
                <select 
                  value={parentGroupId} 
                  onChange={e => setParentGroupId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                >
                  <option value="">-- Ninguno (Es grupo raíz) --</option>
                  {grupos?.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition text-sm font-semibold"
              >
                Crear Grupo Local
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Nueva Solicitud</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" 
                  placeholder="Ej. Registro de usuario"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700">Tipo de Procesamiento</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                >
                  <option value="transform_text">Transformación de texto (Mayúsculas)</option>
                  <option value="modify_structure">Modificación de estructura (JSON)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Asignar a Grupo (Opcional)</label>
                <select 
                  value={selectedGroupId} 
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                >
                  <option value="">-- Sin Grupo --</option>
                  {grupos?.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Payload</label>
                <textarea 
                  value={payload} 
                  onChange={e => setPayload(e.target.value)} 
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm" 
                  placeholder={type === 'modify_structure' ? '{"clave": "valor"}' : 'Escribe algo aquí...'}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
              >
                Guardar
              </button>
            </form>
          </div>

        </div>

        <div className="space-y-6 col-span-1 md:col-span-2">
                
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Estructura de Grupos</h2>
            {!grupos || grupos.length === 0 ? (
              <p className="text-sm text-gray-500">No hay grupos creados todavía.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grupos.map(g => (
                  <GroupCard key={g.id} group={g} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Mis Solicitudes</h2>
              <button 
                onClick={handleSync} 
                disabled={isSyncing}
                className={`px-4 py-2 rounded text-white font-semibold text-sm transition ${isSyncing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Pendientes'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payload</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!solicitudes || solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                        No hay solicitudes registradas localmente.
                      </td>
                    </tr>
                  ) : (
                    solicitudes.map((sol) => (
                      <tr key={sol.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sol.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sol.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={sol.payload}>
                          {sol.payload}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${sol.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${sol.status === 'Processed' ? 'bg-green-100 text-green-800' : ''}
                            ${sol.status === 'Failed' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {sol.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function GroupCard({ group }: { group: { id: string; name: string; parentId?: string | null } }) {
  const totalSolicitudes = useLiveQuery(async () => {
    return await getGroupTotalSolicitudes(group.id);
  }, [group.id]);

  return (
    <div className="p-3 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-center">
      <div>
        <h4 className="text-sm font-bold text-gray-800">{group.name}</h4>
        <span className="text-xs text-gray-500">
          {group.parentId ? 'Subgrupo' : 'Grupo Raíz'}
        </span>
      </div>
      <div className="text-right">
        <span className="text-xs text-gray-500 block">Total solicitudes:</span>
        <span className="text-sm font-bold text-purple-700">{totalSolicitudes ?? 0}</span>
      </div>
    </div>
  );
}

export default App;