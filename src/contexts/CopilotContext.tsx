import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface CopilotDOMContext {
  activeModule?: string;
  activeRecordId?: string;
  activeRecordType?: string;
  pageTitle?: string;
  visibleMetrics?: Record<string, string | number>;
  onScreenActions?: string[];
}

interface CopilotContextType {
  domContext: CopilotDOMContext;
  setDOMContext: (ctx: Partial<CopilotDOMContext>) => void;
  updateDOMContext: (ctx: Partial<CopilotDOMContext>) => void;
  clearDOMContext: () => void;
  
  actionHandlers: Record<string, () => void>;
  registerActionHandler: (id: string, handler: () => void) => void;
  unregisterActionHandler: (id: string) => void;
  executeAction: (id: string) => boolean;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [domContext, setDOMContextState] = useState<CopilotDOMContext>({});
  const location = useLocation();

  const [actionHandlers, setActionHandlers] = useState<Record<string, () => void>>({});

  // Reset certain dynamic context params on route change
  React.useEffect(() => {
    setDOMContextState(prev => ({
      ...prev,
      visibleMetrics: {},
      onScreenActions: []
    }));
    setActionHandlers({}); // clear handlers on route change to prevent stale calls
  }, [location.pathname]);

  const updateDOMContext = (newCtx: Partial<CopilotDOMContext>) => {
    setDOMContextState(prev => ({ ...prev, ...newCtx }));
  };

  const clearDOMContext = () => setDOMContextState({});

  const registerActionHandler = React.useCallback((id: string, handler: () => void) => {
    setActionHandlers(prev => ({ ...prev, [id]: handler }));
  }, []);

  const unregisterActionHandler = React.useCallback((id: string) => {
    setActionHandlers(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const executeAction = React.useCallback((id: string): boolean => {
    if (actionHandlers[id]) {
      actionHandlers[id]();
      return true;
    }
    return false;
  }, [actionHandlers]);

  return (
    <CopilotContext.Provider 
      value={{ 
        domContext, 
        setDOMContext: setDOMContextState,
        updateDOMContext,
        clearDOMContext,
        actionHandlers,
        registerActionHandler,
        unregisterActionHandler,
        executeAction
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilotContext() {
  const context = useContext(CopilotContext);
  if (context === undefined) {
    throw new Error('useCopilotContext must be used within a CopilotProvider');
  }
  return context;
}
