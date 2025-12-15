var wordLists = {
	lvl1: [],
	lvl2: [],
	lvl3: [],
	lvl4: [],
	lvl5: [],
	lvl6: [],
	lvl7: [],
};

var alphabet = "abcdefghijklmnopqrstuvwxyz',.-";

// Trie node structure
function TrieNode() {
	this.children = {};
	this.isWordEnd = false;
}

// Build trie from master list
var trieRoot = null;
function buildTrie(words) {
	const root = new TrieNode();
	for (const word of words) {
		let node = root;
		for (const char of word.toLowerCase()) {
			if (!node.children[char]) {
				node.children[char] = new TrieNode();
			}
			node = node.children[char];
		}
		node.isWordEnd = true;
	}
	return root;
}

// Initialize trie on load
function initializeTrie() {
	if (typeof masterList !== 'undefined' && masterList && masterList.length > 0) {
		trieRoot = buildTrie(masterList);
	}
}

// Initialize if masterList is already available, otherwise wait for it
if (typeof masterList !== 'undefined') {
	initializeTrie();
} else {
	// In case masterList loads after this script
	setTimeout(initializeTrie, 100);
}

// returns true if target (a string) contains at least one letter from
// pattern (an array of chars)
function contains(target, pattern) {
	let value = 0;
	pattern.forEach((letter) => {
		value = value + target.includes(letter);
	});
	return value >= 1;
}

// generates a list of words containing only the given letters using trie + DFS
function generateList(lettersToInclude, requiredLetters) {
	const allowedSet = new Set(lettersToInclude);
	const requiredSet = new Set(requiredLetters.split(""));
	const results = [];
	
	function dfs(node, path, hasRequired) {
		// Prune if path contains excluded letters
		if (path.length > 0 && !allowedSet.has(path[path.length - 1])) {
			return;
		}
		
		// Add word if it meets criteria
		if (node.isWordEnd && path.length > 0 && hasRequired) {
			results.push(path);
		}
		
		// Continue exploring valid children
		for (const [char, childNode] of Object.entries(node.children)) {
			dfs(childNode, path + char, hasRequired || requiredSet.has(char));
		}
	}
	
	dfs(trieRoot, "", false);
	return results;
}
