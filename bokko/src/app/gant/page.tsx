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
        const currentMonth = today.getMonth(); // текущий месяц
        const currentYear = today.getFullYear(); // текущий год

        // Определяем количество дней в месяце
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const startDate = new Date(currentYear, currentMonth, 1); // начало месяца

        const tasksToRender = tasks.map((task) => {
            const start = task.create_date ? new Date(task.create_date) : today;
            const end = task.end_date ? new Date(task.end_date) : task.deadline;

            // Проверка на корректность дат
            if (!(start instanceof Date) || isNaN(start.getTime())) return null;
            if (!(end instanceof Date) || isNaN(end.getTime())) return null;

            const offset = Math.floor((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); // смещение относительно начала месяца
            const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); // продолжительность задачи

            return (
                <div
                    key={task._id}
                    className={`absolute bg-gray-400 text-white text-center rounded p-1`}
                    style={{
                        left: `${(offset / daysInMonth) * 100}%`, // смещение по дням месяца
                        width: `${(duration / daysInMonth) * 100}%`, // продолжительность по дням месяца
                        top: `${tasks.indexOf(task) * 50}px`, // вертикальное смещение для каждой задачи
                    }}
                >
                    {task.title}
                </div>
            );
        });

        // Отображаем календарь для текущего месяца
        const renderCalendarHeader = () => {
            const days = [];
            for (let day = 1; day <= daysInMonth; day++) {
                days.push(
                    <div key={day} className="inline-block w-8 text-center">
                        {day}
                    </div>
                );
            }
            return <div className="flex justify-between mb-2">{days}</div>;
        };

        return (
            <div className="relative">
                {renderCalendarHeader()}
                <div className="relative h-64 bg-gray-200">{tasksToRender}</div>
            </div>
        );
    };

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта (Месяц)</h2>
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
