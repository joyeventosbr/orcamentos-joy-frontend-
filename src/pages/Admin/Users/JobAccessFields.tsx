import { useQuery } from '@tanstack/react-query';
import { customersKeys } from '@/src/api/customers/customers.keys';
import { customersReq } from '@/src/api/customers/customers.req';
import { foldersKeys } from '@/src/api/folders/folders.keys';
import { foldersReq } from '@/src/api/folders/folders.req';
import { useState } from 'react';

interface Props { value: string[]; onChange: (ids: string[]) => void; error?: string }
export function JobAccessFields({ value, onChange, error }: Props) {
  const customersQuery = useQuery({ queryKey: customersKeys.queries.list, queryFn: customersReq.list });
  const foldersQuery = useQuery({ queryKey: foldersKeys.queries.list, queryFn: foldersReq.list });
  const customers = customersQuery.data ?? [];
  const folders = foldersQuery.data ?? [];
  const isLoading = customersQuery.isLoading || foldersQuery.isLoading;
  const isError = customersQuery.isError || foldersQuery.isError;
  const [customerId, setCustomerId] = useState('');
  return <fieldset className="space-y-2">
    <legend className="text-sm font-medium">Jobs autorizados</legend>
    <label className="block text-sm" htmlFor="access-customer">Cliente</label>
    <select id="access-customer" className="w-full border border-gray-200 rounded-lg p-2" value={customerId} onChange={e => setCustomerId(e.target.value)} disabled={isLoading}>
      <option value="">Todos os clientes</option>
      {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
    </select>
    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2" aria-invalid={!!error}>
      {isError ? <div className="text-sm text-red-600">Não foi possível carregar clientes e jobs. <button type="button" className="underline" onClick={() => { void customersQuery.refetch(); void foldersQuery.refetch(); }}>Tentar novamente</button></div> : isLoading ? <p>Carregando jobs...</p> : folders.filter(folder => !customerId || folder.customerId === customerId).map(folder => <label key={folder.id} className="flex gap-2 text-sm">
        <input type="checkbox" checked={value.includes(folder.id)} onChange={e => onChange(e.target.checked ? [...value, folder.id] : value.filter(id => id !== folder.id))} />
        {customers.find(customer => customer.id === folder.customerId)?.name} / {folder.name}
      </label>)}
      {!isLoading && !isError && !folders.some(folder => !customerId || folder.customerId === customerId) && <p className="text-sm text-gray-500">Nenhum job cadastrado.</p>}
    </div>
    <p className="text-xs text-gray-500">{value.length} job(s) selecionado(s). É possível selecionar jobs de clientes diferentes.</p>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </fieldset>;
}
