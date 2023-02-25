/* 
    这个文件用于导出，输入应该是format生成的row
 */
import moment from "moment";
import { entityName, resourceName } from "@/scripts/jcl/format.js";
import { getResource } from "@/scripts/jcl/resource.js";
import xfid from "@jx3box/jx3box-data/data/xf/xfid.json";
/**
 * 定义导出的excel文件的列名，数据源，以及是否隐藏等
 */
export const header = [
    { label: "事件序号", value: "id" },
    { label: "时:分:秒", value: "displayTime" },
    { label: "逻辑帧", value: "frame" },
    { label: "秒数", value: "time" },
    { label: "毫秒", value: "micro" },

    { label: "事件类型", value: "typeDesc" },
    { label: "事件类型ID", value: "type" },
    { label: "事件子类型", value: "subtype" },

    { label: "事件来源", value: "source" },
    { label: "来源ID", value: "sourceID" },
    { label: "来源名称", value: "sourceName" },
    { label: "来源出现次序", value: "sourceOrder" },
    { label: "来源模板ID", value: "sourceTemplate" },
    { label: "来源归属", value: "sourceBelong" },
    { label: "来源心法", value: "sourceMount" },

    { label: "事件目标", value: "target" },
    { label: "目标ID", value: "targetID" },
    { label: "目标名称", value: "targetName" },
    { label: "目标出现次序", value: "targetOrder" },
    { label: "目标模板ID", value: "targetTemplate" },
    { label: "目标归属", value: "targetBelong" },
    { label: "目标心法", value: "targetMount" },

    { label: "内容类型", value: "contentType" },
    { label: "层数", value: "contentStackNum" },
    { label: "事件内容", value: "content" },

    { label: "有效伤害", value: "valueDamage" },
    { label: "有效治疗", value: "valueHealth" },
    { label: "数值详情", value: "values" },

    { label: "备注", value: "remark" },

    { label: "内容ID", value: "contentID" },
    { label: "内容名称", value: "contentName" },
    { label: "内容备注", value: "contentRemark" },
    { label: "内容描述", value: "contentDesc" },
];

/**
 * 传入一个JCL日志列表的row对象，返回一个包含额外信息的row用于导出
 */
const rowAddExtra = (row, $store) => {
    if (row.micro < 0) row.displayTime = "-" + moment(-row.micro).utcOffset(0).format("HH:mm:ss.SSS");
    else row.displayTime = moment(row.micro).utcOffset(0).format("HH:mm:ss.SSS");
    // 事件来源和事件目标的详细信息
    for (let key of ["source", "target"]) {
        const entityID = row[key].v;
        if (!entityID) continue;
        const entity = $store.entities[entityID];
        if (!entity) {
            row[key] = undefined;
            continue;
        }
        let extra = {};
        extra[key] = entityName(entity, true) || "";
        extra[key + "ID"] = entity.id;
        extra[key + "Name"] = entity.name;
        extra[key + "Order"] = entity.appearOrder;
        extra[key + "Template"] = entity.templateID;
        extra[key + "Belong"] = entity.belongID;
        extra[key + "Mount"] = xfid[entity.mount];
        row = { ...row, ...extra };
    }

    // 数值相关
    if (row.value) {
        row.valueDamage = row.value["有效伤害"];
        row.valueHealth = row.value["有效治疗"];
        let valuesText = "";
        for (let key in row.value) valuesText += key + ":" + row.value[key] + ";";
        row.values = valuesText;
    }
    // 备注
    if (row.type == 21 && row.__log.C) row.remark = "会心";
    // 事件内容的详细信息
    const content = row.content;
    if (content.t == "str") {
        row.contentType = "文本";
        row.content = content.v;
    } else if (["skill", "buff"].includes(content.t) && content.v) {
        const resource = getResource(content.t, content.v, $store.resources);
        row.contentType = content.t;
        if (row.content.n) row.contentStackNum = row.content.n;
        row.content = resourceName(resource);
        row.contentID = resource.id;
        row.contentName = resource.name;
        row.contentRemark = resource.remark;
        row.contentDesc = resource.desc;
    }
    return row;
};

/**
 * 把rows导出为excel文件
 * @param {*} rows
 * @returns
 */
export const writeRowsToSheet = function* ($store) {
    const rows = $store.rows;
    const length = rows.length;
    const result = [];
    for (let i = 0; i < length; i++) {
        let row = {
            ...rows[i],
            id: i + 1,
        };
        result.push(rowAddExtra(row, $store));
        if (i % 1000) yield (i / length) * 100;
    }
    return result;
};
