import { Routes } from "@angular/router";
import { CmsPageComponent } from "./pages/cms-page.component";
import { PluginPreviewPageComponent } from "./pages/plugin-preview-page.component";
import { pluginIntegrityGuard } from "./security/plugin-integrity.guard";

export const routes: Routes = [
  {
    path: "",
    component: CmsPageComponent
  },
  {
    path: "plugin/:id",
    component: PluginPreviewPageComponent,
    canActivate: [pluginIntegrityGuard]
  }
];
