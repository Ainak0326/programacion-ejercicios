import { RemoteWidgetManifest } from "../../../src/app/plugins/plugin.types";
import { NotesWidgetComponent } from "./notes-widget.component";

export const manifest: RemoteWidgetManifest = {
  id: "team-notes",
  title: "Team Notes",
  version: "1.0.0",
  integrity: "sha256-team-notes-v1",
  requiredRoles: ["editor", "viewer"],
  component: NotesWidgetComponent
};
