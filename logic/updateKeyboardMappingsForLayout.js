function updateKeyboardMappingsForLayout() {
	const currentKeyboard = StateManager.get('currentKeyboard') || "ansi";
	switch (currentKeyboard) {
		case "ansi":
			document.querySelector(".cheatsheet").innerHTML = ansiDivs;
			layoutMaps.colemakdh.KeyZ = "x";
			layoutMaps.colemakdh.KeyX = "c";
			layoutMaps.colemakdh.KeyC = "d";
			layoutMaps.colemakdh.KeyV = "v";
			layoutMaps.colemakdh.KeyB = "z";

			layoutMaps.tarmakdh.KeyZ = "x";
			layoutMaps.tarmakdh.KeyX = "c";
			layoutMaps.tarmakdh.KeyC = "d";
			layoutMaps.tarmakdh.KeyV = "v";
			layoutMaps.tarmakdh.KeyB = "z";
			levelDictionaries.tarmakdh.lvl1 = "qwagv";
			levelDictionaries.tarmakdh.lvl3 = "ftbzxc";

			layoutMaps.canary.KeyZ = "j";
			layoutMaps.canary.KeyX = "v";
			layoutMaps.canary.KeyC = "d";
			layoutMaps.canary.KeyV = "g";
			layoutMaps.canary.KeyB = "q";
			layoutMaps.canary.KeyN = "m";
			layoutMaps.canary.KeyG = "b";
			layoutMaps.canary.KeyH = "f";
			layoutMaps.canary.KeyT = "k";
			layoutMaps.canary.KeyU = "x";
			break;
		case "iso":
			document.querySelector(".cheatsheet").innerHTML = isoDivs;
			layoutMaps.colemakdh.IntlBackslash = "z";
			layoutMaps.colemakdh.KeyZ = "x";
			layoutMaps.colemakdh.KeyX = "c";
			layoutMaps.colemakdh.KeyC = "d";
			layoutMaps.colemakdh.KeyV = "v";
			delete layoutMaps.colemakdh.KeyB;

			layoutMaps.tarmakdh.IntlBackslash = "z";
			layoutMaps.tarmakdh.KeyZ = "x";
			layoutMaps.tarmakdh.KeyX = "c";
			layoutMaps.tarmakdh.KeyC = "d";
			layoutMaps.tarmakdh.KeyV = "v";
			delete layoutMaps.tarmakdh.KeyB;
			levelDictionaries.tarmakdh.lvl1 = "qwagv";
			levelDictionaries.tarmakdh.lvl3 = "ftbzxc";

			layoutMaps.canary.IntlBackslash = "q";
			layoutMaps.canary.KeyZ = "j";
			layoutMaps.canary.KeyX = "v";
			layoutMaps.canary.KeyC = "d";
			layoutMaps.canary.KeyV = "g";
			delete layoutMaps.canary.KeyB;
			layoutMaps.canary.KeyN = "m";
			layoutMaps.canary.KeyG = "b";
			layoutMaps.canary.KeyH = "f";
			layoutMaps.canary.KeyT = "k";
			layoutMaps.canary.KeyU = "x";
			break;
		case "ortho":
			document.querySelector(".cheatsheet").innerHTML = orthoDivs;
			layoutMaps.colemakdh.KeyZ = "z";
			layoutMaps.colemakdh.KeyX = "x";
			layoutMaps.colemakdh.KeyC = "c";
			layoutMaps.colemakdh.KeyV = "d";
			layoutMaps.colemakdh.KeyB = "v";

			layoutMaps.tarmakdh.KeyZ = "z";
			layoutMaps.tarmakdh.KeyX = "x";
			layoutMaps.tarmakdh.KeyC = "c";
			layoutMaps.tarmakdh.KeyV = "d";
			layoutMaps.tarmakdh.KeyB = "v";
			levelDictionaries.tarmakdh.lvl1 = "qwagzxc";
			levelDictionaries.tarmakdh.lvl3 = "ftbv";

			layoutMaps.canary.KeyZ = "q";
			layoutMaps.canary.KeyX = "j";
			layoutMaps.canary.KeyC = "v";
			layoutMaps.canary.KeyV = "d";
			layoutMaps.canary.KeyB = "k";
			layoutMaps.canary.KeyN = "x";
			layoutMaps.canary.KeyG = "g";
			layoutMaps.canary.KeyH = "m";
			layoutMaps.canary.KeyT = "b";
			layoutMaps.canary.KeyU = "f";
			break;
	}
}
