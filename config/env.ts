import arkenv, { type } from "arkenv";

export const env = arkenv({
	// Built-in validators
	APP_HOST: "string.host = 'localhost'",
	APP_PORT: "number.port",
});
