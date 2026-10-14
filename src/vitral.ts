import { mount } from "svelte";
import "./app.css";
import VitralPage from "./VitralPage.svelte";

const target = document.getElementById("app");

if (!target) {
  throw new Error("App element not found");
}

const app = mount(VitralPage, { target });

export default app;
