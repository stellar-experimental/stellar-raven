import { defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
	accountId: "ba55b7ae9acfb3ed152103e3497c0752",
	worker: {
		name: "stellar-raven-openai-verification",
		compatibilityDate: "2026-09-25",
		entrypoint,
		workersDev: false,
		previewUrls: false,
		triggers: [triggers.fetch({
			pattern: "raven.stellar.org/.well-known/openai-apps-challenge",
			zone: "stellar.buzz",
		})],
	},
});
