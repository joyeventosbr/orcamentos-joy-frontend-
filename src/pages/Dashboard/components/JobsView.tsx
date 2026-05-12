import { Card, CardContent } from "@/src/components/ui/Card/Card";
import { Button } from "@/src/components/ui/Button/Button";
import { Budget, Job } from "@/src/types";
import { format } from "date-fns";
import { Briefcase, Calendar, MoreHorizontal, Search } from "lucide-react";

interface JobsViewProps {
  jobs: Job[];
  budgets: Budget[];
  viewMode: "grid" | "table";
  onSelectJob: (jobId: string) => void;
  onClearSearch: () => void;
}

export function JobsView({ jobs, budgets, viewMode, onSelectJob, onClearSearch }: JobsViewProps) {
  if (jobs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Search size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum job encontrado</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          Não encontramos nenhum job com os filtros atuais. Tente ajustar sua busca ou crie um novo.
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
        {jobs.map((job) => {
          const jobBudgets = budgets.filter((b) => b.jobId === job.id);
          return (
            <Card
              key={job.id}
              className="group hover:border-brand-primary/30 hover:shadow-md transition-all cursor-pointer flex flex-col"
              onClick={() => onSelectJob(job.id)}
            >
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Briefcase size={20} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">{job.name}</h3>
                <p className="text-sm text-gray-500">{jobBudgets.length} orçamento{jobBudgets.length !== 1 ? "s" : ""}</p>
                <div className="mt-auto pt-6 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={14} />
                    {format(new Date(job.updatedAt), "dd/MM/yyyy")}
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
            <th className="px-6 py-4 font-medium">Job / Evento</th>
            <th className="px-6 py-4 font-medium">Orçamentos</th>
            <th className="px-6 py-4 font-medium">Última Atualização</th>
            <th className="px-6 py-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => {
            const jobBudgets = budgets.filter((b) => b.jobId === job.id);
            return (
              <tr
                key={job.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                onClick={() => onSelectJob(job.id)}
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <Briefcase size={16} className="text-brand-primary" />
                  {job.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{jobBudgets.length}</td>
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(job.updatedAt), "dd/MM/yyyy")}
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
