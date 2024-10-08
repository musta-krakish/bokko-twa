"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/services/api_service"; // Импортируйте ваш API сервис
import { useInitData } from "@telegram-apps/sdk-react";

interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
}

// Функция для создания диапазона дат
const generateDateRange = (startDate: string, endDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};

export default function GanttComponent() {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [dateRange, setDateRange] = useState<Date[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!initData)
            return

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

        const fetchTasks = async () => {
            try {
                const fetchedTasks = await ApiService.getTasks(initDataStr); // Замените на ваш метод API
                setTasks(fetchedTasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [initData]);

    useEffect(() => {
        const start = "2024-09-09";  // Начало диапазона
        const end = "2024-09-17";    // Конец диапазона
        const range = generateDateRange(start, end);
        setDateRange(range);
    }, []);

    // Вычисляем длину задачи в днях
    const calculateTaskWidth = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1; // Учитываем оба дня
    };

    // Вычисляем позицию задачи
    const calculateTaskPosition = (taskStart: string) => {
        const startDate = new Date(taskStart);
        const firstDate = dateRange[0];

        // Проверка на наличие первой даты
        if (!firstDate) return 0;

        const diffTime = startDate.getTime() - firstDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return <div className="text-center">Загрузка задач...</div>;
    }

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            <div className="flex flex-col">
                <div className="flex">
                    {dateRange.map((date, index) => (
                        <div
                            key={index}
                            className="text-center p-2 border border-gray-300"
                            style={{ width: "60px" }}
                        >
                            {date.getDate()} {date.toLocaleString("ru-RU", { weekday: "short" })}
                        </div>
                    ))}
                </div>
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center"
                        style={{
                            marginTop: "10px",
                            marginLeft: `${calculateTaskPosition(task.start) * 60}px`,
                        }}
                    >
                        <div
                            className="bg-gray-300 p-2 rounded-full text-center"
                            style={{
                                width: `${calculateTaskWidth(task.start, task.end) * 60}px`,
                            }}
                        >
                            {task.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
