"use client"

import { ApiService } from "@/lib/services/api_service";
import { Goal } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Goals() {
    const initData = useInitData(true);
    const router = useRouter();
    const [goal, setGoal] = useState<Goal>({
        title: '',
        description: '',
        deadline: new Date(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGoal((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

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
            }),
        }).toString();

        await ApiService.createGoal(goal, initDataStr);
        setGoal({ title: '', description: '', deadline: new Date() });

    };

    const handleGoBack = () => {
        router.back();
    }

    return (
        <div>
            <div className="fixed inset-0 flex text-black items-center justify-center bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex items-center space-x-2 mb-4">
                        <button onClick={handleGoBack} className="text-lg font-semibold">
                            &lt;
                        </button>
                        <h2 className="text-lg font-semibold">Создать цель</h2>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block mb-1" htmlFor="title">Название:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={goal.title}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block mb-1" htmlFor="description">Описание:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={goal.description}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block mb-1" htmlFor="deadline">Срок выполнения:</label>
                            <input
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={goal.deadline.toISOString().substring(0, 10)}
                                onChange={(e) => setGoal({ ...goal, deadline: new Date(e.target.value) })}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                            Создать Цель
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};
