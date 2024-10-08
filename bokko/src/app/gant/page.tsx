"use client"; 

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function GanttComponent() {
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
            try {
                const data = await ApiService.getTasks(initDataStr);
                setTasks(data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchData();
    }, [initData]);

    useEffect(() => {
        if (tasks.length > 0) {
            const formattedTasks: GanttTask[] = tasks.map((task) => {
                const start = task.create_date ? new Date(task.create_date) : new Date();
                const end = task.end_date ? new Date(task.end_date) : new Date(task.deadline);

                return {
                    id: task._id || "",
                    name: task.title,
                    start,
                    end,
                    type: "task",
                    progress: task.complite ? 100 : 0,
                    isDisabled: false,
                };
            });

            setGanttTasks(formattedTasks);
        }
    }, [tasks]);

    const containerStyle: React.CSSProperties = {
        overflowX: "auto",  // Allow horizontal scrolling
        whiteSpace: "nowrap", // Prevent line breaks in the content
        borderRadius: "8px",  // Add rounded corners
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // Add shadow
        padding: "8px", // Add some padding
    };

    const chartOptions = {
        viewMode: ViewMode.Day,
        headerHeight: 50,
        columnWidth: 60, // Adjust width for a more compact display
        taskListWidth: 200, // Adjust task name column width
        barHeight: 30, // Adjust height of task bars
        margin: {
            left: 15,
            right: 15,
            top: 50,
            bottom: 30,
        },
    };

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            {ganttTasks.length > 0 ? (
                <div style={containerStyle}>
                    <Gantt tasks={ganttTasks} {...chartOptions} />
                </div>
            ) : (
                <div>Нет задач для отображения</div>
            )}
        </div>
    );
}
