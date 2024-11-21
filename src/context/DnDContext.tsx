import React, { createContext, useContext, useState } from 'react';

const DnDContext = createContext<[string | null, (type: string | null) => void]>([
  null,
  () => {},
]);

export function DnDProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<string | null>(null);
  
  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  return useContext(DnDContext);
} 