'use client';

import { ApiService } from '@/lib/services/api_service';
import type { Goal, Task } from '@/lib/types';
import { useInitData } from '@telegram-apps/sdk-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';
import { Button } from '../button';

const Goals: React.FC = () => {
    const initData = useInitData(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    const router = useRouter();

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
        const updatedTasks = tasks.map((task) => (task._id === taskId ? { ...task, complite: !task.complite } : task));
        setTasks(updatedTasks);
    };

    const handleGoalClick = () => {
        router.push('/goal');
    };

    const completedTasks = tasks.filter((task) => task.complite);

    return (
        <div className="relative flex flex-col gap-4 text-black w-full flex-1 p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-[500]">Мои цели</h2>
                {goals.length > 0 ? (
                    <Button onClick={() => (window.location.href = '/calendar')} variant="outline" size="icon">
                        <FaCalendarAlt className="text-primary" />
                    </Button>
                ) : null}
            </div>

            <Button onClick={handleGoalClick} className="text-xl font-semibold w-full h-[50px]">
                <FaPlus size={10} /> Добавить цель
            </Button>

            {goals.length > 0 ? (
                <ul className="space-y-2">
                    {goals.map((goal) => (
                        <li
                            key={goal._id}
                            className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => fetchTasks(goal._id as string)}
                        >
                            <div className="flex items-center w-full justify-between">
                                <div className="flex flex-col">
                                    <h3 className="text-md font-medium">{goal.title}</h3>
                                    <p className="text-sm text-gray-600">{goal.description}</p>
                                </div>
                                {selectedGoal?._id === goal._id && tasks.length > 0 && (
                                    <p>
                                        {completedTasks.length}/{tasks.length}
                                    </p>
                                )}
                            </div>

                            {selectedGoal?._id === goal._id && (
                                <ul className="mt-2 pl-4 border-l border-gray-400">
                                    {tasks.length > 0 ? (
                                        tasks.map((task) => (
                                            <li
                                                key={task._id}
                                                className="p-2 flex items-center border border-gray-300 rounded-md"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={task.complite}
                                                    // onChange={() => handleTaskCompletion(task?._id || '')}
                                                    className="mr-2"
                                                    disabled
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
            ) : (
                <div className="flex flex-col gap-28 mt-28">
                    <p className="text-lg text-center">У вас пока нет записанных целей</p>
                    <Button onClick={handleGoalClick} className="text-xl font-semibold w-full h-[50px]">
                        <FaPlus size={10} /> Добавить цель
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Goals;
