import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophoneAlt } from "react-icons/fa";
import { BsRecordCircle } from "react-icons/bs";

const RecordAudio = ({ onUploadSuccess }) => {
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            setAudioBlob(blob);

            // Upload to server
            const formData = new FormData();
            formData.append("voice", blob, "recording.webm");

            const res = await fetch("http://localhost:5000/api/upload/voice", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            onUploadSuccess(data.url, data.filename);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    return (
        <button
            className={`border border-gray-800 px-3 py-1 rounded ${recording ? "text-red-500" : ""}`}
            onClick={recording ? stopRecording : startRecording}
        >
            {recording ? (
                <motion.div
                    initial={{ scale: .8 }}
                    animate={{ scale: [.8, 1, .8] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <BsRecordCircle size={23} />
                </motion.div>
            ) : (
                <FaMicrophoneAlt size={23} />
            )}
        </button>
    );
};

export default RecordAudio;