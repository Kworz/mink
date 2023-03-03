import jsPDF, { type TextOptionsLight } from "jspdf";
import qrcode from "qrcode";

import { font } from "./noto-b64";

export class LabelDocument {

    constructor(height: number, width: number, orientation: 'l' | 'p' = 'l')
    {
        Object.assign(this, new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [width, height],
            filters: ["ASCIIHexEncode"]
        }));

        console.log("test");

        this.addFileToVFS('mplus-medium.ttf', font);
        this.addFont('mplus-medium.ttf', 'NotoSansSymbols-SemiBold', 'normal');
        this.setFont('NotoSansSymbols-SemiBold', "normal");
    }

    /**
     * Convert Millimeter to Points
     * @param mm 
     * @returns 
     */
    private mmToPt(mm: number)
    {
        return mm / 0.3527777778;
    }

    /**
     * Print a text in a bounding box
     * @param text Text to be printed
     * @param maxFontSize Max font size
     * @param maxWidth Max width
     * @param x X Position
     * @param y Y Position
     * @param o Text options
     */
    printResizeText(text: string | undefined, maxFontSize: number, maxWidth: number, x: number, y: number, o: TextOptionsLight | undefined)
    {
        if(text === undefined)
            return;
        
        let h = maxFontSize;
        this.setFontSize(this.mmToPt(h));

        while(this.getTextWidth(text) > maxWidth)
        {
            h = h - 0.25;
            this.setFontSize(this.mmToPt(h));
        }

        this.text(text,x,y,o);
    }

    /**
     * Adds a QRCode to the Label
     * @async
     * @param text Text to be encoded in the QRCode
     * @param x X position of left top
     * @param y Y position of left top
     * @param size QRCode size
     * @param margin White margin used
     */
    async addQRCode(text: string, x: number, y: number, size:number, margin = 4)
    {
        const QRCode = await qrcode.toDataURL(text, { "type": "image/png", margin });
        this.addImage(QRCode, 2, 2, 18, 18);
    }
}