export interface PriceTick {
  symbol: string;
  price: number;
  changePercent: number;
  timestamp: number;
}

export interface AlertEvent {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export interface ConnectedUser {
  id: string;
  name: string;
  role: 'trader' | 'risk' | 'ops';
  connectedAt: number;
}

export interface RiskProjection {
  slope: number;
  intercept: number;
  r2: number;
  projectedNext: number;
  sampleSize: number;
}
