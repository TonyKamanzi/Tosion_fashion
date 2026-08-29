"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

export type CustomerUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt?: string;
};

type CustomerSessionValue = {
    user: CustomerUser | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
};

const CustomerSessionContext = createContext<CustomerSessionValue>({
    user: null,
    loading: true,
    refresh: async () => {},
    logout: async () => {},
});

export function CustomerSessionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CustomerUser | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const { data } = await axios.get<CustomerUser>(`${API_URL}/auth/me`, {
                withCredentials: true,
            });
            setUser(data);
        } catch (err) {
            // Only a rejected session clears the user; transient network errors
            // must not visually log someone out.
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setUser(null);
            }
        }
    }, []);

    useEffect(() => {
        void (async () => {
            await refresh();
            setLoading(false);
        })();
    }, [refresh]);

    const logout = useCallback(async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <CustomerSessionContext.Provider value={{ user, loading, refresh, logout }}>
            {children}
        </CustomerSessionContext.Provider>
    );
}

export function useCustomerSession() {
    return useContext(CustomerSessionContext);
}
