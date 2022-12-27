<template>
  <canvas id="canvas" width="600" height="300"></canvas>
</template>
<script setup lang="ts">
import { onMounted, PropType } from "vue";
const props = defineProps({
  xAxis: {
    type: Array as PropType<Array<string>>,
    default: () => ["7.25", "7.26", "7.27", "7.28", "7.29"],
  },
});
console.log(props);
onMounted(() => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas?.getContext) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect(10, 10, 55, 50);

      ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
      ctx.fillRect(30, 30, 55, 50);
    }
  }
});
</script>
<style lang="less" scoped></style>
