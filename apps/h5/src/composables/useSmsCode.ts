import { onUnmounted, ref } from 'vue';
import { showToast } from 'vant';
import { sendSms } from '@/api/auth';

export function useSmsCode(scene: 'register' | 'login' | 'reset') {
  const countdown = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  function clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  async function send(phone: string) {
    if (countdown.value > 0) return;
    if (!/^1\d{10}$/.test(phone)) {
      showToast('请输入正确的手机号');
      return;
    }
    await sendSms(phone, scene);
    showToast('验证码已发送');
    countdown.value = 60;
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) clearTimer();
    }, 1000);
  }

  onUnmounted(clearTimer);

  return { countdown, send };
}
