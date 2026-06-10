import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { FUND_TIERS } from '@sharemall/shared';
import { useFundStore } from '@/stores/fund';
const router = useRouter();
const fundStore = useFundStore();
const { account } = storeToRefs(fundStore);
onMounted(() => {
    // TODO: 接入后端后启用
    // fundStore.fetchAccount();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "贡献金中心",
}));
const __VLS_2 = __VLS_1({
    title: "贡献金中心",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "wallet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
(__VLS_ctx.account?.pendingFund ?? 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
(__VLS_ctx.account?.availableFund ?? 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
(__VLS_ctx.account?.withdrawableCash ?? 0);
const __VLS_4 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    inset: true,
    title: "档位进度",
}));
const __VLS_6 = __VLS_5({
    inset: true,
    title: "档位进度",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
for (const [tier] of __VLS_getVForSourceType((__VLS_ctx.FUND_TIERS))) {
    const __VLS_8 = {}.VanCell;
    /** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (tier),
        title: (`${tier} 档`),
        value: "未达标",
    }));
    const __VLS_10 = __VLS_9({
        key: (tier),
        title: (`${tier} 档`),
        value: "未达标",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
var __VLS_7;
const __VLS_12 = {}.VanGrid;
/** @type {[typeof __VLS_components.VanGrid, typeof __VLS_components.vanGrid, typeof __VLS_components.VanGrid, typeof __VLS_components.vanGrid, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    columnNum: (2),
}));
const __VLS_14 = __VLS_13({
    columnNum: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.VanGridItem;
/** @type {[typeof __VLS_components.VanGridItem, typeof __VLS_components.vanGridItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    icon: "completed",
    text: "打卡兑现",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    icon: "completed",
    text: "打卡兑现",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/fund/checkin');
    }
};
var __VLS_19;
const __VLS_24 = {}.VanGridItem;
/** @type {[typeof __VLS_components.VanGridItem, typeof __VLS_components.vanGridItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    icon: "balance-list-o",
    text: "贡献金明细",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    icon: "balance-list-o",
    text: "贡献金明细",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/fund/records');
    }
};
var __VLS_27;
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['wallet']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            FUND_TIERS: FUND_TIERS,
            router: router,
            account: account,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Fund.vue.js.map