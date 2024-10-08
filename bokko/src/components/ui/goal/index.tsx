"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Goal, Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa"; 

const Goals: React.FC = () => {
    const initData = useInitData(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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
            }),
        }).toString();

        const fetchGoals = async () => {
            const data = await ApiService.getGoals(initDataStr);
            setGoals(data);
        };

        fetchGoals();
    }, [initData]);

    const fetchTasks = async (goal_id: string) => {
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

        const data = await ApiService.getTasks(initDataStr, goal_id);
        setTasks(data);
        setSelectedGoal(goals.find((goal) => goal._id === goal_id) || null);
    };

    const handleTaskCompletion = async (taskId: string) => {
        const updatedTasks = tasks.map((task) => 
            task._id === taskId ? { ...task, complite: !task.complite } : task
        );
        setTasks(updatedTasks);
    };

    return (
        <div className="relative flex flex-col text-black items-center p-4">
            <button
                onClick={() => window.location.href = '/calendar'}
                className="absolute top-4 right-4 text-white bg-blue-500 p-4 rounded-full shadow hover:bg-blue-600 transition">
                <FaCalendarAlt />
            </button>

            {goals.length > 0 ? (
                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-2">Ваши цели</h2>
                    <ul className="space-y-2">
                        {goals.map((goal) => (
                            <li
                                key={goal._id}
                                className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition"
                                onClick={() => fetchTasks(goal._id as string)}>
                                <h3 className="text-md font-medium">{goal.title}</h3>
                                <p className="text-sm text-gray-600">{goal.description}</p>

                                {selectedGoal?._id === goal._id && (
                                    <ul className="mt-2 pl-4 border-l border-gray-400">
                                        {tasks.length > 0 ? (
                                            tasks.map((task) => (
                                                <li key={task._id} className="p-2 flex items-center border border-gray-300 rounded-md">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={task.complite} 
                                                        onChange={() => handleTaskCompletion(task?._id || "")} 
                                                        className="mr-2"
                                                    />
                                                    <div>
                                                        <h4 className="text-md font-medium">{task.title}</h4>
                                                        <p className="text-sm text-gray-600">{task.description}</p>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">Нет задач для этой цели.</p>
                                        )}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <Link href={"/goal"}>
                    <p className="text-lg text-gray-500">У вас нет пока целей. Создайте их!</p>
                </Link>
            )}
        </div>
    );
};

export default Goals;
