import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const mode = ref('password');
const form = reactive({ phone: '', password: '', smsCode: '' });
function onSubmit() {
    // TODO: 调用 /api/auth/login 或 /api/auth/login-sms
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
    title: "登录",
}));
const __VLS_2 = __VLS_1({
    title: "登录",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.VanTabs;
/** @type {[typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, typeof __VLS_components.VanTabs, typeof __VLS_components.vanTabs, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    active: (__VLS_ctx.mode),
}));
const __VLS_6 = __VLS_5({
    active: (__VLS_ctx.mode),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    title: "密码登录",
    name: "password",
}));
const __VLS_10 = __VLS_9({
    title: "密码登录",
    name: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.VanTab;
/** @type {[typeof __VLS_components.VanTab, typeof __VLS_components.vanTab, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    title: "短信登录",
    name: "sms",
}));
const __VLS_14 = __VLS_13({
    title: "短信登录",
    name: "sms",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_7;
const __VLS_16 = {}.VanForm;
/** @type {[typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, typeof __VLS_components.VanForm, typeof __VLS_components.vanForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onSubmit': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onSubmit': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onSubmit: (__VLS_ctx.onSubmit)
};
__VLS_19.slots.default;
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
const __VLS_28 = {}.VanField;
/** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.form.phone),
    label: "手机号",
    placeholder: "请输入手机号",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.form.phone),
    label: "手机号",
    placeholder: "请输入手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
if (__VLS_ctx.mode === 'password') {
    const __VLS_32 = {}.VanField;
    /** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        modelValue: (__VLS_ctx.form.password),
        type: "password",
        label: "密码",
        placeholder: "请输入密码",
    }));
    const __VLS_34 = __VLS_33({
        modelValue: (__VLS_ctx.form.password),
        type: "password",
        label: "密码",
        placeholder: "请输入密码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
else {
    const __VLS_36 = {}.VanField;
    /** @type {[typeof __VLS_components.VanField, typeof __VLS_components.vanField, typeof __VLS_components.VanField, typeof __VLS_components.vanField, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        modelValue: (__VLS_ctx.form.smsCode),
        label: "验证码",
        placeholder: "请输入验证码",
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (__VLS_ctx.form.smsCode),
        label: "验证码",
        placeholder: "请输入验证码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { button: __VLS_thisSlot } = __VLS_39.slots;
        const __VLS_40 = {}.VanButton;
        /** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            size: "small",
            type: "primary",
        }));
        const __VLS_42 = __VLS_41({
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        var __VLS_43;
    }
    var __VLS_39;
}
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_44 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    round: true,
    block: true,
    type: "primary",
    nativeType: "submit",
}));
const __VLS_46 = __VLS_45({
    round: true,
    block: true,
    type: "primary",
    nativeType: "submit",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
var __VLS_47;
const __VLS_48 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    round: true,
    block: true,
    plain: true,
    ...{ style: {} },
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    round: true,
    block: true,
    plain: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/register');
    }
};
__VLS_51.slots.default;
var __VLS_51;
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            mode: mode,
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
//# sourceMappingURL=Login.vue.js.map