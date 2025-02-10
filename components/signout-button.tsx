"use client";

import {useRouter } from "next/navigation";
import { authClient } from "@/auth-client";
import LoadingButton from "@/components/loading-button";
import { useState } from "react";

export default function SignOutButton() {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    const handleSignOut = async () => {
        try {
            setPending(true);
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in");
                    }
                }
            });
            router.push("/sign-in");
        
        } catch (error) {
            console.error("Error signing out", error);
        } finally {
            setPending(false);
        }   
    }
    return (
		<LoadingButton pending={pending} onClick={handleSignOut}>
			Sign Out
		</LoadingButton>
	);
}