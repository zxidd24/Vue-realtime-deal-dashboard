<template>
  <div 
    v-show="showButton" 
    class="back-to-top"
    @click="scrollToTop"
    :class="{ 'fade-in': showButton }"
  >
    <div class="icon-container">
      <div class="orange-line"></div>
      <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20L12 4M12 4L6 10M12 4L18 10" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span class="button-text">返回顶部</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)

const checkScrollPosition = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScrollPosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScrollPosition)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  opacity: 0;
  transform: translateY(20px);
}

.back-to-top:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.back-to-top.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.icon-container {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  position: relative;
}

.orange-line {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: #FF9800;
  border-radius: 1px;
}

.arrow-icon {
  width: 24px;
  height: 24px;
}

.button-text {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 70px;
    height: 70px;
  }
  
  .icon-container {
    width: 28px;
    height: 28px;
  }
  
  .arrow-icon {
    width: 20px;
    height: 20px;
  }
  
  .button-text {
    font-size: 11px;
  }
}
</style>
