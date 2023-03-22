/*
 * @Author: X3ZvaWQ x3zvawq@gmail.com
 * @Date: 2023-03-22 10:19:53
 * @LastEditors: X3ZvaWQ x3zvawq@gmail.com
 * @LastEditTime: 2023-03-22 11:49:55
 * @FilePath: /jcl/src/utils/worker.js
 * @Description: 与analysisWorker交互的工具方法，实现了一个队列
 */

import { useStore } from "@/store";
const store = useStore();

// 每次调用的时候检查队列中是否有还在等待的任务，
const workerTaskQueue = [];
let busy = false;
async function processQueue() {
    if (workerTaskQueue.length === 0 || busy) return;
    const worker = store.worker;
    if (!worker) return;
    busy = true;
    const { action, data, resolve } = workerTaskQueue.shift();
    const result = await new Promise((resolve) => {
        worker.onmessage = ({ data }) => resolve(data);
        worker.onerror = (error) => resolve({ error });
        worker.postMessage({ action, data });
    });
    resolve(result);
    busy = false;
    processQueue();
}

export default async function getWorkerResponse(action, data) {
    return new Promise((resolve) => {
        workerTaskQueue.push({ action, data, resolve });
        processQueue();
    });
}
