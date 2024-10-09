"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Goal, Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useRouter } from "next/navigation";

export default function GanttComponent() {
    const initData = useInitData(true);
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [goalId, setGoalId] = useState<string>("");
    const [goals, setGoals] = useState<Goal[]>([]);

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
                let data;
                if (goalId)
                    data = await ApiService.getTasks(initDataStr, goalId);
                else
                    data = await ApiService.getTasks(initDataStr);
                const goal = await ApiService.getGoals(initDataStr);
                setGoals(goal);
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initData, goalId]);

    const handleGoBack = () => {
        router.back()
    }

    const renderGanttChart = () => {
        const currentMonth = dayjs(currentDate).month();
        const currentYear = dayjs(currentDate).year();
        const daysInMonth = dayjs(`${currentYear}-${currentMonth + 1}-01`).daysInMonth();
        const startDate = dayjs(`${currentYear}-${currentMonth + 1}-01`);

        const tasksToRender = tasks.map((task, index) => {
            const start = task.create_date ? dayjs(task.create_date) : dayjs();
            const end = task.end_date ? dayjs(task.end_date) : dayjs(task.deadline);

            if (!start.isValid() || !end.isValid()) return null;

            const offset = start.diff(startDate, "day");
            const duration = end.diff(start, "day") + 1;

            return (
                <div
                    key={task._id}
                    className="absolute bg-gray-400 text-white text-center rounded p-1"
                    style={{
                        left: `${(offset / daysInMonth) * 100}%`,
                        width: `${(duration / daysInMonth) * 100}%`,
                        top: `${index * 50}px`,
                        transition: "all 0.3s ease",
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
                        className={`p-2 cursor-pointer text-center rounded-md ${currentDay.isSame(currentDate, "day") ? "bg-gray-300" : "bg-gray-100"
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
            <div className="flex items-center space-x-2 mb-4">
                <button onClick={handleGoBack} className="text-lg font-semibold">
                    &lt;
                </button>
                <h2 className="text-lg font-semibold">Диаграмма ганта</h2>
            </div>
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

