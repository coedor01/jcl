import colors from "@jx3box/jx3box-data/data/xf/colors.json";
import { cloneDeep, padStart } from "lodash";
import xfId from "@jx3box/jx3box-data/data/xf/xfid.json";

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
