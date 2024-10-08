"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Task, Goal } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function TaskContent() {
    const initData = useInitData(true);
    const params = useSearchParams();
    const router = useRouter();
    const [task, setTask] = useState<Task>({
        title: "",
        description: "",
        deadline: new Date(),
        complite: false,
    });
    const [goalId, setGoalId] = useState<string>("");
    const [goals, setGoals] = useState<Goal[]>();
    const [createAnother, setCreateAnother] = useState<boolean>(false); // Добавлен чекбокс

    useEffect(() => {
        const goal = params.get("goal_id");

        const fetchData = async () => {
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

            const data = await ApiService.getGoals(initDataStr);
            setGoals(data);
        };

        if (goal) setGoalId(goal);
        else {
            fetchData();
        }
    }, [initData]);

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

        await ApiService.createTask(goalId, task, initDataStr);
        if (createAnother) {
            setTask({ title: "", description: "", deadline: new Date(), complite: false });
        } else {
            router.back();
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-gray-100 text-black rounded-md shadow-md">
            {!goalId && goals ? (
                <div>
                    <label htmlFor="goalSelect" className="block text-sm font-medium text-gray-700">
                        Выберите цель:
                    </label>
                    <select
                        id="goalSelect"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                        onChange={(e) => setGoalId(e.target.value)}
                    >
                        <option value="">-- Выберите цель --</option>
                        {goals.map((goal) => (
                            <option key={goal._id} value={goal._id}>
                                {goal.title}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <form onSubmit={handleCreate} className="mt-4">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Название задачи:
                        </label>
                        <input
                            id="title"
                            type="text"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                            value={task.title}
                            onChange={(e) => setTask({ ...task, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Описание задачи:
                        </label>
                        <textarea
                            id="description"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                            value={task.description}
                            onChange={(e) => setTask({ ...task, description: e.target.value })}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                            Дедлайн:
                        </label>
                        <input
                            id="deadline"
                            type="date"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                            value={dayjs(task.deadline).format("YYYY-MM-DD")}
                            onChange={(e) =>
                                setTask({ ...task, deadline: new Date(e.target.value) })
                            }
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="createAnother" className="inline-flex items-center">
                            <input
                                id="createAnother"
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                                checked={createAnother}
                                onChange={() => setCreateAnother(!createAnother)}
                            />
                            <span className="ml-2">Создать еще одну задачу</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600"
                    >
                        Создать задачу
                    </button>
                </form>
            )}
        </div>
    );
}

export default function Task() {
    return (
        <React.Suspense fallback={<div>loading...</div>}>
            <TaskContent />
        </React.Suspense>
    );
}
