/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/app/components/Loader";

type SessionContextType = {
  session: any;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();
  const [storedSession, setStoredSession] = useState<any>(null);

  useEffect(() => {
    if (session) {
      setStoredSession(session);
    }
  }, [session]);

  if (status === "loading") {
    return <Loader />; // Show the loader while session is loading
  }
  return (
    <SessionContext.Provider
      value={{
        session: storedSession,
        loading: true,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => useContext(SessionContext);
