import { $helper } from "./axios";

export const getBattleAc = () => {
    return $helper.get("/api/breadcrumb/battle-ac-v3");
};
