<template>
  <el-dialog
    :model-value="open"
    class="legal-document-dialog"
    width="min(840px, calc(100vw - 32px))"
    append-to-body
    align-center
    destroy-on-close
    :lock-scroll="false"
    @close="emit('close')"
  >
    <template #header>
      <div class="legal-document-header">
        <h2>{{ title }}</h2>
        <p>{{ version }}</p>
      </div>
    </template>
    <div class="legal-document-body">
      <slot />
    </div>
  </el-dialog>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])
</script>

<style lang="scss">
.legal-document-dialog {
  overflow: hidden;
  border-radius: 16px;

  .el-dialog__header {
    box-sizing: border-box;
    margin: 0;
    padding: 24px 64px 20px 28px;
    border-bottom: 1px solid #e4e7ec;
  }

  .el-dialog__headerbtn {
    right: 12px;
    top: 12px;
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .el-dialog__body {
    padding: 0;
  }
}

.legal-document-header {
  h2 {
    margin: 0;
    line-height: 1.4;
    font-size: 24px;
    color: #101828;
  }

  p {
    margin: 6px 0 0;
    line-height: 20px;
    font-size: 13px;
    color: #667085;
  }
}

.legal-document-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  box-sizing: border-box;
  max-height: min(70vh, 680px);
  padding: 24px 28px 32px;
  color: #344054;
  scrollbar-gutter: stable;

  h3 {
    margin: 28px 0 12px;
    line-height: 1.5;
    font-size: 18px;
    color: #101828;
  }

  h4 {
    margin: 20px 0 8px;
    line-height: 1.6;
    font-size: 15px;
    color: #1d2939;
  }

  h3:first-child {
    margin-top: 0;
  }

  p {
    margin: 0 0 10px;
    line-height: 1.9;
    text-align: justify;
    font-size: 14px;
  }

  .legal-table-wrap {
    overflow-x: auto;
    margin: 12px 0 20px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    min-width: 620px;
  }

  th,
  td {
    padding: 10px 12px;
    border-right: 1px solid #d0d5dd;
    border-bottom: 1px solid #d0d5dd;
    line-height: 1.65;
    vertical-align: top;
    text-align: left;
    font-size: 13px;
  }

  th {
    background: var(--theme-primary-soft);
    font-weight: 600;
    color: #1d2939;
  }

  th:last-child,
  td:last-child {
    border-right: 0;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
}

@media (width <= 767px) {
  .legal-document-dialog {
    margin-top: max(12px, env(safe-area-inset-top));
    margin-bottom: max(12px, env(safe-area-inset-bottom));

    .el-dialog__header {
      padding: 20px 52px 16px 20px;
    }
  }

  .legal-document-header h2 {
    font-size: 20px;
  }

  .legal-document-body {
    max-height: calc(100dvh - 150px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    padding: 20px 18px 28px;

    h3 {
      font-size: 17px;
    }

    p {
      line-height: 1.8;
      text-align: left;
    }
  }
}
</style>
