import React, { useEffect, useState } from "react";
import socket from "../socket";
import BoardCard from "../components/BoardCard";

import { FaClipboard } from "react-icons/fa6";
import { IoIosAddCircle } from "react-icons/io";


const BoardsPage = () => {
    const [boards, setBoards] = useState([]);
    const [title, setTitle] = useState("");
    const host = process.env.REACT_APP_HOST;
    const by = 'Designed & developed by Vidun Hettiarachchi';

    const fetchBoards = async () => {
        const res = await fetch(`http://${host}:5000/api/boards`);
        const data = await res.json();
        setBoards(data);
    };

    const createBoard = async (e) => {
        e.preventDefault();
        const res = await fetch(`http://${host}:5000/api/boards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });
        const newBoard = await res.json();
        setBoards([...boards, newBoard]);
        setTitle("");
    };

    const deleteBoard = async (id) => {
        await fetch(`http://${host}:5000/api/boards/${id}`, {
            method: "DELETE",
        });
        setBoards(boards.filter((b) => b._id !== id));
    };

    useEffect(() => {
        fetchBoards();

        // Setup listeners
        socket.on("board-created", (board) => {
            setBoards(prev => [...prev, board]);
        });

        socket.on("board-deleted", (deletedId) => {
            setBoards(prev => prev.filter((b) => b._id !== deletedId));
        });

        return () => {
            socket.off("board-created");
            socket.off("board-deleted");
        };
    }, []);

    return (
        <div className="p-8 max-w-3xl mx-auto relative w-screen h-auto mb-4">
            <div className="border border-gray-900 rounded-3xl mb-5 flex justify-center gap-5 items-center p-3 h-16">
                <FaClipboard size={30} />
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    My Boards
                </h1>
            </div>
            <form onSubmit={createBoard} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="New Board Title"
                    className="flex-grow border border-gray-400 rounded-xl p-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="px-4 py-2 hover:scale-125 transition-transform duration-300 cursor-pointer"
                >
                    <IoIosAddCircle size={30} />
                </button>
            </form>

            <div className="space-y-4">
                {boards.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No boards available.</p>
                ) : (
                    boards.map((board) => (
                        <BoardCard key={board._id} board={board} onDelete={deleteBoard} />
                    ))
                )}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white shadow-md z-50 p-1 border text-xs">
                <p>{by}</p>
            </div>
        </div>
    );
};

export default BoardsPage;