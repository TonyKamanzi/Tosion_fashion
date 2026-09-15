"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AdminUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
};

const AdminSessionContext = createContext<AdminUser | null>(null);

export function useAdminSession(): AdminUser {
    const user = useContext(AdminSessionContext);

    if (!user) {
        throw new Error("useAdminSession must be used within an AdminSessionProvider");
    }

    return user;
}

export default function AdminSessionProvider({
    user,
    children,
}: {
    user: AdminUser;
    children: ReactNode;
}) {
    return <AdminSessionContext.Provider value={user}>{children}</AdminSessionContext.Provider>;
}
