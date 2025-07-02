import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tooltip } from "antd";
import { toast } from 'react-toastify';
import socket from "../socket";
import CustomSelect from "../components/CustomSelect";
import CustomInput from "../components/CustomInput";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash2, FiEye, FiX, FiEdit3, FiCheck, FiXCircle, FiPlus } from "react-icons/fi";
import { IoChevronBackCircle } from "react-icons/io5";
import { MdAddTask } from "react-icons/md";

const PRIORITIES = ["Low", "Medium", "High"];
const HOST = process.env.REACT_APP_HOST;

const TaskCard = ({ task, onShowDescription }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task._id });

    const [priority, setPriority] = useState(task.priority || "Low");

    const cyclePriority = async () => {
        const newPriority = PRIORITIES[(PRIORITIES.indexOf(priority) + 1) % PRIORITIES.length];
        setPriority(newPriority);

        try {
            await fetch(`http://${HOST}:5000/api/tasks/${task._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priority: newPriority }),
            });
        } catch (err) {
            console.error("Failed to update priority", err);
        }
    };

    const getPriorityColor = (priority) => {
        return {
            High: "bg-red-500",
            Medium: "bg-yellow-400",
            Low: "bg-green-500",
        }[priority] || "bg-green-500";
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition || "transform 200ms ease",
                opacity: isDragging ? 0.5 : 1,
            }}
            className="bg-white p-2 mb-2 rounded shadow flex items-center justify-between gap-2 select-none"
        >
            <div className="cursor-grab" {...attributes} {...listeners}>
                {task.title}
            </div>
            <Tooltip title={`Priority: ${priority}`}>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        cyclePriority();
                    }}
                    className={`w-4 h-4 rounded-full cursor-pointer ml-2 ${getPriorityColor(priority)}`}
                />
            </Tooltip>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onShowDescription(task);
                }}
                className="ml-auto text-gray-500 hover:text-blue-600"
            >
                <FiEye />
            </button>
        </div>
    );
};

const TaskDescriptionModal = ({ task, onClose, onTaskUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task?.title || "");
    // descriptions is now an array of { content: string, createdAt: Date }
    const [editedDescriptions, setEditedDescriptions] = useState([]);

    useEffect(() => {
        if (task) {
            setEditedTitle(task.title || "");
            // initialize with task.descriptions or fallback to array with one description
            setEditedDescriptions(task.descriptions?.length ? task.descriptions : [{ content: "", createdAt: new Date() }]);
            setIsEditing(false);
        }
    }, [task]);

    // Update a specific description content by index
    const updateDescription = (index, newContent) => {
        setEditedDescriptions(descs => {
            const newDescs = [...descs];
            newDescs[index].content = newContent;
            return newDescs;
        });
    };

    // Add a new empty description
    const addDescription = () => {
        setEditedDescriptions(descs => [...descs, { content: "", createdAt: new Date() }]);
    };

    // Remove a description by index
    const removeDescription = (index) => {
        setEditedDescriptions(descs => descs.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`http://${HOST}:5000/api/tasks/${task._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editedTitle,
                    descriptions: editedDescriptions,
                }),
            });

            if (res.ok) {
                const updatedTask = await res.json();
                onTaskUpdate(updatedTask);
                setIsEditing(false);
                onClose();
            } else {
                alert("Failed to update task");
            }
        } catch (err) {
            console.error("Error updating task:", err);
        }
    };

    if (!task) return null;

    // Helper to detect if text looks like code block (simple heuristic)
    const isCodeBlock = (text) => {
        // e.g. if it contains typical code chars or lines
        return /[\{\};=<>]/.test(text) || text.split('\n').length > 3;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-lg p-6 shadow-xl w-96 relative max-h-[80vh] overflow-auto"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                    >
                        <FiX size={20} />
                    </button>

                    <input
                        className="text-xl font-semibold border-b w-full mb-4 p-1"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        disabled={!isEditing}
                    />

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {editedDescriptions.map((desc, i) => (
                            <div key={i} className="border rounded p-2 relative">
                                {isEditing ? (
                                    <>
                                        <textarea
                                            className="w-full p-2 text-sm font-mono"
                                            rows={4}
                                            value={desc.content}
                                            onChange={(e) => updateDescription(i, e.target.value)}
                                            placeholder="Add description or paste code here..."
                                        />
                                        <button
                                            onClick={() => removeDescription(i)}
                                            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                                            title="Remove this description"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {isCodeBlock(desc.content) ? (
                                            <SyntaxHighlighter language="javascript" style={coy} className="rounded">
                                                {desc.content}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{desc.content || "No description."}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <button
                            onClick={addDescription}
                            className="flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-800"
                        >
                            <FiPlus /> Add Description
                        </button>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
                                >
                                    <FiCheck /> Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedTitle(task.title);
                                        setEditedDescriptions(task.descriptions?.length ? task.descriptions : [{ content: "", createdAt: new Date() }]);
                                    }}
                                    className="bg-gray-300 px-3 py-1 rounded flex items-center gap-1"
                                >
                                    <FiXCircle /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
                            >
                                <FiEdit3 /> Edit
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const Column = ({ column, children }) => {
    const { setNodeRef } = useDroppable({ id: column._id });

    return (
        <div
            ref={setNodeRef}
            className="bg-gray-100 p-4 rounded min-h-[100px] transition-all"
        >
            {children}
        </div>
    );
};

const TrashBin = () => {
    const { setNodeRef, isOver } = useDroppable({ id: "trash" });

    return (
        <div
            ref={setNodeRef}
            className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
                ${isOver ? "bg-red-600 text-white scale-110 animate-wiggle" : "bg-white text-red-600"}
            `}
        >
            <FiTrash2 className="text-2xl" />
        </div>
    );
};

const useTrashSound = () => {
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = new Audio('/sounds/Trash.wav');
        audioRef.current = audio;

        const enableAudio = () => {
            audio.play().catch(() => { });
            audio.pause();
            audio.currentTime = 0;
            window.removeEventListener("click", enableAudio);
        };

        window.addEventListener("click", enableAudio);
    }, []);

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }
    };

    return playSound;
};

const KanbanBoardPage = () => {
    const { id: boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [selectedColumnId, setSelectedColumnId] = useState("");
    const [newColumnName, setNewColumnName] = useState("");
    const [editingColumn, setEditingColumn] = useState(null);
    const [renamedColumnName, setRenamedColumnName] = useState("");
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [renamedBoardTitle, setRenamedBoardTitle] = useState("");
    const [viewingTask, setViewingTask] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        })
    );
    const playTrashSound = useTrashSound();
    const navigate = useNavigate();

    useEffect(() => {
        if (!boardId) return;

        fetchBoard();
        fetchTasks();
        socket.emit("join-board", boardId);

        socket.on("new-task", (task) => {
            setTasks((prev) => [...prev, task]);
        });

        socket.on("task-updated", (updatedTask) => {
            if (!updatedTask?._id) return;
            setTasks((prev) =>
                prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
            );
        });

        socket.on("task-deleted", (taskId) => {
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
        });

        socket.on("column-updated", (updatedBoard) => {
            setBoard(updatedBoard);
        });

        socket.on("column-deleted", (columnId) => {
            setBoard((prevBoard) => ({
                ...prevBoard,
                columns: prevBoard.columns.filter((col) => col._id !== columnId),
            }));
            setTasks((prev) => prev.filter((t) => t.columnId !== columnId));
        });

        return () => {
            socket.off("new-task");
            socket.off("task-updated");
            socket.off("task-deleted");
            socket.off("column-updated");
            socket.off("column-deleted");
        };
    }, [boardId]);

    const fetchBoard = async () => {
        try {
            const res = await fetch(`http://${HOST}:5000/api/boards/${boardId}`);
            if (!res.ok) throw new Error("Board not found");
            const data = await res.json();
            setBoard(data);
            if (data.columns.length > 0) setSelectedColumnId(data.columns[0]._id);
        } catch {
            alert("⚠️ This board no longer exists or was deleted.");
            window.location.href = "/";
        }
    };

    const fetchTasks = async () => {
        const res = await fetch(`http://${HOST}:5000/api/tasks/${boardId}`);
        const data = await res.json();
        setTasks(data);
    };

    const addTask = async () => {
        if (!newTaskTitle || !selectedColumnId) return;
        const res = await fetch(`http://${HOST}:5000/api/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                boardId,
                columnId: selectedColumnId,
                title: newTaskTitle,
                description: newTaskDescription,
            }),
        });
        if (res.ok) {
            const newTask = await res.json();
            socket.emit("new-task", newTask); // Socket will handle adding it
            setNewTaskTitle("");
            setNewTaskDescription("");
        }
    };

    const addColumn = async () => {
        const res = await fetch(`http://${HOST}:5000/api/boards/${boardId}/columns`);
        if (res.ok) {
            const data = await res.json();
            setBoard(data);
            const newColumn = data.columns.find((c) => c.name === newColumnName);
            if (newColumn) {
                socket.emit("column-updated", newColumn);
            }
            setNewColumnName("");
        } else {
            const error = await res.text();
            console.error("Add column failed:", error);
            alert("Failed to add column.");
        }
    };

    const renameColumn = async () => {
        if (!renamedColumnName) return;
        const res = await fetch(
            `http://${HOST}:5000/api/boards/${boardId}/columns/${editingColumn}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: renamedColumnName }),
            }
        );
        const data = await res.json();
        setBoard(data);
        const updatedColumn = data.columns.find((c) => c._id === editingColumn);
        if (updatedColumn) {
            socket.emit("column-updated", updatedColumn);
        }
        setEditingColumn(null);
        setRenamedColumnName("");
    };

    const deleteColumn = async (columnId) => {
        const res = await fetch(
            `http://${HOST}:5000/api/boards/${boardId}/columns/${columnId}`,
            { method: "DELETE" }
        );
        const data = await res.json();
        setBoard(data);
        socket.emit("column-deleted", columnId); // FIXED: emit just the columnId string
        setTasks(tasks.filter((t) => t.columnId !== columnId));
    };

    const deleteTask = async (taskId) => {
        const res = await fetch(`http://${HOST}:5000/api/tasks/${taskId}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            socket.emit("task-deleted", taskId);
        } else {
            const error = await res.text();
            console.error("Delete failed:", error);
            alert("Failed to delete task.");
        }
    };

    const moveTask = async (taskId, newColumnId) => {
        setTasks((prev) =>
            prev.map((t) => (t._id === taskId ? { ...t, columnId: newColumnId } : t))
        );
        try {
            const res = await fetch(`http://${HOST}:5000/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columnId: newColumnId }),
            });
            socket.emit("task-updated", { _id: taskId, columnId: newColumnId }); // FIXED: emit updated task partial object
            if (!res.ok) throw new Error();
        } catch {
            fetchTasks();
        }
    };

    const handleDragStart = (event) => {
        const task = tasks.find((t) => t._id === event.active.id);
        if (!task) return; // prevent error if no task found
        setActiveTaskId(task._id);
        setActiveTask(task);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTaskId(null);
        setActiveTask(null);
        if (!over) return;

        const taskId = active.id;
        const overId = over.id;

        if (overId === "trash") {
            playTrashSound();
            deleteTask(taskId);
            return;
        }

        if (activeTask && activeTask.columnId === overId) {
            toast.info("Task is already in this column");
            return;
        }

        const column = board.columns.find((col) => col._id === overId);
        if (column) moveTask(taskId, overId);
    };

    const handleShowDescription = (task) => setViewingTask(task);
    const handleCloseDescription = () => setViewingTask(null);

    const handleTaskUpdate = (updatedTask) => {
        setTasks((prev) =>
            prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );

        if (viewingTask && viewingTask._id === updatedTask._id) {
            setViewingTask(updatedTask);
        }
    };

    if (!board) return <div className="p-6">Loading board...</div>;

    return (
        <div className="p-6 space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-center border rounded-md p-2 gap-2 sm:gap-0">
                <div className="flex items-center gap-2">
                    {isEditingTitle ? (
                        <>
                            <input
                                className="border p-1 rounded"
                                value={renamedBoardTitle}
                                onChange={(e) => setRenamedBoardTitle(e.target.value)}
                            />
                            <button
                                onClick={async () => {
                                    const res = await fetch(`http://${HOST}:5000/api/boards/${boardId}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ title: renamedBoardTitle }),
                                    });
                                    if (res.ok) {
                                        const updated = await res.json();
                                        setBoard(updated);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                className="text-green-600 font-bold"
                            >
                                ✔
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold">{board.title}</h1>
                            <button
                                onClick={() => {
                                    setRenamedBoardTitle(board.title);
                                    setIsEditingTitle(true);
                                }}
                                className="text-blue-600 text-xl"
                            >
                                ✎
                            </button>
                        </>
                    )}
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="hover:scale-75 transition-transform duration-300"
                >
                    <IoChevronBackCircle size={30} />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <CustomInput
                    placeholder="New Task"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <textarea
                    className="border p-2 rounded w-full"
                    rows={3}
                    placeholder="Task Description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <CustomSelect
                    value={selectedColumnId}
                    onChange={(e, val) => setSelectedColumnId(val)}
                    options={board.columns.map((col) => ({
                        value: col._id,
                        label: col.name,
                    }))}
                />
                <button
                    onClick={addTask}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    <MdAddTask size={30} className="hover:scale-90 transition-transform duration-300" />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <CustomInput
                    placeholder="New Column"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                />
                <button
                    onClick={addColumn}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Add Column
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {board.columns.map((col) => {
                        const colTasks = tasks.filter((t) => t?.columnId === col._id);
                        return (
                            <Column key={col._id} column={col}>
                                <div className="flex justify-between items-center mb-2 flex-wrap gap-y-1">
                                    {editingColumn === col._id ? (
                                        <>
                                            <input
                                                className="border p-1 rounded"
                                                value={renamedColumnName}
                                                onChange={(e) => setRenamedColumnName(e.target.value)}
                                            />
                                            <button
                                                onClick={renameColumn}
                                                className="text-green-600 font-bold ml-2"
                                            >
                                                ✔
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="font-bold">{col.name}</h2>
                                            <div className="flex gap-1 text-sm">
                                                <button
                                                    onClick={() => {
                                                        setEditingColumn(col._id);
                                                        setRenamedColumnName(col.name);
                                                    }}
                                                    className="text-blue-600"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => deleteColumn(col._id)}
                                                    className="text-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <SortableContext
                                    items={colTasks.filter(Boolean).map((task) => task._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {colTasks.map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onShowDescription={handleShowDescription}
                                        />
                                    ))}
                                </SortableContext>
                            </Column>
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeTask && (
                        <div className="bg-white p-2 rounded shadow opacity-90 text-sm font-medium transition-transform">
                            {activeTask.title}
                        </div>
                    )}
                </DragOverlay>

                <TrashBin />
            </DndContext>

            <TaskDescriptionModal task={viewingTask} onClose={handleCloseDescription} onTaskUpdate={handleTaskUpdate} />
        </div>
    );
};

export default KanbanBoardPage;