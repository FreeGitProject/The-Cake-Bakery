"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type SessionContextType = {
  session: any;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [storedSession, setStoredSession] = useState<any>(null);

  useEffect(() => {
    if (session) {
      setStoredSession(session);
    }
  }, [session]);

  return (
    <SessionContext.Provider
      value={{
        session: storedSession,
        loading: status === "loading",
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => useContext(SessionContext);
