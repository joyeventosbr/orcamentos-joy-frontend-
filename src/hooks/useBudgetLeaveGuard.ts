import { useBeforeUnload } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseBudgetLeaveGuardOptions {
  shouldBlock: boolean;
  onSave: () => Promise<boolean>;
  leaveDestination: () => void;
}

export function useBudgetLeaveGuard({ shouldBlock, onSave, leaveDestination }: UseBudgetLeaveGuardOptions) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const allowNavigationRef = useRef(false);
  const trapPushedRef = useRef(false);
  const leaveDestinationRef = useRef(leaveDestination);

  leaveDestinationRef.current = leaveDestination;

  useBeforeUnload(
    useCallback(
      (event) => {
        if (shouldBlock) {
          event.preventDefault();
        }
      },
      [shouldBlock],
    ),
  );

  useEffect(() => {
    if (!shouldBlock) {
      trapPushedRef.current = false;
      return;
    }

    if (!trapPushedRef.current) {
      window.history.pushState({ budgetEditorLeaveTrap: true }, "");
      trapPushedRef.current = true;
    }

    const onPopState = () => {
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false;
        return;
      }

      window.history.pushState({ budgetEditorLeaveTrap: true }, "");
      pendingNavigationRef.current = leaveDestinationRef.current;
      setShowLeaveModal(true);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [shouldBlock]);

  const clearHistoryTrap = useCallback(() => {
    if (!trapPushedRef.current) return;
    trapPushedRef.current = false;
    allowNavigationRef.current = true;
    window.history.back();
  }, []);

  const requestLeave = useCallback(
    (navigateFn: () => void) => {
      if (shouldBlock) {
        pendingNavigationRef.current = navigateFn;
        setShowLeaveModal(true);
        return;
      }

      clearHistoryTrap();
      navigateFn();
    },
    [shouldBlock, clearHistoryTrap],
  );

  const closeModal = useCallback(() => {
    setShowLeaveModal(false);
    pendingNavigationRef.current = null;
  }, []);

  const proceedNavigation = useCallback(() => {
    setShowLeaveModal(false);
    const navigateFn = pendingNavigationRef.current ?? leaveDestinationRef.current;
    pendingNavigationRef.current = null;
    clearHistoryTrap();
    navigateFn();
  }, [clearHistoryTrap]);

  const handleLeaveWithoutSaving = useCallback(() => {
    proceedNavigation();
  }, [proceedNavigation]);

  const handleSaveAndLeave = useCallback(async () => {
    const saved = await onSave();
    if (saved) {
      proceedNavigation();
    }
  }, [onSave, proceedNavigation]);

  return {
    showLeaveModal,
    requestLeave,
    closeLeaveModal: closeModal,
    handleLeaveWithoutSaving,
    handleSaveAndLeave,
  };
}
