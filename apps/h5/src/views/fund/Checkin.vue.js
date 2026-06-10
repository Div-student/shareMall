import { DEFAULT_CHECKIN_DAYS } from '@sharemall/shared';
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
    title: "打卡兑现",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "打卡兑现",
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
    title: "当前档位",
    value: "-",
}));
const __VLS_14 = __VLS_13({
    title: "当前档位",
    value: "-",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    title: "每日可兑现",
    value: "0",
}));
const __VLS_18 = __VLS_17({
    title: "每日可兑现",
    value: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.VanCell;
/** @type {[typeof __VLS_components.VanCell, typeof __VLS_components.vanCell, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    title: "签到进度",
    value: (`0 / ${__VLS_ctx.DEFAULT_CHECKIN_DAYS}`),
}));
const __VLS_22 = __VLS_21({
    title: "签到进度",
    value: (`0 / ${__VLS_ctx.DEFAULT_CHECKIN_DAYS}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_24 = {}.VanButton;
/** @type {[typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, typeof __VLS_components.VanButton, typeof __VLS_components.vanButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    block: true,
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    block: true,
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
const __VLS_28 = {}.VanNoticeBar;
/** @type {[typeof __VLS_components.VanNoticeBar, typeof __VLS_components.vanNoticeBar, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    wrapable: true,
    scrollable: (false),
    text: "规则：达到档位后开始打卡，30 天平均兑现，漏打卡当天收益作废。",
}));
const __VLS_30 = __VLS_29({
    wrapable: true,
    scrollable: (false),
    text: "规则：达到档位后开始打卡，30 天平均兑现，漏打卡当天收益作废。",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
/** @type {__VLS_StyleScopedClasses['page']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DEFAULT_CHECKIN_DAYS: DEFAULT_CHECKIN_DAYS,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Checkin.vue.js.map