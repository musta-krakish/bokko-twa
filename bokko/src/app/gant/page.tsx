"use client"; // Ensure this component is client-side rendered

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

export default function Gantt() {
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [chartData, setChartData] = useState<Array<any>>([]);

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
            const formattedData: Array<any> = [
                [
                    { type: "string", id: "Task ID" },
                    { type: "string", id: "Task Name" },
                    { type: "string", id: "Resource" },
                    { type: "date", id: "Start Date" },
                    { type: "date", id: "End Date" },
                    { type: "number", id: "Duration" },
                    { type: "number", id: "Percent Complete" },
                    { type: "string", id: "Dependencies" },
                ],
            ];

            tasks.forEach((task) => {
                // Use default dates if the fields are not defined
                const startDate = task.create_date ? new Date(task.create_date) : new Date();
                const endDate = task.end_date ? new Date(task.end_date) : new Date(task.deadline);
                
                // Log if any date is invalid for debugging purposes
                if (!task.create_date) {
                    console.warn("Task has undefined create_date:", task);
                }
                if (!task.end_date) {
                    console.warn("Task has undefined end_date:", task);
                }
                if (!task.deadline) {
                    console.warn("Task has undefined deadline:", task);
                }

                // Add task data to the formatted data
                formattedData.push([
                    task._id || "",
                    task.title || "",
                    task.goal_id || "",
                    startDate,
                    endDate,
                    null, // Duration can be calculated or left null for auto-calculation
                    task.complite ? 100 : 0,
                    null, // Dependencies can be added if needed
                ]);
            });

            setChartData(formattedData);
        }
    }, [tasks]);

    const chartOptions = {
        height: 400,
        gantt: {
            trackHeight: 30,
        },
    };

    return (
        <div className="p-4 text-black bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Диаграмма Ганта</h2>
            {chartData.length > 1 ? (
                <Chart
                    chartType="Gantt"
                    data={chartData}
                    options={chartOptions}
                    width="100%"
                    height="400px"
                    loader={<div>Загрузка диаграммы Ганта...</div>}
                />
            ) : (
                <div>Нет задач для отображения</div>
            )}
        </div>
    );
}
