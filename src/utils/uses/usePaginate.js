import { ref, computed } from "vue";

export const usePaginate = (data, { pageSize = 25 } = {}) => {
    const currentPage = ref(1);
    const currentData = computed(() => {
        const start = (currentPage.value - 1) * pageSize;
        const end = start + pageSize;
        return data.value.slice(start, end);
    }, [data, currentPage]);
    const total = computed(() => data.value.length, [data]);

    return {
        currentPage,
        currentData,
        total,
    };
};
