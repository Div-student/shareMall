import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: "收银台",
}));
const __VLS_2 = __VLS_1({
    title: "收银台",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    inset: true,
}));
const __VLS_6 = __VLS_5({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    title: "待支付金额",
    value: "¥0.00",
}));
const __VLS_10 = __VLS_9({
    title: "待支付金额",
    value: "¥0.00",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    title: "微信支付",
    clickable: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    title: "微信支付",
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push(`/order/result/${__VLS_ctx.orderId}`);
    }
};
var __VLS_15;
const __VLS_20 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    title: "支付宝",
    clickable: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    title: "支付宝",
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push(`/order/result/${__VLS_ctx.orderId}`);
    }
};
var __VLS_23;
var __VLS_7;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            orderId: orderId,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Pay.vue.js.map