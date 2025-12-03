import {env} from "../config/env.ts";
import indexHtml from "../index.html"

const {APP_PORT, APP_HOST} = env;

const server = Bun.serve({
	routes: {
		"/": indexHtml
	},
	hostname: APP_HOST,
	port: APP_PORT,
	error(error) {
		console.error(error);
		return new Response("Internal Server Error", {status: 500});
	},
})

console.log(`Server running at ${server.url}`);
