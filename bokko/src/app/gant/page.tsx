"use client"; // Ensure this component is client-side rendered

import { ApiService } from "@/lib/services/api_service";
import type { Task } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";


export default function Gant(){
    const initData = useInitData(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

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
            const formattedData = [
                [
                    "Task ID",
                    "Task Name",
                    "Resource",
                    "Start Date",
                    "End Date",
                    "Duration",
                    "Percent Complete",
                    "Dependencies",
                ],
            ];

            tasks.forEach((task) => {
                const startDate = task.create_date ? new Date(task.create_date) : new Date();
                const endDate = task.end_date ? new Date(task.end_date) : new Date(task.deadline);

                formattedData.push([
                    task._id || "",
                    task.title,
                    task.goal_id || "",
                    startDate.toString(),
                    endDate.toDateString(),
                    "fd",
                    task.complite ? "100" : "0",
                    "te"
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