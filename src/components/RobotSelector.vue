<script setup lang="ts">
/*
RobotSelector.vue -- Vue 3 component for selecting a robot from a list

Authors:
  Kyle Walker
*/
import { defineEmits, inject } from 'vue'
import Listbox from 'primevue/listbox'
import { Robot } from '@/robot'

defineEmits<{(e: 'robotSelected', robot: Robot | null): void}>()
const selectedRobot = inject<Robot | null>('selectedRobot')
const robots = inject<Robot[]>('robots')
</script>

<template>
  <div class="card flex justify-content-center">
    <!-- Need to slice the robots array to force the list to update reactively -->
    <Listbox v-model="selectedRobot" @change="$emit('robotSelected', selectedRobot)" :options="robots?.slice(0)" />
  </div>
</template>
