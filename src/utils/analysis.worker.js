import { Analyzer } from "./analyzer";

const updateResult = (msg, data) => {
    postMessage({ msg, data });
};

let analyzer;

onmessage = async ({ data: { action, data } }) => {
    if (action == "init") {
        const { raw, params } = data;
        analyzer = new Analyzer(raw, params);
        updateResult("init", true);
    } else if (action == "getAll") {
        const counter = analyzer.getAll();
        let finished = false;
        while (!finished) {
            let { done, value } = counter.next();
            if (!done) {
                const { index, length } = value;
                if (index % 100 == 0) updateResult("progress", index / length);
            } else {
                finished = true;
                updateResult("progress", 1);
                updateResult("all", value);
            }
        }
    } /*  else if (action == "step") {
    } */
};
