"use client"

import { useFetchAccount } from "@/hooks/accounts/actions"

export default function DhowManagerDashboard() {
    const { data: account, isLoading, error } = useFetchAccount()
    console.log(account, isLoading, error)
    return (
        <div>
            <h1>Dhow Manager Dashboard</h1>
        </div>
    )
}