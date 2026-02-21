import "@angular/compiler";
import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideZoneChangeDetection } from "@angular/core";
import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideZoneChangeDetection({ eventCoalescing: true })]
}).catch((err) => console.error(err));
