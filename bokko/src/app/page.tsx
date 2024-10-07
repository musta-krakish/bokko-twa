"use client"

import RegisterForm from "@/components/register-form";
import { ApiService } from "@/lib/services/api_service";
import { User } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

export default function Home() {
    const initData = useInitData(true);
    const [user, setUser] = useState<User | null>(null); 
    const [error, setError] = useState<string | null>(null); 

    useEffect(() => {
        if (!initData) return;

        const initDataStr = new URLSearchParams({
            query_id: initData.queryId as string,
            auth_date: (initData.authDate.getTime() / 1000).toString(),
            hash: initData.hash,
            user: JSON.stringify({
                id: initData.user?.id,
                first_name: initData.user?.firstName,
                last_name: initData.user?.lastName,
                username: initData.user?.username,
                language_code: initData.user?.languageCode,
                is_premium: initData.user?.isPremium,
                allows_write_to_pm: initData.user?.allowsWriteToPm,
            })
        }).toString();

        console.log("initDataStr:", initDataStr);

        const fetchMe = async () => {
            try {
                const user = await ApiService.me(initDataStr);
                setUser(user);
            } catch (err) {
                setError("Не удалось загрузить данные пользователя.");
                console.error(err);
            }
        };

        fetchMe();
    }, [initData]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {!user ? (
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    {error ? (
                        <div className="text-red-500 mb-4">{error}</div>
                    ) : (
                        <RegisterForm />
                    )}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <h1 className="text-xl font-bold mb-4">Добро пожаловать, {user.first_name} {user.last_name}!</h1>
                    <p className="text-gray-700">Должность: {user.post}</p>
                </div>
            )}
        </div>
    );
}