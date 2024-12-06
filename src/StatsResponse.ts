export interface StatsResponse {
  min: number
  max: number
  range: number
  mean: number
  mode: number[]
  q1: number
  median: number
  q3: number
  iqr: number
  outliers: number[]
}
