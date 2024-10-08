"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru"; // для отображения дат на русском

export default function GanttComponent() {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

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
        const currentMonth = dayjs(currentDate).month();
        const currentYear = dayjs(currentDate).year();
        const daysInMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).daysInMonth();
        const startDate = dayjs(`${currentYear}-${currentMonth + 1}-01`);

        const tasksToRender = tasks.map((task, index) => {
            const start = task.create_date ? dayjs(task.create_date) : dayjs();
            const end = task.end_date ? dayjs(task.end_date) : dayjs(task.deadline);

            // Проверяем, что даты валидны
            if (!start.isValid() || !end.isValid()) return null;

            // Рассчитываем смещение и продолжительность
            const offset = start.diff(startDate, "day"); // смещение относительно начала месяца
            const duration = end.diff(start, "day") + 1; // продолжительность задачи

            return (
                <div
                    key={task._id}
                    className="absolute bg-gray-400 text-white text-center rounded p-1"
                    style={{
                        left: `${(offset / daysInMonth) * 100}%`, // смещение по дням месяца
                        width: `${(duration / daysInMonth) * 100}%`, // ширина задачи
                        top: `${index * 50}px`, // вертикальное смещение для каждой задачи
                        transition: "all 0.3s ease", // добавление анимации для плавности
                    }}
                >
                    {task.title}
                </div>
            );
        });

        const renderCalendarHeader = () => {
            const days = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDay = dayjs(`${currentYear}-${currentMonth + 1}-${day}`);
                days.push(
                    <div
                        key={day}
                        className={`p-2 cursor-pointer text-center rounded-md ${
                            currentDay.isSame(currentDate, "day") ? "bg-gray-300" : "bg-gray-100"
                        }`}
                        onClick={() => setCurrentDate(currentDay.toDate())}
                    >
                        <div>{day}</div>
                        <div>{currentDay.format("dd").toUpperCase()}</div>
                    </div>
                );
            }
            return <div className="flex space-x-4 overflow-x-auto pb-4">{days}</div>;
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

