<template>
  <canvas id="canvas" width="600" height="300"></canvas>
</template>
<script setup lang="ts">
import { onMounted, PropType, computed, ref } from "vue";
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const props = defineProps({
  xAxis: {
    type: Array as PropType<Array<string>>,
    default: () => ["7.25", "7.26", "7.27", "7.28", "7.29"],
  },
  yAxis: {
    type: Array as PropType<Array<number>>,
    default: () => [20, 40, 60, 80, 100],
  },
  dataSource: {
    type: Array as PropType<Array<number>>,
    default: () =>
      Array(5)
        .fill(0)
        .map(() => Math.round(Math.random() * 100)),
  },
});
const canvas = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();
const xStepLength = computed(() => 520 / (props.xAxis.length + 1));
const yStepLength = computed(() => 260 / props.yAxis.length);
const init = (ctx: CanvasRenderingContext2D) => {
  const yCutNum = props.yAxis.length;
  const xCutNum = props.xAxis.length + 1;

  if (ctx) {
    drawLine(ctx, 40, 280, 560, 280);
    ctx.stroke();
    drawLine(ctx, 550, 274, 560, 280);
    ctx.stroke();
    drawLine(ctx, 550, 286, 560, 280);
    ctx.stroke();
    // x轴刻度
    for (let i = 1; i < xCutNum; i++) {
      const xPos = 40 + i * xStepLength.value;
      drawDot(ctx, xPos, 280);
      const txt = props.xAxis[i - 1];
      const width = ctx.measureText(txt).width;
      ctx.fillText(txt, xPos - width / 2, 280 + 15);
    }
    drawLine(ctx, 40, 280, 40, 0);
    ctx.stroke();
    drawLine(ctx, 34, 10, 40, 0);
    ctx.stroke();
    drawLine(ctx, 40, 0, 46, 10);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < yCutNum; i++) {
      const yPos = 280 - (i + 1) * yStepLength.value;
      drawDot(ctx, 40, yPos);
      const txt = String(props.yAxis[i]);
      const width = ctx.measureText(txt).width;
      ctx.fillText(txt, 40 - width - 10, yPos + 4);
    }
    for (let i = 0; i < yCutNum; i++) {
      ctx.beginPath();
      const yPos = 280 - (i + 1) * yStepLength.value;
      drawLine(ctx, 40, yPos, 560, yPos);
      ctx.setLineDash([1, 4]);
      ctx.stroke();
    }
  }
};
const realPos = computed(() => {
  return props.dataSource.map((y, idx) => {
    return [40 + (idx + 1) * xStepLength.value, 280 - y * (260 / 100)];
  });
});
const drawDot = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r?: number
) => {
  ctx.save();
  ctx.beginPath(); //不写会和线连起来
  ctx.fillStyle = "red";
  ctx.arc(x, y, r ? r : 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
};
const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  ctx.save();
  ctx.beginPath(); //不写每次都会重绘上次的线

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.strokeStyle = "rgba(255,255,255,1)";
  ctx.stroke();
  ctx.restore();
};
const drawChart = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.moveTo(realPos.value[0][0], realPos.value[0][1]);
  realPos.value.map((pos: number[], idx) => {
    if (idx > 0) {
      ctx.lineTo(pos[0], pos[1]);
      ctx.stroke();
    }
    ctx.beginPath();
    drawDot(ctx, pos[0], pos[1]);
  });
};
const fillChart = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.moveTo(40 + xStepLength.value, 280);
  realPos.value.map((pos: number[]) => {
    ctx.lineTo(pos[0], pos[1]);
  });
  ctx.lineTo(40 + 5 * xStepLength.value, 280);
  ctx.closePath();
  const grd = ctx.createLinearGradient(
    40 + xStepLength.value,
    realPos.value[0][1],
    40 + xStepLength.value,
    280
  );
  grd.addColorStop(0, "black");
  grd.addColorStop(1, "white");
  ctx.fillStyle = grd;
  ctx.fill();
};
const drawSmoothChart = () => {
  const getControlPoints = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    t: number
  ) => {
    const d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    const d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const fa = (t * d01) / (d01 + d12);
    const fb = (t * d12) / (d01 + d12);
    const p1x = x1 - fa * (x2 - x0);
    const p1y = y1 - fa * (y2 - y0);
    const p2x = x1 + fb * (x2 - x0);
    const p2y = y1 + fb * (y2 - y0);
    return [p1x, p1y, p2x, p2y];
  };
  const createControlPoints = (points: number[][], t = 0.5) => {
    let controlPoints = [];
    for (let i = 0; i < points.length - 2; i++) {
      const controlPoint = getControlPoints(
        points[i][0],
        points[i][1],
        points[i + 1][0],
        points[i + 1][1],
        points[i + 2][0],
        points[i + 2][1],
        t
      );
      controlPoints.push(
        [controlPoint[0], controlPoint[1]],
        [controlPoint[2], controlPoint[3]]
      );
    }
    return controlPoints;
  };
  // 三次贝塞尔曲线方程
  const CalculateBezierPointForCubic = (
    t: number,
    p0: number[],
    p1: number[],
    p2: number[],
    p3: number[]
  ) => {
    var point = [0, 0];
    var k = 1 - t;
    point[0] =
      p0[0] * k * k * k +
      3 * p1[0] * t * k * k +
      3 * p2[0] * t * t * k +
      p3[0] * t * t * t;
    point[1] =
      p0[1] * k * k * k +
      3 * p1[1] * t * k * k +
      3 * p2[1] * t * t * k +
      p3[1] * t * t * t;
    return point;
  };
  // 二次贝塞尔曲线方程
  const quadraticBezier = (
    t: number,
    p0: number[],
    p1: number[],
    p2: number[]
  ) => {
    var point = [0, 0];
    var k = 1 - t;
    point[0] = k * k * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    point[1] = k * k * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    return point;
  };

  const cleanCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = "#0cc";
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  // 根据给定的一组点、平滑度绘制出样条曲线
  const drawPointsSmoothLine = (
    ctx: CanvasRenderingContext2D,
    points: number[][],
    t = 0.5
  ) => {
    ctx.beginPath();
    let controlPoints = createControlPoints(points, t);
    for (let i = 0; i < points.length - 1; i++) {
      if (i === 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.quadraticCurveTo(
          controlPoints[0][0],
          controlPoints[0][1],
          points[i + 1][0],
          points[i + 1][1]
        );
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      } else if (i === points.length - 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.quadraticCurveTo(
          controlPoints[controlPoints.length - 1][0],
          controlPoints[controlPoints.length - 1][1],
          points[i + 1][0],
          points[i + 1][1]
        );
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      } else {
        ctx.save();
        ctx.lineTo(points[i][0], points[i][1]);
        ctx.beginPath();
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.bezierCurveTo(
          controlPoints[2 * (i - 1) + 1][0],
          controlPoints[2 * (i - 1) + 1][1],
          controlPoints[2 * (i - 1) + 2][0],
          controlPoints[2 * (i - 1) + 2][1],
          points[i + 1][0],
          points[i + 1][1]
        );
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    }
  };

  // 绘制某个点
  const drawPoint = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color = "#0cc"
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // 需要外部停止绘制时使用
  let animationId = 0;

  // staticData是传入的数据, 这里是一些示例的数据
  const staticData = [
    [10, 341.02601317115307],
    [60, 367.53590353849495],
    [110, 55.44857431904126],
    [160, 228.40188926709214],
    [210, 243.49719756836208],
    [260, 31.12232864622555],
    [310, 312.980045442814],
    [360, 380.36533757874724],
    [410, 153.25910899820738],
    [460, 370.25905804521585],
  ];

  let originPoints = realPos.value;
  // 绘制曲线的平滑度(0到1)
  const smoothDegree = 0.5;

  let startTime: number;

  // 当前时间位于两点间的百分比
  let nowT = 0;

  // 当前的起始点序号
  let nowIndex = 0;

  // 表示每两个点的时间间距是1000毫秒
  let perPointTime = 300;

  const draw = (timestamp: number, ctx: CanvasRenderingContext2D) => {
    if (startTime === undefined) {
      // 第一次进入绘制函数时初始化赋值
      startTime = timestamp;
    }

    // 绘制开始后经过的时间
    const elapsed = timestamp - startTime;

    // 当前处于第intNum个点与第intNum+1个点之间
    let intNum = Math.floor(elapsed / perPointTime);

    // 当前处于第intNum个点与第intNum+1个点之间的百分比(保留两位小数)
    let otherNum =
      Math.floor(
        (elapsed / perPointTime - Math.floor(elapsed / perPointTime)) * 100
      ) / 100;

    nowIndex = intNum;
    nowT = otherNum;

    if (intNum === originPoints.length - 1) {
      // 绘制到最后的点后停止继续绘制
      return;
    }

    // 清空之前的绘制与绘制边框
    cleanCanvas(ctx);

    let points = originPoints.map((item) => {
      return [item[0], item[1]];
    });
    // 算出的控制点数组
    let controlPoints = createControlPoints(originPoints).map((item) => {
      return [item[0], item[1]];
    });

    // 当前时间对应的点
    let NowPoint = [0, 0];

    // 算出当前时间点的x和y坐标,
    if (nowIndex === 0) {
      // 第一段曲线是用二次贝塞尔曲线绘制，所以用二次贝塞尔曲线方程
      NowPoint = quadraticBezier(
        nowT,
        points[nowIndex],
        controlPoints[0],
        points[nowIndex + 1]
      );
    } else if (nowIndex === points.length - 2) {
      // 最后一段曲线是用二次贝塞尔曲线绘制，所以用二次贝塞尔曲线方程
      NowPoint = quadraticBezier(
        nowT,
        points[nowIndex],
        controlPoints[controlPoints.length - 1],
        points[nowIndex + 1]
      );
    } else {
      // 其他段曲线是用三次贝塞尔曲线绘制，所以用三次贝塞尔曲线方程
      NowPoint = CalculateBezierPointForCubic(
        nowT,
        points[nowIndex],
        controlPoints[2 * (nowIndex - 1) + 1],
        controlPoints[2 * (nowIndex - 1) + 2],
        points[nowIndex + 1]
      );
    }

    // 当前点在第一个点和最后一个点之间所占距离的百分比
    const nowLastLinePercent =
      (NowPoint[0] - points[0][0]) /
      (points[points.length - 1][0] - points[0][0]);

    ctx.save();
    // 创建一个线性渐变， 在nowLastLinePercent之前使用之前设置的填充样式，在nowLastLinePercent后设置为透明
    const gradient = ctx.createLinearGradient(
      points[0][0],
      0,
      points[points.length - 1][0],
      0
    );
    gradient.addColorStop(0, ctx.strokeStyle as string);
    gradient.addColorStop(nowLastLinePercent, ctx.strokeStyle as string);
    gradient.addColorStop(nowLastLinePercent, "white");
    gradient.addColorStop(1, "white");

    // 设置填充样式
    ctx.strokeStyle = gradient;

    // 绘制曲线
    drawPointsSmoothLine(ctx, points, smoothDegree);

    // 画出所有节点
    for (let i = 0; i < points.length; i++) {
      drawPoint(ctx, points[i][0], points[i][1], 2, "red");
    }

    // 画出当前所在点
    // drawPoint(smoothCanvasContext2D, NowPoint, 2, 'red')

    animationId = window.requestAnimationFrame((timestamp: number) =>
      draw(timestamp, ctx)
    );
  };

  animationId = window.requestAnimationFrame((timestamp: number) =>
    draw(timestamp, ctx.value!)
  );
};
onMounted(() => {
  canvas.value = document.getElementById("canvas") as HTMLCanvasElement;
  if (canvas.value) {
    ctx.value = canvas.value.getContext("2d") as CanvasRenderingContext2D;
    init(ctx.value);
    drawChart(ctx.value);
    fillChart(ctx.value);
    drawSmoothChart();
  }
});
</script>
<style lang="less" scoped></style>
