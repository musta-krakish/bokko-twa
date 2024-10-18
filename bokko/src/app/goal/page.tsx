"use client"

import { ApiService } from "@/lib/services/api_service";
import { Goal } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface GoalsProps {
    goal?: Goal; // добавляем возможность передачи цели через пропсы
}

export default function Goals({ goal: initialGoal }: GoalsProps) {
    const initData = useInitData(true);
    const router = useRouter();
    const [goal, setGoal] = useState<Goal>(initialGoal || {
        title: '',
        description: '',
        deadline: new Date(),
    });
    const [modalContent, setModalContent] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (initialGoal) {
            setGoal(initialGoal); // Если цель передана, задаем её как текущую
        }
    }, [initialGoal]);

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
    };

    const handleAddTasks = () => {
        router.push(`/task?goal_id=${goal._id}`);
    };

    const handleAiHelp = async () => {
        if (!initData || !goal._id) return;

        const response = await ApiService.askGoal(goal._id, initData.authDate.toString());
        setModalContent(response);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    return (
        <div>
            <div className="fixed inset-0 flex text-black items-center justify-center bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    {initialGoal ? (
                        // Отображаем цель, если она передана в пропсах
                        <>
                            <h2 className="text-lg font-semibold mb-4">{goal.title}</h2>
                            <p className="mb-2">{goal.description}</p>
                            <p className="mb-4">Срок выполнения: {new Date(goal.deadline).toLocaleDateString()}</p>
                            <div className="flex justify-between">
                                <button
                                    onClick={handleAddTasks}
                                    className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                >
                                    Добавить задачи
                                </button>
                                <button
                                    onClick={handleAiHelp}
                                    className="w-full p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition ml-2"
                                >
                                    Помощь ИИ
                                </button>
                            </div>
                        </>
                    ) : (
                        // Интерфейс для создания новой цели
                        <>
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
                                        onChange={(e) => setGoal({ ...goal, title: e.target.value })}
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
                                        onChange={(e) => setGoal({ ...goal, description: e.target.value })}
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
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex text-black items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4">Результат Помощи ИИ</h2>
                        <p>{modalContent}</p>
                        <button
                            onClick={closeModal}
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
