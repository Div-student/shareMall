import type { FundAccount } from '@sharemall/shared';
export declare const useFundStore: import("pinia").StoreDefinition<"fund", Pick<{
    account: import("vue").Ref<{
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null, FundAccount | {
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null>;
    fetchAccount: () => Promise<{
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null>;
}, "account">, Pick<{
    account: import("vue").Ref<{
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null, FundAccount | {
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null>;
    fetchAccount: () => Promise<{
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null>;
}, never>, Pick<{
    account: import("vue").Ref<{
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null, FundAccount | {
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null>;
    fetchAccount: () => Promise<{
        pendingFund: number;
        availableFund: number;
        withdrawableCash: number;
        tiers: {
            tier: import("@sharemall/shared").FundTier;
            reached: boolean;
        }[];
    } | null>;
}, "fetchAccount">>;
