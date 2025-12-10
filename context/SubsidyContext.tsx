import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubsidyStatus = 'available_to_claim' | 'claimed' | 'ineligible';

export interface Subsidy {
  id: string;
  name: string;
  amount: number; // Total grant amount
  spent: number;  // Amount spent so far
  status: SubsidyStatus;
  description: string;
  color: string; // convenient for UI mapping
}

// Initial Data Mock
const INITIAL_SUBSIDIES: Subsidy[] = [
  { 
      id: 'bkk', 
      name: 'Bantuan Keluarga Malaysia (BKK)', 
      amount: 600, 
      spent: 0,
      status: 'available_to_claim', // Changed to claimable as requested
      description: 'Financial aid for low-income households.',
      color: 'bg-blue-600'
  },
  { 
      id: 'mykasih', 
      name: 'MyKasih Food Aid', 
      amount: 50, 
      spent: 0,
      status: 'available_to_claim', 
      description: 'Cashless food aid for eligible families.',
      color: 'bg-green-600' 
  },
  { 
      id: 'student', 
      name: 'Student Book Voucher', 
      amount: 100, 
      spent: 0,
      status: 'claimed', 
      description: 'Voucher for purchasing detailed books and stationery.',
      color: 'bg-orange-500'
  },
];

interface SubsidyContextType {
  subsidies: Subsidy[];
  claimSubsidy: (id: string) => void;
  spendSubsidy: (id: string, amount: number) => void;
  totalBalance: number;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const SubsidyContext = createContext<SubsidyContextType | undefined>(undefined);

export function SubsidyProvider({ children }: { children: ReactNode }) {
  const [subsidies, setSubsidies] = useState<Subsidy[]>(INITIAL_SUBSIDIES);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const claimSubsidy = (id: string) => {
    setSubsidies(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'claimed' } : s
    ));
  };

  const spendSubsidy = (id: string, amount: number) => {
    setSubsidies(prev => prev.map(s => 
        s.id === id ? { ...s, spent: s.spent + amount } : s
    ));
  };

  const totalBalance = subsidies
    .filter(s => s.status === 'claimed')
    .reduce((acc, curr) => acc + (curr.amount - curr.spent), 0);

  return (
    <SubsidyContext.Provider value={{ subsidies, claimSubsidy, spendSubsidy, totalBalance, isAuthenticated, login, logout }}>
      {children}
    </SubsidyContext.Provider>
  );
}

export function useSubsidy() {
  const context = useContext(SubsidyContext);
  if (context === undefined) {
    throw new Error('useSubsidy must be used within a SubsidyProvider');
  }
  return context;
}
