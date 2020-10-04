/* global Meteor */

import assert from "assert";
import "../imports/api/tasks.tests.js";

describe("meteor-react", function () {
	it("package.json has correct name", async function () {
		const packageJson = await import("../package.json");
		const {name} = packageJson;
		assert.strictEqual(name, "meteor-react");
	});

	if (Meteor.isClient) {
		it("client is not server", function () {
			assert.strictEqual(Meteor.isServer, false);
		});
	}

	if (Meteor.isServer) {
		it("server is not client", function () {
			assert.strictEqual(Meteor.isClient, false);
		});
	}
});
