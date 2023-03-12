import { unparse } from "papaparse";
import iconv from "iconv-lite";
import { header, writeRowsToSheet } from "@/utils/export.js";

// 在子线程向主线程传递进度信息
const updateStatus = function (desc, status, processing) {
    postMessage({
        type: "statusUpdated",
        data: { desc, status, processing },
    });
};

// 在子线程向主线程传递结果
const updateResultData = function (data) {
    let response = {
        type: "result",
        data,
    };
    postMessage(response);
};

onmessage = function (e) {
    let data = e.data;
    let window = { $store: data };
    // 初始化好workbook和worksheet
    updateStatus("整理原始数据", 1, 5);
    const headerValues = header.map((item) => item.value);
    //const headerLabels = header.map((item) => item.label);
    // 从window中取出所有的资源
    updateStatus("构建CSV表格", 0);
    let exporter = writeRowsToSheet(window.$store);
    let result;
    while (!(result = exporter.next()).done) updateStatus("构建CSV表格", 0, 5 + result.value * 0.85);

    // 将数据转换为csv格式
    let csv = unparse(result.value, { columns: headerValues });
    updateStatus("构建CSV表格", 1, 90);
    // 结果写入到u8数组
    updateStatus("构建完成，下载马上开始", 0);
    const u8 = iconv.encode(csv, "gbk");
    csv = null;
    updateResultData(u8);
    close();
};
