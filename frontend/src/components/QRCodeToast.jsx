import { QRCodeCanvas } from "qrcode.react";

const QRCodeToast = ({ link }) => {
    return (
        <div className="p-3 text-center flex flex-col items-center justify-center">
            <p className="text-sm mb-2 font-semibold">Scan QR to open this board</p>
            <QRCodeCanvas
                value={link}
                size={150}
                className="border border-gray-300 rounded p-1 bg-white"
            />
        </div>
    );
};

export default QRCodeToast;