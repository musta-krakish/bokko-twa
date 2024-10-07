"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs"; 

interface CalendarProps {
    curDate: Date;
}

const CalendarComponent: React.FC<CalendarProps> = ({ curDate }) => {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [date, setDate] = useState<Date>(curDate);

    const generateDays = () => {
        const days = [];
        for (let i = 0; i < 30; i++) {
            days.push(dayjs(curDate).add(i, 'day').toDate());
        }
        return days;
    };

    const days = generateDays();

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
            const data = await ApiService.getTasks(initDataStr, null, date);
            setTasks(data);
        };

        fetchData();
    }, [initData, date]);

    return (
        <div className="p-4 text-black max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Мой календарь</h2>

            {/* Прокручиваемая панель дат */}
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`p-2 cursor-pointer text-center rounded-md ${
                            dayjs(day).isSame(date, 'day') ? 'bg-gray-300' : 'bg-gray-100'
                        }`}
                        onClick={() => setDate(day)}
                    >
                        <div>{dayjs(day).format('D')}</div>
                        <div>{dayjs(day).format('dd').toUpperCase()}</div>
                    </div>
                ))}
            </div>

            {/* Список задач на выбранную дату */}
            <div className="mt-4">
                <h3 className="text-md font-bold mb-2">Задачи на {dayjs(date).format('D MMMM YYYY')}:</h3>
                {tasks.length === 0 ? (
                    <div className="text-center text-gray-500">
                        У вас нет задач на день<br />Можно отдыхать!
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {tasks.map((task) => (
                            <li key={task._id} className="bg-gray-100 p-2 rounded-md shadow-sm">
                                <p className="font-semibold">{task.title}</p>
                                <p className="text-gray-600">{task.description}</p>
                                <p className="text-xs text-gray-500">Срок: {dayjs(task.deadline).format('D MMM YYYY')}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Кнопки управления */}
            <div className="mt-6 flex justify-between">
                <button className="p-2 bg-gray-200 rounded-md text-sm">Диаграмма Ганта</button>
                <button className="p-2 bg-gray-200 rounded-md text-sm">+ Добавить задачу</button>
            </div>
        </div>
    );
};

export default CalendarComponent;
