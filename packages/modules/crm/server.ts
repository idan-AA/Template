import { defineServer } from "../src/define-server";

export default defineServer({
	async seed(client) {
		const { seedCrm } = await import("@app/db/seeds/crm");
		await seedCrm(client);
	},
});
