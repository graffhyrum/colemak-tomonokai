// Base component class using modern DOM APIs
export abstract class Component {
	protected element: HTMLElement;
	protected children: Component[] = [];

	constructor(tagName: string = "div", className: string = "") {
		this.element = document.createElement(tagName);
		if (className) {
			this.element.className = className;
		}
	}

	// DOM manipulation methods
	appendTo(parent: HTMLElement | Component): this {
		const parentElement = parent instanceof Component ? parent.element : parent;
		parentElement.appendChild(this.element);
		return this;
	}

	remove(): this {
		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		return this;
	}

	// Child management
	addChild(child: Component): this {
		this.children.push(child);
		child.appendTo(this);
		return this;
	}

	removeChild(child: Component): this {
		const index = this.children.indexOf(child);
		if (index > -1) {
			this.children.splice(index, 1);
			child.remove();
		}
		return this;
	}

	// Element properties
	setText(text: string): this {
		this.element.textContent = text;
		return this;
	}

	setHTML(html: string): this {
		this.element.innerHTML = html;
		return this;
	}

	addClass(className: string): this {
		this.element.classList.add(className);
		return this;
	}

	removeClass(className: string): this {
		this.element.classList.remove(className);
		return this;
	}

	toggleClass(className: string): this {
		this.element.classList.toggle(className);
		return this;
	}

	hasClass(className: string): boolean {
		return this.element.classList.contains(className);
	}

	setAttribute(name: string, value: string): this {
		this.element.setAttribute(name, value);
		return this;
	}

	getAttribute(name: string): string | null {
		return this.element.getAttribute(name);
	}

	removeAttribute(name: string): this {
		this.element.removeAttribute(name);
		return this;
	}

	// Style methods
	setStyle(property: string, value: string): this {
		(this.element.style as unknown as Record<string, string>)[property] = value;
		return this;
	}

	getStyle(property: string): string {
		return getComputedStyle(this.element).getPropertyValue(property);
	}

	// Event handling
	addEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (event: HTMLElementEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions,
	): this {
		this.element.addEventListener(type, listener, options);
		return this;
	}

	removeEventListener<K extends keyof HTMLElementEventMap>(
		type: K,
		listener: (event: HTMLElementEventMap[K]) => void,
		options?: boolean | EventListenerOptions,
	): this {
		this.element.removeEventListener(type, listener, options);
		return this;
	}

	// Query methods
	querySelector(selector: string): HTMLElement | null {
		return this.element.querySelector(selector);
	}

	querySelectorAll(selector: string): NodeListOf<HTMLElement> {
		return this.element.querySelectorAll(selector);
	}

	// Focus methods
	focus(): this {
		this.element.focus();
		return this;
	}

	blur(): this {
		this.element.blur();
		return this;
	}

	// Abstract methods that subclasses should implement
	abstract render(): void;
	abstract destroy(): void;

	// Getters
	getElement(): HTMLElement {
		return this.element;
	}

	getChildren(): Component[] {
		return [...this.children];
	}
}
