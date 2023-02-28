import { ref } from "vue";
import { useStore } from "@/store/index.js";
import analysisWorker from "./analysis.worker.js";

export function useAnalysis() {
    const store = useStore();
    const progress = ref(0);

    const startAnalysis = (promise) => {
        promise
            .then((raw) => {
                // 创建一个worker并初始化
                store.worker = new analysisWorker();
                const worker = store.worker;
                return new Promise((resolve) => {
                    worker.onmessage = ({ data: { msg } }) => {
                        if (msg == "init") resolve(worker);
                    };
                    worker.postMessage({ action: "init", data: { raw } });
                });
            })
            .then((worker) => {
                // 开始分析
                worker.onmessage = ({ data: { msg, data } }) => {
                    if (msg == "progress") {
                        // 进度更新
                        progress.value = data * 100;
                    } else if (msg == "all") {
                        // 返回结果
                        window.$store = data;
                        worker.terminate();
                    }
                };
                worker.postMessage({ action: "getAll" });
            });
    };

    return { progress, startAnalysis };
}
