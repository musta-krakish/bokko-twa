"use client";

import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useEffect, useState } from "react";
import { ApiService } from "@/lib/services/api_service";
import type { Goal } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";

export default function GanttComponent() {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [goalId, setGoalId] = useState<string>("");
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
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

            try {
                const data = await ApiService.getTasks(initDataStr, goalId);
                const goal = await ApiService.getGoals(initDataStr);
                setGoals(goal);
                setTasks(
                    data.map((task: any) => ({
                        id: task._id!,
                        name: task.title,
                        start: new Date(task.create_date || task.deadline),
                        end: new Date(task.end_date || task.deadline),
                        progress: task.complite ? 100 : 0,
                        type: "task",
                    }))
                );
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [goalId, initData]);

    const handleGoalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setGoalId(event.target.value);
    };

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            <label htmlFor="goalSelect" className="block text-sm font-medium text-gray-700">
                Выберите цель:
            </label>
            <select
                id="goalSelect"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none"
                onChange={handleGoalChange}
            >
                <option value="">-- Выберите цель --</option>
                {goals.map((goal) => (
                    <option key={goal._id} value={goal._id}>
                        {goal.title}
                    </option>
                ))}
            </select>
            {loading ? (
                <div>Загрузка данных...</div>
            ) : (
                <Gantt
                    tasks={tasks}
                    viewMode={ViewMode.Day}
                    columnWidth={50}
                    listCellWidth="155px"
                />
            )}
        </div>
    );
}
