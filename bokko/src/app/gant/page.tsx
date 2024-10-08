"use client";

import { useEffect, useState } from "react";

// Пример данных для задач
const tasks = [
    { id: 1, name: "Задача 1", start: "2024-09-09", end: "2024-09-12" },
    { id: 2, name: "Задача 2", start: "2024-09-10", end: "2024-09-15" },
    { id: 3, name: "Задача 3", start: "2024-09-12", end: "2024-09-17" },
    { id: 4, name: "Задача 4", start: "2024-09-13", end: "2024-09-16" },
];

// Функция для создания диапазона дат (например, от 9 до 17 сентября)
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
    const [dateRange, setDateRange] = useState<Date[]>([]);

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

    // Вычисляем позицию задачи (на каком дне она начинается)
    const calculateTaskPosition = (taskStart: string) => {
        const startDate = new Date(taskStart);
        const firstDate = dateRange[0];
        const diffTime = startDate.getTime() - firstDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            <div className="flex flex-col">
                {/* Сетка с датами */}
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

                {/* Отображение задач */}
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
