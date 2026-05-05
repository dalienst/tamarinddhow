"use client";

import { useQuery } from "@tanstack/react-query";

import { getAccount } from "@/services/accounts";
import useAxiosAuth from "../authentication/useAxiosAuth";
import useUserCode from "../authentication/useUserCode";

export function useFetchAccount() {
    const usercode = useUserCode();
    const header = useAxiosAuth();

    return useQuery({
        queryKey: ["account", usercode],
        queryFn: () => getAccount(usercode!, header),
        enabled: !!usercode,
    });
}
