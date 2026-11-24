<template>
  <MedicalRecordList :need-check-permission="needCheckPermission" :had-permission-list="hadPermissionList" demo />
</template>

<script setup>
import MedicalRecordList from '@/components/research/medicalRecordList.vue'
import { getPagePermission } from '@/hooks/permissionHooks'

const { needCheckPermission, hadPermissionList } = getPagePermission('/proofreadingManagement')
</script>
