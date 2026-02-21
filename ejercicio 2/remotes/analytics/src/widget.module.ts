import { RemoteWidgetManifest } from "../../../src/app/plugins/plugin.types";
import { AnalyticsWidgetComponent } from "./analytics-widget.component";

export const manifest: RemoteWidgetManifest = {
  id: "analytics-kpi",
  title: "KPI Analytics",
  version: "1.0.0",
  integrity: "sha256-analytics-kpi-v1",
  requiredRoles: ["editor"],
  component: AnalyticsWidgetComponent
};
