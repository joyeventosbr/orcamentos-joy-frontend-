import { Card, CardContent } from "@/src/components/ui/Card/Card";
import { Button } from "@/src/components/ui/Button/Button";
import { Customer, Folder } from "@/src/types/api.types";
import { format } from "date-fns";
import { Calendar, FolderOpen, MoreHorizontal, Users } from "lucide-react";

interface ClientsViewProps {
  customers: Customer[];
  folders: Folder[];
  viewMode: "grid" | "table";
  onSelectCustomer: (customerId: string) => void;
  onClearSearch: () => void;
}

export function ClientsView({ customers, folders, viewMode, onSelectCustomer, onClearSearch }: ClientsViewProps) {
  if (customers.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Users size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum cliente encontrado</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Não encontramos nenhum cliente com os filtros atuais. Tente ajustar sua busca ou crie um novo.
        </p>
        <Button onClick={onClearSearch} variant="outline">
          Limpar filtros
        </Button>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const customerFolders = folders.filter((f) => f.customerId === customer.id);
          return (
            <Card
              key={customer.id}
              className="group hover:border-brand-primary/30 hover:shadow-md transition-all cursor-pointer flex flex-col"
              onClick={() => onSelectCustomer(customer.id)}
            >
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <FolderOpen size={20} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">{customer.name}</h3>
                <p className="text-sm text-gray-500">
                  {customerFolders.length} pasta{customerFolders.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-auto pt-6 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={14} />
                    {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-4 font-medium">Cliente</th>
            <th className="px-6 py-4 font-medium">Pastas</th>
            <th className="px-6 py-4 font-medium">Data de Cadastro</th>
            <th className="px-6 py-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((customer) => {
            const customerFolders = folders.filter((f) => f.customerId === customer.id);
            return (
              <tr
                key={customer.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                onClick={() => onSelectCustomer(customer.id)}
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <FolderOpen size={16} className="text-brand-primary" />
                  {customer.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{customerFolders.length}</td>
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
