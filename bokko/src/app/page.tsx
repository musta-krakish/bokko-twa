"use client";

import RegisterForm from "@/components/register-form";
import Goals from "@/components/ui/goal";
import { ApiService } from "@/lib/services/api_service";
import { User } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
    const initData = useInitData(true);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null); 
    const [loading, setLoading] = useState<boolean>(true); 

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

        const fetchMe = async () => {
            try {
                const user = await ApiService.me(initDataStr);
                setUser(user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false); 
            }
        };

        fetchMe();
    }, [initData]);

    const handleGoalClick = () => {
        router.push("/goal");
    };

    return (
        <div className="min-h-screen flex flex-col text-black items-center justify-start bg-gray-100 py-6 space-y-6">
            {loading ? ( 
                <div className="text-center text-gray-700">Загрузка данных...</div>
            ) : !user ? (
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <RegisterForm />
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <h1 className="text-xl font-bold mb-4">{user.first_name} {user.last_name}!</h1>
                    <p className="text-gray-700">Должность: {user.post}</p>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <Goals />
                <div className="flex justify-center mt-4">
                    <button 
                        onClick={handleGoalClick} 
                        className="bg-gray-500 text-white text-lg py-3 px-6 rounded-full hover:bg-gray-600 transition duration-300"
                    >
                        + Добавить цель
                    </button>
                </div>
            </div>
        </div>
    );
}
