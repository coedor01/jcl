/*
 * @Author: X3ZvaWQ x3zvawq@gmail.com
 * @Date: 2023-03-22 09:38:41
 * @LastEditors: X3ZvaWQ x3zvawq@gmail.com
 * @LastEditTime: 2023-03-22 15:29:52
 * @FilePath: /jcl/src/utils/commonNoStore.js
 * @Description:
 */
import colors from "@jx3box/jx3box-data/data/xf/colors.json";
import xfId from "@jx3box/jx3box-data/data/xf/xfid.json";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { padStart, cloneDeep } from "lodash-es";
import { moment } from "@jx3box/jx3box-common/js/moment";

const resourceSearchCache = {};
export function getResource(_key, store) {
    const [type, key] = _key.split(":");
    const { resources } = store;
    let cacheKey = `${type}:${key}`;
    if (resourceSearchCache[cacheKey]) return resources[resourceSearchCache[cacheKey]];
    let resourceKey = `${type}:${key}`;
    let r = resources[resourceKey];
    // 直接找到了id和level都符合的记录就直接返回图标
    if (r) {
        resourceSearchCache[cacheKey] = resourceKey;
        return r;
    }
    // 如果没有找到尝试只匹配id一致的
    let id = key.split("_")[0];
    resourceKey = `${type}:${id}_`;
    resourceKey = Object.keys(resources).find((k) => k?.startsWith(resourceKey));
    r = resources[resourceKey] ?? {};
    if (r) {
        resourceSearchCache[cacheKey] = resourceKey;
        return r;
    }
}

export function getResourceIcon(key, store, { url = true } = {}) {
    const resource = getResource(key, store);
    if (!resource) return url ? iconLink(13) : 13;
    return url ? iconLink(resource.icon) : resource.icon;
}

export function getResourceName(key, store, { showID = false } = {}) {
    const id = key.split(":")[1];
    const resource = getResource(key, store);
    if (!resource) return "未知招式";
    let ret = resource.name || resource.remark;
    if (showID) ret += `#${id}`;
    return ret;
}

export function getEntityColor(entityID, store) {
    const defaultColor = "#ee6666";
    const { entities } = store;
    const entity = entities[entityID];
    if (!entity || !entity.mount) return defaultColor;
    let mountName = xfId[entity.mount];
    let color = colors.colors_by_mount_name[mountName];
    return color;
}

export function randomColor() {
    return "#" + padStart(((Math.random() * 0xffffff) << 0).toString(16), 6, "0");
}

export function* getRandomColor() {
    let colorLists = cloneDeep(Object.values(colors.colors_by_school_name));
    while (true) {
        if (colorLists.length) {
            yield colorLists.shift();
        } else {
            yield randomColor();
        }
    }
}

export function getEntity(id, store) {
    const { entities } = store;
    return entities[id] ?? {};
}

export function getEntityName(id, store, { showID = false, showOrder = false } = {}) {
    const entity = getEntity(id, store);
    if (!entity) return "天外来客";
    if (!entity.name) return `#${entity.id}`;
    let result = entity.name;

    if (showID) result += `#${id}`;
    if (showOrder && entity.appearOrder) result += `@${entity.appearOrder}`;
    return result;
}

export function displayPercent(value) {
    if (!value) return " - ";
    return value.toFixed(2) + "%";
}

export function displayDigits(value) {
    if (!value) return " - ";
    return value.toFixed(2);
}

export function displayBigNumber(value) {
    if (!value) return " - ";
    if (value > 1000000000000) return (value / 1000000000000).toFixed(2) + "万亿";
    if (value > 100000000) return (value / 100000000).toFixed(2) + "亿";
    if (value > 10000) return (value / 10000).toFixed(2) + "万";
    return value;
}

export function displayDuration(value) {
    const duration = moment.duration(value, "seconds");
    return duration.isValid() ? `${padStart(duration.minutes(), 2, 0)}:${padStart(duration.seconds(), 2, 0)}` : "--:--";
}
