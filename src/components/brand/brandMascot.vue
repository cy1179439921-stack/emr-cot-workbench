<template>
  <!-- 颐邦小源 IP 形象：纯矢量绘制（可缩放、可跟随主题），不依赖位图素材 -->
  <svg
    class="brandMascot"
    :width="width"
    :height="height"
    viewBox="0 0 300 420"
    role="img"
    aria-label="颐邦小源 IP 形象"
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mcCoat" x1="0.15" y1="0" x2="0.55" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.62" stop-color="#f6f9ff" />
        <stop offset="1" stop-color="#e3edfb" />
      </linearGradient>
      <linearGradient id="mcCoatShadow" x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0" stop-color="#dde8f8" />
        <stop offset="1" stop-color="#ffffff" />
      </linearGradient>
      <linearGradient id="mcSkin" x1="0.25" y1="0" x2="0.8" y2="1">
        <stop offset="0" stop-color="#ffe6d3" />
        <stop offset="1" stop-color="#f7c9ab" />
      </linearGradient>
      <linearGradient id="mcHair" x1="0.25" y1="0" x2="0.8" y2="1">
        <stop offset="0" stop-color="#3d3d4b" />
        <stop offset="1" stop-color="#1c1c25" />
      </linearGradient>
      <linearGradient id="mcTie" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="#4f8cff" />
        <stop offset="1" stop-color="#1c4dc0" />
      </linearGradient>
      <linearGradient id="mcPants" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" stop-color="#3c4a6a" />
        <stop offset="1" stop-color="#242d43" />
      </linearGradient>
      <linearGradient id="mcShirt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eef5ff" />
        <stop offset="1" stop-color="#d7e6fb" />
      </linearGradient>
      <linearGradient id="mcScreen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#a8c8f5" />
        <stop offset="1" stop-color="#7ea9ea" />
      </linearGradient>
      <radialGradient id="mcGlow" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.92" />
        <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 背景光晕 + 落地投影 -->
    <ellipse cx="150" cy="200" rx="140" ry="176" fill="url(#mcGlow)" />
    <ellipse cx="150" cy="402" rx="76" ry="10" fill="#a9c6ea" opacity="0.4" />

    <!-- 腿 -->
    <rect x="124" y="322" width="22" height="60" rx="9" fill="url(#mcPants)" />
    <rect x="154" y="322" width="22" height="60" rx="9" fill="url(#mcPants)" />
    <!-- 鞋 -->
    <path d="M104 376h32a12 12 0 0 1 12 12 7 7 0 0 1-7 7h-37a8 8 0 0 1-8-8v-2a9 9 0 0 1 8-9z" fill="#ffffff" stroke="#dbe6f6" stroke-width="2" />
    <path d="M108 391h32" stroke="#4d8bff" stroke-width="4" stroke-linecap="round" />
    <path d="M154 376h32a12 12 0 0 1 12 12 7 7 0 0 1-7 7h-37a8 8 0 0 1-8-8v-2a9 9 0 0 1 8-9z" fill="#ffffff" stroke="#dbe6f6" stroke-width="2" />
    <path d="M158 391h32" stroke="#4d8bff" stroke-width="4" stroke-linecap="round" />

    <!-- 白大褂 -->
    <path
      d="M96 208c0-16 18-26 54-26s54 10 54 26l8 108c1 12-6 18-19 18H107c-13 0-20-6-19-18z"
      fill="url(#mcCoat)"
      stroke="#dde8f8"
      stroke-width="2" />
    <!-- 内里衬衫 -->
    <path d="M128 190h44v74c0 10-8 16-22 16s-22-6-22-16z" fill="url(#mcShirt)" />
    <!-- 翻领 -->
    <path d="M128 186l22 26 22-26" fill="none" stroke="#dbe6f6" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M130 188l-16 40 18 10 16-52z" fill="#fbfdff" stroke="#dbe6f6" stroke-width="2" stroke-linejoin="round" />
    <path d="M170 188l16 40-18 10-16-52z" fill="#fbfdff" stroke="#dbe6f6" stroke-width="2" stroke-linejoin="round" />

    <!-- 领带 -->
    <path d="M150 198l-9 9 4 9-6 32 11 12 11-12-6-32 4-9z" fill="url(#mcTie)" />
    <path d="M150 188l-9 10h18z" fill="#2f6fed" />

    <!-- 听诊器 -->
    <path d="M139 194c-13 16-18 30-17 46 0 8 2 14 5 18" fill="none" stroke="#2f6fed" stroke-width="5" stroke-linecap="round" />
    <path d="M161 194c11 12 15 22 14 32" fill="none" stroke="#2f6fed" stroke-width="5" stroke-linecap="round" opacity="0.5" />
    <circle cx="124" cy="264" r="12" fill="#eaf2ff" stroke="#2f6fed" stroke-width="5" />
    <circle cx="124" cy="264" r="3.6" fill="#2f6fed" opacity="0.65" />

    <!-- 胸牌 -->
    <rect x="168" y="234" width="26" height="30" rx="5" fill="#eef5ff" stroke="#c9dcf8" stroke-width="2" />
    <path d="M181 242v14M174 249h14" stroke="#4d8bff" stroke-width="4" stroke-linecap="round" />

    <!-- 左臂 + 手 + 平板（画面左侧） -->
    <path d="M104 214c-10 16-16 34-14 52" fill="none" stroke="#dde8f8" stroke-width="21" stroke-linecap="round" />
    <path d="M104 214c-10 16-16 34-14 52" fill="none" stroke="#fdfeff" stroke-width="17" stroke-linecap="round" />
    <circle cx="92" cy="276" r="11" fill="url(#mcSkin)" />
    <g transform="rotate(-9 80 292)">
      <rect x="58" y="270" width="42" height="52" rx="7" fill="#2b3650" />
      <rect x="62" y="275" width="34" height="42" rx="4" fill="url(#mcScreen)" opacity="0.9" />
      <path d="M68 284h22M68 293h22M68 302h14" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9" />
    </g>
    <ellipse cx="94" cy="282" rx="7" ry="5.5" fill="#f7c9ab" />

    <!-- 右臂 + 手 + 放大镜（画面右侧） -->
    <path d="M196 214c12 8 20-2 26-20" fill="none" stroke="#dde8f8" stroke-width="21" stroke-linecap="round" />
    <path d="M196 214c12 8 20-2 26-20" fill="none" stroke="#fdfeff" stroke-width="17" stroke-linecap="round" />
    <path d="M226 182l10-12" stroke="#2f6fed" stroke-width="8" stroke-linecap="round" />
    <circle cx="224" cy="180" r="11" fill="url(#mcSkin)" />
    <circle cx="250" cy="146" r="25" fill="#dceaff" fill-opacity="0.5" stroke="#2f6fed" stroke-width="7" />
    <path d="M236 133a17 17 0 0 1 15-8" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8" />

    <!-- 脖子（在脸之下） -->
    <path d="M138 150h24v18c0 8-5 12-12 12s-12-4-12-12z" fill="#f2b896" />

    <!-- 耳朵 -->
    <ellipse cx="99" cy="122" rx="9" ry="12" fill="#f7c9ab" />
    <ellipse cx="201" cy="122" rx="9" ry="12" fill="#f7c9ab" />

    <!-- 脸 -->
    <ellipse cx="150" cy="118" rx="52" ry="54" fill="url(#mcSkin)" />
    <ellipse cx="124" cy="140" rx="12" ry="6.5" fill="#ff9d8a" opacity="0.26" />
    <ellipse cx="176" cy="140" rx="12" ry="6.5" fill="#ff9d8a" opacity="0.26" />

    <!-- 头发：整块包住头顶，带几缕碎发刘海 -->
    <path
      d="M97 122c-6-44 14-72 53-72s59 28 53 72c-3-14-6-22-11-27-7 7-14 10-21 8-6-11-14-17-21-17s-15 6-21 17c-7 2-14-1-21-8-5 5-8 13-11 27z"
      fill="url(#mcHair)" />
    <path d="M108 76c10-14 24-21 42-21" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.16" />
    <path d="M192 80c-7-9-15-15-24-18" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.1" />

    <!-- 眉毛 -->
    <path d="M119 101c6-4 14-4 20 0" fill="none" stroke="#2b2b33" stroke-width="4.5" stroke-linecap="round" />
    <path d="M161 101c6-4 14-4 20 0" fill="none" stroke="#2b2b33" stroke-width="4.5" stroke-linecap="round" />

    <!-- 眼睛 -->
    <ellipse cx="128" cy="118" rx="7" ry="8" fill="#2b2b33" />
    <ellipse cx="172" cy="118" rx="7" ry="8" fill="#2b2b33" />
    <circle cx="125.6" cy="115" r="2.4" fill="#ffffff" />
    <circle cx="169.6" cy="115" r="2.4" fill="#ffffff" />

    <!-- 眼镜 -->
    <circle cx="128" cy="118" r="20" fill="none" stroke="#3f4b5e" stroke-width="4.5" />
    <circle cx="172" cy="118" r="20" fill="none" stroke="#3f4b5e" stroke-width="4.5" />
    <path d="M148 118h4" stroke="#3f4b5e" stroke-width="4.5" stroke-linecap="round" />
    <path d="M108 114l-12 6" stroke="#3f4b5e" stroke-width="4" stroke-linecap="round" />
    <path d="M192 114l12 6" stroke="#3f4b5e" stroke-width="4" stroke-linecap="round" />

    <!-- 鼻子 / 嘴 -->
    <path d="M150 128v6" stroke="#e0a385" stroke-width="3" stroke-linecap="round" opacity="0.7" />
    <path d="M139 144c5 6 17 6 22 0" fill="none" stroke="#c06a58" stroke-width="4" stroke-linecap="round" />
  </svg>
</template>

<script setup>
// 尺寸由使用方传入；默认按 190px 宽的登录卡片给出
defineProps({
  width: { type: [Number, String], default: 190 },
  height: { type: [Number, String], default: 266 }
})
</script>

<style scoped>
.brandMascot {
  display: block;
  width: 100%;
  height: auto;
}
</style>
