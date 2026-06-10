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
    title: "购物车",
}));
const __VLS_2 = __VLS_1({
    title: "购物车",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.VanEmpty;
/** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    description: "购物车为空",
}));
const __VLS_6 = __VLS_5({
    description: "购物车为空",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
const __VLS_8 = {}.VanSubmitBar;
/** @type {[typeof __VLS_components.VanSubmitBar, typeof __VLS_components.vanSubmitBar, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onSubmit': {} },
    price: (0),
    buttonText: "去结算",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onSubmit': {} },
    price: (0),
    buttonText: "去结算",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onSubmit: (...[$event]) => {
        __VLS_ctx.router.push('/order/confirm');
    }
};
var __VLS_11;
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
//# sourceMappingURL=Cart.vue.js.map