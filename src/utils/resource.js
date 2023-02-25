import { getResource as _getResourceFromApi } from "../../service/resource.js";

/**
 * 通过getResourceLists整合的资源列表，向服务器发起请求找到需要的资源
 */
export async function getResourceFromApi(resourceList, client = "std") {
    let result = {};
    let buff_res = await _getResourceFromApi({
        client,
        type: "buff",
        ids: resourceList.buff,
        fields: ["BuffID", "Level", "IconID", "Name", "BuffName", "Desc"],
    });
    let skill_res = await _getResourceFromApi({
        client,
        type: "skill",
        ids: resourceList.skill,
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

const resourceSearchCache = {};
/**
 * 根据给定的type与id，尝试从window中取出对应的资源
 */
export function getResource(type, key, source) {
    let cacheKey = `${type}:${key}`;
    if (resourceSearchCache[cacheKey]) return resourceSearchCache[cacheKey];
    let resources = source ?? window.$store.resources;
    let resourceKey = `${type}:${key}`;
    let r = resources[resourceKey];
    // 直接找到了id和level都符合的记录就直接返回图标
    if (r) {
        resourceSearchCache[cacheKey] = r;
        return r;
    }
    // 如果没有找到尝试只匹配id一致的
    let id = key.split("_")[0];
    resourceKey = `${type}:${id}_`;
    resourceKey = Object.keys(resources).find((k) => k?.startsWith(resourceKey));
    r = resources[resourceKey] ?? {};
    if (r) {
        resourceSearchCache[cacheKey] = r;
        return r;
    }
}
