import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

export const generateQrCodeBase64 = async (link: string) => {
    const qrCodeElement = document.getElementById('qrCodeElement');
    if (qrCodeElement) {
        const dataUrl = await toPng(qrCodeElement);
        return dataUrl;
    }
    return null;
};