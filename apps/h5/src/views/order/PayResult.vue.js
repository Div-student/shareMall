import { useRouter } from 'vue-router';
const router = useRouter();
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
    title: "支付结果",
}));
const __VLS_2 = __VLS_1({
    title: "支付结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.VanEmpty;
/** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    image: "success",
    description: "支付成功",
}));
const __VLS_6 = __VLS_5({
    image: "success",
    description: "支付成功",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_8 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    block: true,
    plain: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    block: true,
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/orders');
    }
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    block: true,
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    block: true,
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/home');
    }
};
__VLS_19.slots.default;
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=PayResult.vue.js.map