import { ref } from "vue";
import { useStore } from "@/store/index.js";
import { useGlobal } from "@/store/global.js";
import { getRandomColor } from "../common.js";
import analysisWorker from "../analysis.worker.js";

export function useAnalysis() {
    const store = useStore();
    const progress = ref(0);
    const ready = ref(false);

    const startAnalysis = () => {
        const raw = store.raw;
        // 创建一个worker并初始化
        store.worker = new analysisWorker();
        const worker = store.worker;
        return new Promise((resolve) => {
            worker.onmessage = ({ data: { msg } }) => {
                if (msg == "init") resolve(worker);
            };
            worker.postMessage({ action: "init", data: { raw } });
        }).then((worker) => {
            // 开始分析
            worker.onmessage = ({ data: { msg, data } }) => {
                if (msg == "progress") {
                    // 进度更新
                    progress.value = data * 100;
                } else if (msg == "all") {
                    // 进行一些轻量化的处理
                    let { entities } = data;
                    const colors = getRandomColor();
                    for (let id in entities) {
                        const { value } = colors.next();
                        entities[id].color = value;
                    }
                    // 重置global
                    const global = useGlobal();
                    global.$reset();
                    // 返回结果
                    // window.$store = data;
                    store.result = Object.freeze(data);
                    ready.value = true;
                    worker.terminate();
                }
            };
            worker.postMessage({ action: "getAll" });
        });
    };

    return { progress, ready, startAnalysis };
}
