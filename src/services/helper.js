import { $helper } from "./axios";

export const getBattleAc = () => {
    return $helper.get("/api/breadcrumb/battle-ac-v3");
};

export const getJbaHelp = () => {
    return $helper.get("/api/breadcrumb/battle-jba-v3");
};
