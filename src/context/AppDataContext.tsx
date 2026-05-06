import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Project, Budget } from '../types';
import { budgetService } from '@/src/services/budgetService';
import { useAuth } from './AuthContext';

interface AppDataContextType {
  projects: Project[];
  budgets: Budget[];
  isLoading: boolean;
  addProject: (name: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  addBudget: (input: { projectId: string; name: string }) => Promise<Budget>;
  updateBudget: (id: string, budget: Budget) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  duplicateBudget: (id: string) => Promise<Budget | null>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    budgetService.getInitialData().then((data) => {
      if (!isMounted) return;

      setProjects(data.projects);
      setBudgets(data.budgets);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const addProject = async (name: string) => {
    const newProject = await budgetService.createProject(name);
    setProjects((prev) => [...prev, newProject]);

    return newProject;
  };

  const deleteProject = async (id: string) => {
    await budgetService.deleteProject(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
    setBudgets((prev) => prev.filter((budget) => budget.projectId !== id));
  };

  const addBudget = async (input: { projectId: string; name: string }) => {
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

  return (
    <AppDataContext.Provider value={{
      projects,
      budgets,
      isLoading,
      addProject,
      deleteProject,
      addBudget,
      updateBudget,
      deleteBudget,
      duplicateBudget
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
