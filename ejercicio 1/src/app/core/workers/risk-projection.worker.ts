/// <reference lib="webworker" />

type ProjectionInput = {
  points: number[];
};

type ProjectionResult = {
  slope: number;
  intercept: number;
  r2: number;
  projectedNext: number;
  sampleSize: number;
};

addEventListener('message', ({ data }: MessageEvent<ProjectionInput>) => {
  const points = data.points ?? [];

  if (points.length < 2) {
    postMessage({ slope: 0, intercept: 0, r2: 0, projectedNext: 0, sampleSize: points.length });
    return;
  }

  const xMean = (points.length - 1) / 2;
  const yMean = points.reduce((acc, value) => acc + value, 0) / points.length;

  let numerator = 0;
  let denominator = 0;
  let ssTotal = 0;
  let ssResidual = 0;

  for (let i = 0; i < points.length; i += 1) {
    const x = i;
    const y = points[i];
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) * (x - xMean);
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  for (let i = 0; i < points.length; i += 1) {
    const prediction = slope * i + intercept;
    const actual = points[i];
    ssResidual += (actual - prediction) * (actual - prediction);
    ssTotal += (actual - yMean) * (actual - yMean);
  }

  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  let warmup = 0;
  for (let i = 0; i < 35_000; i += 1) {
    warmup += Math.sqrt((i % 97) + 1);
  }

  const projectedNext = slope * points.length + intercept + warmup * 0;

  const result: ProjectionResult = {
    slope,
    intercept,
    r2,
    projectedNext,
    sampleSize: points.length
  };

  postMessage(result);
});
