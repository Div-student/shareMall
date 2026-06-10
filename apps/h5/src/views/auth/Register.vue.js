import { reactive } from 'vue';
const form = reactive({ phone: '', smsCode: '', password: '', inviteCode: '' });
function onSubmit() {
    // TODO: 调用 /api/auth/register（邀请码 + 短信）
}
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
    title: "注册",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "注册",
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
const __VLS_8 = {}.VanForm;
/** @type {[typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onSubmit': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onSubmit: (__VLS_ctx.onSubmit)
};
__VLS_11.slots.default;
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
const __VLS_20 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.form.phone),
    label: "手机号",
    placeholder: "请输入手机号",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.form.phone),
    label: "手机号",
    placeholder: "请输入手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.form.smsCode),
    label: "验证码",
    placeholder: "请输入验证码",
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.form.smsCode),
    label: "验证码",
    placeholder: "请输入验证码",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { button: __VLS_thisSlot } = __VLS_27.slots;
    const __VLS_28 = {}.VanButton;
    /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        size: "small",
        type: "primary",
    }));
    const __VLS_30 = __VLS_29({
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
}
var __VLS_27;
const __VLS_32 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    label: "密码",
    placeholder: "请设置密码",
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    label: "密码",
    placeholder: "请设置密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.form.inviteCode),
    label: "邀请码",
    placeholder: "请输入邀请码（选填）",
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.form.inviteCode),
    label: "邀请码",
    placeholder: "请输入邀请码（选填）",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_40 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    round: true,
    block: true,
    type: "primary",
    nativeType: "submit",
}));
const __VLS_42 = __VLS_41({
    round: true,
    block: true,
    type: "primary",
    nativeType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            form: form,
            onSubmit: onSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Register.vue.js.map