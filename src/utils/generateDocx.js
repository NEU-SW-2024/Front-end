import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

// 修改后的 generateDocx 方法
export function generateDocx(templateContent, data) {
    const zip = new PizZip(templateContent); // 加载模板内容
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true, // 循环段落
        linebreaks: true, // 支持换行
        delimiters: { start: "{{", end: "}}" }, // 设置 Mustache 风格的占位符
    });

    doc.setData(data); // 动态数据填充

    try {
        doc.render(); // 渲染模板
    } catch (error) {
        console.error("渲染失败:", error);
        throw error;
    }

    return doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
}