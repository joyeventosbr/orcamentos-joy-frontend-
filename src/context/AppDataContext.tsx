import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Client, Job, Budget } from '../types';
import { budgetService, ApprovalResult } from '@/src/services/budgetService';
import { useAuth } from './AuthContext';

interface AppDataContextType {
  clients: Client[];
  jobs: Job[];
  budgets: Budget[];
  isLoading: boolean;
  addClient: (name: string) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  addJob: (clientId: string, name: string) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  addBudget: (input: { jobId: string; name: string }) => Promise<Budget>;
  updateBudget: (id: string, budget: Budget) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  duplicateBudget: (id: string) => Promise<Budget | null>;
  approveBudget: (id: string) => Promise<ApprovalResult>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    budgetService.getInitialData().then((data) => {
      if (!isMounted) return;

      setClients(data.clients);
      setJobs(data.jobs);
      setBudgets(data.budgets);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Client ---

  const addClient = async (name: string) => {
    const newClient = await budgetService.createClient(name);
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  const deleteClient = async (id: string) => {
    await budgetService.deleteClient(id);
    const jobIds = jobs.filter((j) => j.clientId === id).map((j) => j.id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    setJobs((prev) => prev.filter((j) => j.clientId !== id));
    setBudgets((prev) => prev.filter((b) => !jobIds.includes(b.jobId)));
  };

  // --- Job ---

  const addJob = async (clientId: string, name: string) => {
    const newJob = await budgetService.createJob(clientId, name);
    setJobs((prev) => [...prev, newJob]);
    return newJob;
  };

  const deleteJob = async (id: string) => {
    await budgetService.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setBudgets((prev) => prev.filter((b) => b.jobId !== id));
  };

  // --- Budget ---

  const addBudget = async (input: { jobId: string; name: string }) => {
    const newBudget = await budgetService.createBudget(input);
    setBudgets((prev) => [...prev, newBudget]);
    return newBudget;
  };

  const updateBudget = async (id: string, updatedBudget: Budget) => {
    const editor = currentUser ?? undefined;
    const savedBudget = await budgetService.updateBudget(id, updatedBudget, editor);
    setBudgets((prev) =>
      prev.map((budget) => (budget.id === id ? savedBudget : budget)),
    );
    return savedBudget;
  };

  const deleteBudget = async (id: string) => {
    await budgetService.deleteBudget(id);
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  };

  const duplicateBudget = async (id: string) => {
    const duplicatedBudget = await budgetService.duplicateBudget(id);
    if (duplicatedBudget) {
      setBudgets((prev) => [...prev, duplicatedBudget]);
    }
    return duplicatedBudget;
  };

  // --- Approval Workflow ---

  const approveBudget = async (id: string) => {
    const result = await budgetService.approveBudget(id);
    setBudgets((prev) => {
      let updated = [...prev, result.approvedCopy];
      if (result.productionCopy) {
        updated = [...updated, result.productionCopy];
      }
      return updated;
    });
    return result;
  };

  return (
    <AppDataContext.Provider value={{
      clients,
      jobs,
      budgets,
      isLoading,
      addClient,
      deleteClient,
      addJob,
      deleteJob,
      addBudget,
      updateBudget,
      deleteBudget,
      duplicateBudget,
      approveBudget,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
}
