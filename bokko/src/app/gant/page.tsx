"use client";

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const GanttChartComponent: React.FC = () => {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);

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
            const data = await ApiService.getTasks(initDataStr);
            setTasks(data);
        };

        fetchData();
    }, [initData]);

    useEffect(() => {
        if (tasks.length > 0) {
            const formattedTasks: GanttTask[] = tasks.map((task) => ({
                id: task._id || "",
                name: task.title,
                start: new Date(task.create_date || new Date()),
                end: new Date(task.end_date || task.deadline),
                type: "task",
                progress: task.complite ? 100 : 0,
                isDisabled: task.complite,
                project: task.goal_id || undefined,
            }));

            setGanttTasks(formattedTasks);
        }
    }, [tasks]);

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Day}
                locale="ru" // This sets the locale to Russian
            />
        </div>
    );
};

export default GanttChartComponent;
