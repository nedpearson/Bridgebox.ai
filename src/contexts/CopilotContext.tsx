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
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [domContext, setDOMContextState] = useState<CopilotDOMContext>({});
  const location = useLocation();

  // Reset certain dynamic context params on route change
  React.useEffect(() => {
    setDOMContextState(prev => ({
      ...prev,
      visibleMetrics: {},
      onScreenActions: []
    }));
  }, [location.pathname]);

  const updateDOMContext = (newCtx: Partial<CopilotDOMContext>) => {
    setDOMContextState(prev => ({ ...prev, ...newCtx }));
  };

  const clearDOMContext = () => setDOMContextState({});

  return (
    <CopilotContext.Provider 
      value={{ 
        domContext, 
        setDOMContext: setDOMContextState,
        updateDOMContext,
        clearDOMContext
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
