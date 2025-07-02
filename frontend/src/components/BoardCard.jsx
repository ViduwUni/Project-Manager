import React from "react";
import { Link } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";

const BoardCard = ({ board, onDelete }) => {
    return (
        <Link to={`/board/${board._id}`} className="block">
            <div className="bg-white shadow border rounded-lg p-4 hover:bg-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{board.title}</span>
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // prevent link navigation
                            onDelete(board._id);
                        }}
                        className="hover:text-red-700 font-bold cursor-pointer"
                    >
                        <IoIosCloseCircle size={25} />
                    </button>
                </div>

                {/* Progress Bar */}
                {"progress" in board && (
                    <div className="w-full bg-gray-200 h-2 rounded">
                        <div
                            className="h-2 rounded bg-green-500 transition-all duration-300"
                            style={{ width: `${board.progress}%` }}
                        ></div>
                    </div>
                )}
                {"progress" in board && (
                    <div className="text-xs text-gray-600">{board.progress}% done</div>
                )}
            </div>
        </Link>
    );
};

export default BoardCard;