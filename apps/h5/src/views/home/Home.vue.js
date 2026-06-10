import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const products = ref([]);
onMounted(() => {
    // TODO: 调用 /api/home 与 /api/products 获取真实数据
    products.value = [];
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.VanSearch;
/** @type {[typeof __VLS_components.VanSearch, typeof __VLS_components.vanSearch, typeof __VLS_components.VanSearch, typeof __VLS_components.vanSearch, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    placeholder: "搜索商品",
    shape: "round",
    readonly: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    placeholder: "搜索商品",
    shape: "round",
    readonly: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/search');
    }
};
__VLS_3.slots.default;
{
    const { 'right-icon': __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.VanIcon;
    /** @type {[typeof __VLS_components.VanIcon, typeof __VLS_components.vanIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        name: "orders-o",
        ...{ style: {} },
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        name: "orders-o",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/orders');
        }
    };
    var __VLS_11;
}
var __VLS_3;
const __VLS_16 = {}.VanSwipe;
/** @type {[typeof __VLS_components.VanSwipe, typeof __VLS_components.vanSwipe, typeof __VLS_components.VanSwipe, typeof __VLS_components.vanSwipe, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    autoplay: (3000),
    indicatorColor: "white",
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    autoplay: (3000),
    indicatorColor: "white",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.VanSwipeItem;
/** @type {[typeof __VLS_components.VanSwipeItem, typeof __VLS_components.vanSwipeItem, typeof __VLS_components.VanSwipeItem, typeof __VLS_components.vanSwipeItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "banner" },
});
var __VLS_23;
var __VLS_19;
const __VLS_24 = {}.VanGrid;
/** @type {[typeof __VLS_components.VanGrid, typeof __VLS_components.vanGrid, typeof __VLS_components.VanGrid, typeof __VLS_components.vanGrid, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    columnNum: (4),
    border: (false),
}));
const __VLS_26 = __VLS_25({
    columnNum: (4),
    border: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
for (const [i] of __VLS_getVForSourceType((8))) {
    const __VLS_28 = {}.VanGridItem;
    /** @type {[typeof __VLS_components.VanGridItem, typeof __VLS_components.vanGridItem, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (i),
        icon: "apps-o",
        text: (`分类${i}`),
    }));
    const __VLS_30 = __VLS_29({
        key: (i),
        icon: "apps-o",
        text: (`分类${i}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_27;
if (!__VLS_ctx.products.length) {
    const __VLS_32 = {}.VanEmpty;
    /** @type {[typeof __VLS_components.VanEmpty, typeof __VLS_components.vanEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        description: "商品列表（接入接口后展示）",
    }));
    const __VLS_34 = __VLS_33({
        description: "商品列表（接入接口后展示）",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.products))) {
    const __VLS_36 = {}.VanCard;
    /** @type {[typeof __VLS_components.VanCard, typeof __VLS_components.vanCard, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        key: (p.id),
        price: (p.price.toFixed(2)),
        title: (p.title),
        thumb: (p.mainImage),
        desc: (`可获贡献金 ${p.fundAmount}`),
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        key: (p.id),
        price: (p.price.toFixed(2)),
        title: (p.title),
        thumb: (p.mainImage),
        desc: (`可获贡献金 ${p.fundAmount}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push(`/product/${p.id}`);
        }
    };
    var __VLS_39;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['banner']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            products: products,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=Home.vue.js.map