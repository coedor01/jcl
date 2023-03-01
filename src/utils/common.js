import colors from "@jx3box/jx3box-data/data/xf/colors.json";
import xfId from "@jx3box/jx3box-data/data/xf/xfid.json";
import { showMountIcon, iconLink } from "@jx3box/jx3box-common/js/utils";
import { cloneDeep, padStart } from "lodash";
import { useStore } from "@/store";
const store = useStore();

export function getEntityColor(entityID) {
    const defaultColor = "#ee6666";
    let entity = window?.$store.entities[entityID];
    if (!entity) return defaultColor;
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

const resourceSearchCache = {};
export function getResource(_key) {
    const [type, key] = _key.split(":");
    const { resources } = store.result;
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

export function getMountIcon(id) {
    const { entities } = store.result;
    const entity = entities[id];
    if (!entity) return iconLink(13);
    const mount = entity.mount;
    if (mount) return showMountIcon(mount);
    return iconLink(13);
}

export function getEntityName(id) {
    const { entities } = store.result;
    const entity = entities[id];
    if (!entity) return "天外来客";
    if (entity.name) return entity.name;
    return `#${entity.id}`;
}

export function displayPercent(value) {
    if (!value) return " - ";
    return value.toFixed(2) + "%";
}

export function displayDigits(value) {
    if (!value) return " - ";
    return value.toFixed(2);
}
