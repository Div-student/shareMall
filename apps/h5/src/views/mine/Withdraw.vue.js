import { reactive } from 'vue';
const form = reactive({ amount: '', method: 'wechat' });
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
    title: "提现",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "提现",
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
const __VLS_8 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    inset: true,
}));
const __VLS_10 = __VLS_9({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    title: "可提现余额（提现金）",
    value: "¥0.00",
}));
const __VLS_14 = __VLS_13({
    title: "可提现余额（提现金）",
    value: "¥0.00",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.form.amount),
    type: "number",
    label: "提现金额",
    placeholder: "请输入提现金额",
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.form.amount),
    type: "number",
    label: "提现金额",
    placeholder: "请输入提现金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_11;
const __VLS_20 = {}.VanRadioGroup;
/** @type {[typeof __VLS_components.VanRadioGroup, typeof __VLS_components.vanRadioGroup, typeof __VLS_components.VanRadioGroup, typeof __VLS_components.vanRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.form.method),
    ...{ style: {} },
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.form.method),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.VanCellGroup;
/** @type {[typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, typeof __VLS_components.VanCellGroup, typeof __VLS_components.vanCellGroup, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    inset: true,
}));
const __VLS_26 = __VLS_25({
    inset: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    title: "微信",
    clickable: true,
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    title: "微信",
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (...[$event]) => {
        __VLS_ctx.form.method = 'wechat';
    }
};
__VLS_31.slots.default;
{
    const { 'right-icon': __VLS_thisSlot } = __VLS_31.slots;
    const __VLS_36 = {}.VanRadio;
    /** @type {[typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        name: "wechat",
    }));
    const __VLS_38 = __VLS_37({
        name: "wechat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
var __VLS_31;
const __VLS_40 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    title: "支付宝",
    clickable: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    title: "支付宝",
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (...[$event]) => {
        __VLS_ctx.form.method = 'alipay';
    }
};
__VLS_43.slots.default;
{
    const { 'right-icon': __VLS_thisSlot } = __VLS_43.slots;
    const __VLS_48 = {}.VanRadio;
    /** @type {[typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        name: "alipay",
    }));
    const __VLS_50 = __VLS_49({
        name: "alipay",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
var __VLS_43;
const __VLS_52 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onClick': {} },
    title: "银行卡",
    clickable: true,
}));
const __VLS_54 = __VLS_53({
    ...{ 'onClick': {} },
    title: "银行卡",
    clickable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    onClick: (...[$event]) => {
        __VLS_ctx.form.method = 'bank';
    }
};
__VLS_55.slots.default;
{
    const { 'right-icon': __VLS_thisSlot } = __VLS_55.slots;
    const __VLS_60 = {}.VanRadio;
    /** @type {[typeof __VLS_components.VanRadio, typeof __VLS_components.vanRadio, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        name: "bank",
    }));
    const __VLS_62 = __VLS_61({
        name: "bank",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
}
var __VLS_55;
var __VLS_27;
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_64 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    block: true,
    type: "primary",
}));
const __VLS_66 = __VLS_65({
    block: true,
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
var __VLS_67;
const __VLS_68 = {}.VanNoticeBar;
/** @type {[typeof __VLS_components.VanNoticeBar, typeof __VLS_components.vanNoticeBar, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    wrapable: true,
    scrollable: (false),
    text: "说明：仅提现金可提现，可用贡献金仅限站内消费。",
}));
const __VLS_70 = __VLS_69({
    wrapable: true,
    scrollable: (false),
    text: "说明：仅提现金可提现，可用贡献金仅限站内消费。",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            form: form,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Withdraw.vue.js.map