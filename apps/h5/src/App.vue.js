import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const showTabbar = computed(() => route.meta.tabbar === true);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-container" },
});
const __VLS_0 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
{
    const { default: __VLS_thisSlot } = __VLS_3.slots;
    const [{ Component }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_4 = {}.KeepAlive;
    /** @type {[typeof __VLS_components.KeepAlive, typeof __VLS_components.keepAlive, typeof __VLS_components.KeepAlive, typeof __VLS_components.keepAlive, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = ((Component));
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
if (__VLS_ctx.showTabbar) {
    const __VLS_12 = {}.VanTabbar;
    /** @type {[typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, typeof __VLS_components.VanTabbar, typeof __VLS_components.vanTabbar, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        route: true,
    }));
    const __VLS_14 = __VLS_13({
        route: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.VanTabbarItem;
    /** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        to: "/home",
        icon: "shop-o",
    }));
    const __VLS_18 = __VLS_17({
        to: "/home",
        icon: "shop-o",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_20 = {}.VanTabbarItem;
    /** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        to: "/fund",
        icon: "gold-coin-o",
    }));
    const __VLS_22 = __VLS_21({
        to: "/fund",
        icon: "gold-coin-o",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    var __VLS_23;
    const __VLS_24 = {}.VanTabbarItem;
    /** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        to: "/cart",
        icon: "cart-o",
    }));
    const __VLS_26 = __VLS_25({
        to: "/cart",
        icon: "cart-o",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_28 = {}.VanTabbarItem;
    /** @type {[typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, typeof __VLS_components.VanTabbarItem, typeof __VLS_components.vanTabbarItem, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        to: "/mine",
        icon: "user-o",
    }));
    const __VLS_30 = __VLS_29({
        to: "/mine",
        icon: "user-o",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
    var __VLS_15;
}
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            showTabbar: showTabbar,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=App.vue.js.map