import { createContext, useContext, useState } from 'react';

const GovAuthContext = createContext(null);

export function GovAuthProvider({ children }) {
  const [authority, setAuthority] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pw_gov_authority')); } catch { return null; }
  });

  const login = (data) => {
    setAuthority(data);
    localStorage.setItem('pw_gov_authority', JSON.stringify(data));
  };

  const logout = () => {
    setAuthority(null);
    localStorage.removeItem('pw_gov_authority');
  };

  return (
    <GovAuthContext.Provider value={{ authority, login, logout }}>
      {children}
    </GovAuthContext.Provider>
  );
}

export const useGovAuth = () => useContext(GovAuthContext);
