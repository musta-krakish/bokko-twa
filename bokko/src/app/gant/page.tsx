"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

export default function GanttComponent() {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
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
            }),
        }).toString();

        const fetchData = async () => {
            try {
                const data = await ApiService.getTasks(initDataStr);
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initData]);

    const renderGanttChart = () => {
        const today = new Date();
        const chartDays = 14; // Количество дней для отображения диаграммы
        const startDate = new Date(today);
        const tasksToRender = tasks.map((task) => {
            const start = task.create_date ? new Date(task.create_date) : today;
            const end = task.end_date ? new Date(task.end_date) : task.deadline;

            // Проверка на даты
            if (!(start instanceof Date) || isNaN(start.getTime())) return null;
            if (!(end instanceof Date) || isNaN(end.getTime())) return null;

            const offset = Math.floor((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            return (
                <div
                    key={task._id}
                    className={`absolute bg-gray-400 text-white text-center rounded p-1`}
                    style={{
                        left: `${(offset / chartDays) * 100}%`,
                        width: `${(duration / chartDays) * 100}%`,
                        top: `${tasks.indexOf(task) * 50}px`, // смещение по вертикали
                    }}
                >
                    {task.title}
                </div>
            );
        });

        return <div className="relative h-64 bg-gray-200">{tasksToRender}</div>;
    };

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            {loading ? (
                <div>Загрузка данных...</div>
            ) : tasks.length > 0 ? (
                renderGanttChart()
            ) : (
                <div>Нет задач для отображения</div>
            )}
        </div>
    );
}
