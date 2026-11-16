
import { createRoot } from "react-dom/client";
import App from "./App";

const host = document.getElementById("hireyourway-widget");

if (!host) {
  throw new Error("HireYourWay: Host not found");
}

const script = document.currentScript as HTMLScriptElement | null;

const widgetId = script?.dataset.widgetId;

if (!widgetId) {
  throw new Error("HireYourWay: Widget ID missing");
}

const shadow = host.attachShadow({
  mode: "open",
});

const mount = document.createElement("div");

shadow.appendChild(mount);

createRoot(mount).render(
  <App widgetId={widgetId} />
);