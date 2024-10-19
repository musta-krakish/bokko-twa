"use client"

import { ApiService } from "@/lib/services/api_service";
import { useInitData } from "@telegram-apps/sdk-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

function AiContent() {
    const initData = useInitData(true);
    const params = useSearchParams();
    const router = useRouter();
    const [text, setText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const goal_id = params.get("goal_id");

        const fetchData = async () => {
            if (!initData || !goal_id) return;

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
                }),
            }).toString();

            try {
                const data = await ApiService.askGoal(goal_id, initDataStr);
                setText(data.detail);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false); // Убираем индикатор загрузки после получения данных
            }
        };

        fetchData();
    }, [initData, params]);

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div>
            {loading ? (
                <div className="fixed inset-0 flex text-black items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4">Загрузка...</h2>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 flex text-black items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full overflow-auto">
                        <h2 className="text-lg font-semibold mb-4">Результат Помощи ИИ</h2>
                        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap">
                            <p>{text}</p>
                        </div>
                        <button
                            onClick={handleGoBack}
                            className="mt-4 w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Ai() {
    return (
        <React.Suspense fallback={<div>Загрузка...</div>}>
            <AiContent />
        </React.Suspense>
    );
}
