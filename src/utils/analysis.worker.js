import { Analyzer } from "./analyzer";
import { getResource as _getResourceFromApi } from "@/services/resource.js";
import { uniq } from "lodash-es";

const updateResult = (msg, data) => {
    postMessage({ msg, data });
};

async function getResourceFromApi(resourceList, client = "std") {
    let result = {};
    let buff_res = await _getResourceFromApi({
        client,
        type: "buff",
        ids: uniq(resourceList.buff),
        fields: ["BuffID", "Level", "IconID", "Name", "BuffName", "Desc"],
    });
    let skill_res = await _getResourceFromApi({
        client,
        type: "skill",
        ids: uniq(resourceList.skill),
        fields: ["SkillID", "Level", "MaxLevel", "IconID", "Name", "SkillName", "Desc"],
    });
    if (buff_res.data) {
        for (let buff of buff_res.data) {
            if (buff.BuffID == 0) continue;
            const key = `buff:${buff.BuffID}_${buff.Level ?? ""}`;
            const value = {
                id: buff.BuffID,
                level: buff.Level || 0,
                icon: buff.IconID,
                name: buff.Name,
                remark: buff.BuffName,
                desc: buff.Desc,
            };
            result[key] = value;
        }
    }
    if (skill_res.data) {
        for (let skill of skill_res.data) {
            if (skill.SkillID == 0) continue;
            const key = `skill:${skill.SkillID}_${skill.Level ?? skill.MaxLevel}`;
            const value = {
                id: skill.SkillID,
                level: skill.Level ?? skill.MaxLevel,
                icon: skill.IconID,
                name: skill.Name,
                remark: skill.SkillName,
                desc: skill.Desc,
            };
            result[key] = value;
        }
    }
    return result;
}

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
                let { resources, client } = value;
                value.resources = await getResourceFromApi(resources, client);
                updateResult("all", value);
            }
        }
    } /*  else if (action == "step") {
    } */
};
