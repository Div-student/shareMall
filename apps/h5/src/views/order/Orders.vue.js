import { ref } from 'vue';
const active = ref(0);
const tabs = ['全部', '待付款', '待发货', '待收货', '已完成', '售后'];
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
    ...{ 'onClickLeft': {} },
    title: "我的订单",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "我的订单",
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
var __VLS_3;
const __VLS_8 = {}.VanTabs;
/** @type {[typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    active: (__VLS_ctx.active),
}));
const __VLS_10 = __VLS_9({
    active: (__VLS_ctx.active),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
for (const [t] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
    const __VLS_12 = {}.VanTab;
    /** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        key: (t),
        title: (t),
    }));
    const __VLS_14 = __VLS_13({
        key: (t),
        title: (t),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_11;
const __VLS_16 = {}.VanEmpty;
/** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    description: "暂无订单",
}));
const __VLS_18 = __VLS_17({
    description: "暂无订单",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            active: active,
            tabs: tabs,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Orders.vue.js.map