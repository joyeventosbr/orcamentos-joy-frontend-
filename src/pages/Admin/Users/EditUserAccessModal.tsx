import { useState } from 'react';
import { AuthUser } from '@/src/types/auth.types';
import { Button } from '@/src/components/ui/Button/Button';
import { JobAccessFields } from './JobAccessFields';

interface Props { user: AuthUser; pending: boolean; onCancel: () => void; onSave: (body: { folderIds: string[]; isActive: boolean }) => void }
export function EditUserAccessModal({ user, pending, onCancel, onSave }: Props) {
  const [folderIds, setFolderIds] = useState(user.folderIds ?? []);
  const [isActive, setIsActive] = useState(user.isActive !== false);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="access-title">
    <form className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave({ folderIds, isActive }); }}>
      <h2 id="access-title" className="font-semibold">Acesso de {user.name}</h2>
      <fieldset disabled={pending} className="space-y-4">
        <JobAccessFields value={folderIds} onChange={setFolderIds} />
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />Acesso ativo</label>
      </fieldset>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={pending} onClick={onCancel}>Cancelar</Button><Button disabled={pending || (isActive && !folderIds.length)}>{pending ? 'Salvando...' : 'Salvar acesso'}</Button></div>
    </form>
  </div>;
}
