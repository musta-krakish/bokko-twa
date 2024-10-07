"use client"

import { ApiService } from "@/lib/services/api_service";
import { User } from "@/lib/types";
import { useInitData } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

const RegisterForm: React.FC = () => {
    const initData = useInitData(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [post, setPost] = useState("");

    useEffect(() => {
        if (!initData) return;

        setFirstName(initData.user?.firstName || "");
        setLastName(initData.user?.lastName || "");
    }, [initData]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); 

        if (!initData) return;

        const user: User = {
            first_name: firstName,
            last_name: lastName,
            post,
            tg_id: initData.user?.id,
        };

        await ApiService.reg(user, initData.toString());
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Добро пожаловать в bokko bot</h1>
            <form onSubmit={handleRegister} className="bg-white shadow-md rounded-lg p-6 space-y-4 w-full max-w-md">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Имя</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Фамилия</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="post" className="block text-sm font-medium text-gray-700">Должность</label>
                    <input
                        type="text"
                        id="post"
                        value={post}
                        onChange={(e) => setPost(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Ввести
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;
