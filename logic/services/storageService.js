/**
 * Storage Service - Abstract localStorage operations
 * Centralizes all storage access with error handling
 * Uses revealing module pattern
 */

const StorageService = (function() {
	/**
	 * Get value from localStorage
	 * @param {string} key - Storage key
	 * @param {*} defaultValue - Default value if key doesn't exist
	 * @returns {*} Stored value or default
	 */
	function get(key, defaultValue = null) {
		try {
			const value = localStorage.getItem(key);
			return value !== null ? value : defaultValue;
		} catch (error) {
			console.error(`Error getting ${key} from localStorage:`, error);
			return defaultValue;
		}
	}

	/**
	 * Set value in localStorage
	 * @param {string} key - Storage key
	 * @param {*} value - Value to store (will be stringified)
	 * @returns {boolean} Success status
	 */
	function set(key, value) {
		try {
			if (value === null || value === undefined) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, String(value));
			}
			return true;
		} catch (error) {
			console.error(`Error setting ${key} in localStorage:`, error);
			return false;
		}
	}

	/**
	 * Remove item from localStorage
	 * @param {string} key - Storage key to remove
	 * @returns {boolean} Success status
	 */
	function remove(key) {
		try {
			localStorage.removeItem(key);
			return true;
		} catch (error) {
			console.error(`Error removing ${key} from localStorage:`, error);
			return false;
		}
	}

	/**
	 * Check if key exists in localStorage
	 * @param {string} key - Storage key to check
	 * @returns {boolean} Whether key exists
	 */
	function exists(key) {
		try {
			return localStorage.getItem(key) !== null;
		} catch (error) {
			console.error(`Error checking ${key} in localStorage:`, error);
			return false;
		}
	}

	/**
	 * Clear all localStorage items
	 * @returns {boolean} Success status
	 */
	function clear() {
		try {
			localStorage.clear();
			return true;
		} catch (error) {
			console.error('Error clearing localStorage:', error);
			return false;
		}
	}

	/**
	 * Get all localStorage keys
	 * @returns {Array<string>} Array of all keys
	 */
	function getAllKeys() {
		try {
			const keys = [];
			for (let i = 0; i < localStorage.length; i++) {
				keys.push(localStorage.key(i));
			}
			return keys;
		} catch (error) {
			console.error('Error getting localStorage keys:', error);
			return [];
		}
	}

	/**
	 * Batch get multiple values
	 * @param {Array<string>} keys - Array of keys to retrieve
	 * @param {Object} defaults - Default values for missing keys
	 * @returns {Object} Object with key-value pairs
	 */
	function getBatch(keys, defaults = {}) {
		const result = {};
		keys.forEach(key => {
			result[key] = get(key, defaults[key]);
		});
		return result;
	}

	/**
	 * Batch set multiple values
	 * @param {Object} data - Object with key-value pairs to store
	 * @returns {boolean} Overall success status
	 */
	function setBatch(data) {
		let allSuccess = true;
		Object.keys(data).forEach(key => {
			const success = set(key, data[key]);
			if (!success) {
				allSuccess = false;
			}
		});
		return allSuccess;
	}

	/**
	 * Get storage usage information
	 * @returns {Object} Usage statistics
	 */
	function getUsage() {
		try {
			let totalBytes = 0;
			let itemCount = 0;

			for (let key in localStorage) {
				if (localStorage.hasOwnProperty(key)) {
					const value = localStorage.getItem(key);
					totalBytes += (key.length + value.length) * 2; // UTF-16 encoding
					itemCount++;
				}
			}

			const maxBytes = 5 * 1024 * 1024; // 5MB typical limit
			const usedPercentage = (totalBytes / maxBytes) * 100;

			return {
				totalBytes,
				maxBytes,
				usedPercentage,
				itemCount,
				remainingBytes: maxBytes - totalBytes
			};
		} catch (error) {
			console.error('Error calculating localStorage usage:', error);
			return {
				totalBytes: 0,
				maxBytes: 0,
				usedPercentage: 0,
				itemCount: 0,
				remainingBytes: 0
			};
		}
	}

	// Public API
	return {
		get,
		set,
		remove,
		exists,
		clear,
		getAllKeys,
		getBatch,
		setBatch,
		getUsage
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = StorageService;
} else if (typeof window !== 'undefined') {
	window.StorageService = StorageService;
}