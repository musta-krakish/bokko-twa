"use client"

import { ApiService } from "@/lib/services/api_service";
import { useInitData } from "@telegram-apps/sdk-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';  // Поддержка Markdown

function AiContent() {
    const initData = useInitData(true);
    const params = useSearchParams();
    const router = useRouter();
    const [text, setText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const goal_id = params.get("goal_id");

    useEffect(() => {
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
                setLoading(false);
            }
        };

        fetchData();
    }, [initData, params]);

    const handleGoTask = (goal_id: string) => {
        router.push(`/task?goal_id=${goal_id}`);
    };

    return (
        <div className="container mx-auto text-black p-6">
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <h2 className="text-lg font-semibold">Загрузка...</h2>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Результат Помощи ИИ</h2>
                    <div className="bg-white p-4 shadow-md rounded-lg max-h-[75vh] overflow-auto"> 
                        <ReactMarkdown className="whitespace-pre-wrap">{text}</ReactMarkdown>
                    </div>
                    <button
                        onClick={() => handleGoTask(goal_id || "")}
                        className="mt-4 w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        Перейти к задачам
                    </button>
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
