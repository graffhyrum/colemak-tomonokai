import arkenv from "arkenv";

export const env = arkenv({
	// Built-in validators
	APP_HOST: "string.host = 'localhost'",
	APP_PORT: "number.port",
	// Test configuration
	PLAYWRIGHT_FULL_TEST: "boolean = false",
});
