/**
 * Sound Service - Manage all audio operations
 * Handles click and error sounds with preference checking
 * Uses revealing module pattern
 */

const SoundService = (function() {
	// Private audio cache
	let _audioCache = {};
	let _isInitialized = false;

	/**
	 * Initialize audio files
	 * @param {string} basePath - Base path for sound files
	 */
	function initialize(basePath = 'sound/') {
		if (_isInitialized) return;

		try {
			// Cache error sound
			_audioCache.error = new Audio(`${basePath}error.wav`);
			
			// Cache click sounds with duplicates to prevent cut-off
			_audioCache.clicks = [
				{
					sounds: [
						new Audio(`${basePath}click1.wav`),
						new Audio(`${basePath}click1.wav`)
					],
					counter: 0
				},
				{
					sounds: [
						new Audio(`${basePath}click2.wav`),
						new Audio(`${basePath}click2.wav`)
					],
					counter: 0
				},
				{
					sounds: [
						new Audio(`${basePath}click3.wav`),
						new Audio(`${basePath}click3.wav`)
					],
					counter: 0
				},
				{
					sounds: [
						new Audio(`${basePath}click4.wav`),
						new Audio(`${basePath}click4.wav`)
					],
					counter: 0
				},
				{
					sounds: [
						new Audio(`${basePath}click5.wav`),
						new Audio(`${basePath}click5.wav`)
					],
					counter: 0
				},
				{
					sounds: [
						new Audio(`${basePath}click6.wav`),
						new Audio(`${basePath}click6.wav`)
					],
					counter: 0
				}
			];

			_isInitialized = true;
		} catch (error) {
			console.error('Error initializing SoundService:', error);
		}
	}

	/**
	 * Play click sound
	 * @param {boolean} enabled - Whether sound should play
	 */
	function playClickSound(enabled) {
		if (!enabled || !_isInitialized) return;

		try {
			const rand = Math.floor(Math.random() * 6);
			const clickSound = _audioCache.clicks[rand];

			// Use duplicate sounds to prevent cut-off
			clickSound.counter++;
			if (clickSound.counter === 2) clickSound.counter = 0;

			const sound = clickSound.sounds[clickSound.counter];
			sound.currentTime = 0;
			sound.play().catch(error => {
				console.error('Error playing click sound:', error);
			});
		} catch (error) {
			console.error('Error in playClickSound:', error);
		}
	}

	/**
	 * Play error sound
	 * @param {boolean} enabled - Whether sound should play
	 */
	function playErrorSound(enabled) {
		if (!enabled || !_isInitialized) return;

		try {
			_audioCache.error.currentTime = 0;
			_audioCache.error.play().catch(error => {
				console.error('Error playing error sound:', error);
			});
		} catch (error) {
			console.error('Error in playErrorSound:', error);
		}
	}

	/**
	 * Stop all currently playing sounds
	 */
	function stopAllSounds() {
		if (!_isInitialized) return;

		try {
			// Stop error sound
			if (_audioCache.error) {
				_audioCache.error.pause();
				_audioCache.error.currentTime = 0;
			}

			// Stop click sounds
			if (_audioCache.clicks) {
				_audioCache.clicks.forEach(clickGroup => {
					clickGroup.sounds.forEach(sound => {
						sound.pause();
						sound.currentTime = 0;
					});
				});
			}
		} catch (error) {
			console.error('Error stopping sounds:', error);
		}
	}

	/**
	 * Preload sounds for better performance
	 * @param {string} basePath - Base path for sound files
	 */
	function preloadSounds(basePath = 'sound/') {
		if (!_isInitialized) {
			initialize(basePath);
		}

		try {
			// Preload all sounds by setting volume to 0 and playing
			const allSounds = [_audioCache.error];
			_audioCache.clicks.forEach(clickGroup => {
				allSounds.push(...clickGroup.sounds);
			});

			allSounds.forEach(sound => {
				if (sound && sound.readyState < 4) {
					sound.volume = 0;
					sound.play().then(() => {
						sound.pause();
						sound.currentTime = 0;
						sound.volume = 1;
					}).catch(() => {
						sound.currentTime = 0;
						sound.volume = 1;
					});
				}
			});
		} catch (error) {
			console.error('Error preloading sounds:', error);
		}
	}

	/**
	 * Check if audio is supported
	 * @returns {boolean} Whether audio is supported
	 */
	function isAudioSupported() {
		return typeof Audio !== 'undefined';
	}

	/**
	 * Get initialization status
	 * @returns {boolean} Whether service is initialized
	 */
	function isReady() {
		return _isInitialized;
	}

	/**
	 * Clear audio cache
	 */
	function dispose() {
		stopAllSounds();
		_audioCache = {};
		_isInitialized = false;
	}

	/**
	 * Set volume for all sounds
	 * @param {number} volume - Volume level (0.0 to 1.0)
	 */
	function setVolume(volume) {
		if (!_isInitialized) return;

		try {
			// Set error sound volume
			if (_audioCache.error) {
				_audioCache.error.volume = Math.max(0, Math.min(1, volume));
			}

			// Set click sound volumes
			if (_audioCache.clicks) {
				_audioCache.clicks.forEach(clickGroup => {
					clickGroup.sounds.forEach(sound => {
						sound.volume = Math.max(0, Math.min(1, volume));
					});
				});
			}
		} catch (error) {
			console.error('Error setting volume:', error);
		}
	}

	// Initialize automatically
	initialize();

	// Public API
	return {
		initialize,
		playClickSound,
		playErrorSound,
		stopAllSounds,
		preloadSounds,
		isAudioSupported,
		isReady,
		dispose,
		setVolume
	};
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = SoundService;
} else if (typeof window !== 'undefined') {
	window.SoundService = SoundService;
}