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

const init = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas?.getContext) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(40, 280);
      ctx.lineTo(560, 280);
      ctx.stroke();
      ctx.moveTo(550, 274);
      ctx.lineTo(560, 280);

      ctx.lineTo(550, 286);
      ctx.stroke();
      ctx.moveTo(40, 280);
      ctx.lineTo(40, 20);
      ctx.moveTo(34, 30);
      ctx.lineTo(40, 20);
      ctx.lineTo(46, 30);
      ctx.stroke();
    }
  }
};
onMounted(() => {
  init();
});
</script>
<style lang="less" scoped></style>
