export interface BaseDataItem {
  _time: number
  cid: string
  channel: string
  level: string
  message: string
}

export interface PolicyDataItem extends BaseDataItem {
  context: string
  policy: {
    args?: string[]
    template: string[]
    description: string
    title: string
  }
}

export interface ProcessMetricsDataItem extends BaseDataItem {
  cpuPerc: number
  eluPerc: number
  mem: {
    heap: number
    heapTotal: number
    ext: number
    rss: number
    buffers: number
  }
}

export interface PipelineDataItem extends BaseDataItem {
  pipeline: string
}

export interface MetricsStoreDataItem extends BaseDataItem {
  numMetrics: number
}

export interface RolesDataItem extends BaseDataItem {
  role: string
  policies: string[]
}

export type DataItem =
  | PolicyDataItem
  | ProcessMetricsDataItem
  | PipelineDataItem
  | MetricsStoreDataItem
  | RolesDataItem
  | BaseDataItem
