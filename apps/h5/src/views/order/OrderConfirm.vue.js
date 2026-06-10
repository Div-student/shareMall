import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const useFund = ref(false);
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
    title: "确认订单",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "确认订单",
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
const __VLS_8 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    title: "收货地址",
    isLink: true,
    value: "请选择收货地址",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    title: "收货地址",
    isLink: true,
    value: "请选择收货地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/mine/address');
    }
};
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
    title: "商品总额",
    value: "¥0.00",
}));
const __VLS_22 = __VLS_21({
    title: "商品总额",
    value: "¥0.00",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    title: "使用可用贡献金抵扣",
}));
const __VLS_26 = __VLS_25({
    title: "使用可用贡献金抵扣",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { value: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_28 = {}.VanSwitch;
    /** @type {[typeof __VLS_components.VanSwitch, typeof __VLS_components.vanSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        modelValue: (__VLS_ctx.useFund),
        size: "20px",
    }));
    const __VLS_30 = __VLS_29({
        modelValue: (__VLS_ctx.useFund),
        size: "20px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_27;
const __VLS_32 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    title: "贡献金抵扣",
    value: "-¥0.00",
}));
const __VLS_34 = __VLS_33({
    title: "贡献金抵扣",
    value: "-¥0.00",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    title: "运费",
    value: "¥0.00",
}));
const __VLS_38 = __VLS_37({
    title: "运费",
    value: "¥0.00",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    title: "预计可获贡献金",
    value: "0",
}));
const __VLS_42 = __VLS_41({
    title: "预计可获贡献金",
    value: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_19;
const __VLS_44 = {}.VanSubmitBar;
/** @type {[typeof __VLS_components.VanSubmitBar, typeof __VLS_components.vanSubmitBar, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onSubmit': {} },
    price: (0),
    buttonText: "提交订单",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onSubmit': {} },
    price: (0),
    buttonText: "提交订单",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onSubmit: (...[$event]) => {
        __VLS_ctx.router.push('/order/pay/1');
    }
};
var __VLS_47;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            useFund: useFund,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=OrderConfirm.vue.js.map