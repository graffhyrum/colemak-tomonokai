/**
 * Sound Controller - Audio feedback management
 * Extracted from TypingArea for focused sound handling
 * Uses revealing module pattern
 */

const SoundController = (function() {
	/**
	 * Play click sound for correct input
	 */
	function playClick() {
		if (!StateManager || !SoundService || !SoundService.playClickSound) return;

		const enabled = StateManager.get('playSoundOnClick');
		if (enabled) {
			SoundService.playClickSound(enabled);
		}
	}

	/**
	 * Play error sound for incorrect input
	 */
	function playError() {
		if (!StateManager || !SoundService || !SoundService.playErrorSound) return;

		const enabled = StateManager.get('playSoundOnError');
		if (enabled) {
			SoundService.playErrorSound(enabled);
		}
	}



	// Public API
	return {
		playClick,
		playError
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = SoundController;
} else if (typeof window !== 'undefined') {
	window.SoundController = SoundController;
}