import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchCart } from '@/api/cart';

export const useCartStore = defineStore('cart', () => {
  const count = ref(0);

  function syncFromItems(items: { quantity: number }[]) {
    count.value = items.reduce((sum, i) => sum + i.quantity, 0);
  }

  async function fetchCount() {
    try {
      const data = await fetchCart();
      syncFromItems(data.items);
    } catch {
      count.value = 0;
    }
  }

  function reset() {
    count.value = 0;
  }

  return { count, syncFromItems, fetchCount, reset };
});
