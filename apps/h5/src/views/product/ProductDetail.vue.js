import { useRouter } from 'vue-router';
const router = useRouter();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.VanNavBar;
/** @type {[typeof __VLS_components.VanNavBar, typeof __VLS_components.vanNavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    title: "商品详情",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "商品详情",
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
const __VLS_8 = {}.VanSwipe;
/** @type {[typeof __VLS_components.VanSwipe, typeof __VLS_components.vanSwipe, typeof __VLS_components.VanSwipe, typeof __VLS_components.vanSwipe, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    autoplay: (3000),
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    autoplay: (3000),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.VanSwipeItem;
/** @type {[typeof __VLS_components.VanSwipeItem, typeof __VLS_components.vanSwipeItem, typeof __VLS_components.VanSwipeItem, typeof __VLS_components.vanSwipeItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "img" },
});
var __VLS_15;
var __VLS_11;
const __VLS_16 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    inset: true,
}));
const __VLS_18 = __VLS_17({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    title: "价格",
    value: "¥0.00",
}));
const __VLS_22 = __VLS_21({
    title: "价格",
    value: "¥0.00",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    title: "可获贡献金",
    value: "0",
}));
const __VLS_26 = __VLS_25({
    title: "可获贡献金",
    value: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    title: "配送",
    value: "包邮",
}));
const __VLS_30 = __VLS_29({
    title: "配送",
    value: "包邮",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_19;
const __VLS_32 = {}.VanNoticeBar;
/** @type {[typeof __VLS_components.VanNoticeBar, typeof __VLS_components.vanNoticeBar, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    scrollable: true,
    text: "实时下单动态：xxx 用户刚刚下单了本商品 ...",
}));
const __VLS_34 = __VLS_33({
    scrollable: true,
    text: "实时下单动态：xxx 用户刚刚下单了本商品 ...",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "placeholder" },
});
const __VLS_36 = {}.VanSubmitBar;
/** @type {[typeof __VLS_components.VanSubmitBar, typeof __VLS_components.vanSubmitBar, typeof __VLS_components.VanSubmitBar, typeof __VLS_components.vanSubmitBar, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onSubmit': {} },
    price: (0),
    buttonText: "立即购买",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onSubmit': {} },
    price: (0),
    buttonText: "立即购买",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onSubmit: (...[$event]) => {
        __VLS_ctx.router.push('/order/confirm');
    }
};
__VLS_39.slots.default;
const __VLS_44 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    icon: "cart-o",
    type: "warning",
    plain: true,
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    icon: "cart-o",
    type: "warning",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/cart');
    }
};
var __VLS_47;
var __VLS_39;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['img']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
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
//# sourceMappingURL=ProductDetail.vue.js.map