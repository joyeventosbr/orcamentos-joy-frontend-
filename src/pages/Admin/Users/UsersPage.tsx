import { useDeleteUserMutation, useListUsersQuery, useRegisterAdminMutation, useRegisterUserMutation } from "@/src/api/auth/auth.caller";
import { Badge } from "@/src/components/ui/Badge/Badge";
import { Button } from "@/src/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card/Card";
import { useAuth } from "@/src/hooks/use-auth";
import { AuthUser, UserRole } from "@/src/types/auth.types";
import { Loader2, Mail, Plus, Shield, Trash2, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CreateUserModal } from "./CreateUserModal";
import { DeleteUserModal } from "./DeleteUserModal";
import { CreateUserFormValues } from "./user.schema";

export function UsersPage() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  const { data: users = [], isLoading, isError, refetch } = useListUsersQuery();
  const registerUserMutation = useRegisterUserMutation();
  const registerAdminMutation = useRegisterAdminMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const isPending = registerUserMutation.isPending || registerAdminMutation.isPending;

  const onSuccess = (name: string) => {
    setIsModalOpen(false);
    toast.success(`Usuário ${name} criado com sucesso.`);
  };

  const onError = (err: Error) => {
    toast.error(err.message || "Erro ao criar usuário");
  };

  const handleCreateUser = (data: CreateUserFormValues) => {
    if (data.role === "admin") {
      registerAdminMutation.mutate(
        { name: data.name, email: data.email, password: data.password },
        { onSuccess: () => onSuccess(data.name), onError },
      );
    } else {
      registerUserMutation.mutate(
        { name: data.name, email: data.email, password: data.password, roleDescription: data.roleDescription! },
        { onSuccess: () => onSuccess(data.name), onError },
      );
    }
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`Usuário ${userToDelete.name} excluído com sucesso.`);
        setUserToDelete(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || "Falha ao deletar usuário");
        if (err.message === "Usuário não encontrado") {
          refetch();
          setUserToDelete(null);
        }
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie os acessos ao sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={15} />
            Novo usuário
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              Usuários cadastrados
              {!isLoading && !isError && (
                <span className="ml-2 text-xs font-normal text-gray-400">({users.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                Carregando usuários...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <p className="text-sm text-red-500">Falha ao carregar usuários.</p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : users.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Nenhum usuário encontrado.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                              {user.role === UserRole.ADMIN ? (
                                <Shield size={14} className="text-brand-primary" />
                              ) : (
                                <User size={14} className="text-brand-primary" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.role === UserRole.ADMIN ? "default" : "neutral"}>
                            {user.role === UserRole.ADMIN ? "Administrador" : "Cliente"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {user.funcao ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                            disabled={isSelf}
                            title={isSelf ? "Você não pode deletar sua própria conta" : "Excluir usuário"}
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 size={14} />
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <CreateUserModal onCancel={() => setIsModalOpen(false)} onSubmit={handleCreateUser} isSubmitting={isPending} />
      )}

      {userToDelete && (
        <DeleteUserModal
          userName={userToDelete.name}
          userEmail={userToDelete.email}
          isDeleting={deleteUserMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!deleteUserMutation.isPending) setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
}
