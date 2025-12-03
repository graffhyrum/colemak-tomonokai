// DOM manipulation utilities with TypeScript

export namespace DOMUtils {
	// Element creation and querying
	export function createElement<K extends keyof HTMLElementTagNameMap>(
		tagName: K,
		options: {
			className?: string;
			id?: string;
			textContent?: string;
			innerHTML?: string;
			attributes?: Record<string, string>;
			styles?: Record<string, string>;
		} = {},
	): HTMLElementTagNameMap[K] {
		const element = document.createElement(tagName);

		if (options.className) element.className = options.className;
		if (options.id) element.id = options.id;
		if (options.textContent) element.textContent = options.textContent;
		if (options.innerHTML) element.innerHTML = options.innerHTML;

		if (options.attributes) {
			Object.entries(options.attributes).forEach(([key, value]) => {
				element.setAttribute(key, value);
			});
		}

		if (options.styles) {
			Object.entries(options.styles).forEach(([property, value]) => {
				(element.style as unknown as Record<string, string>)[property] = value;
			});
		}

		return element;
	}

	export function getElementById<T extends HTMLElement = HTMLElement>(
		id: string,
	): T | null {
		return document.getElementById(id) as T | null;
	}

	export function querySelector<T extends HTMLElement = HTMLElement>(
		selector: string,
	): T | null {
		return document.querySelector(selector);
	}

	export function querySelectorAll<T extends HTMLElement = HTMLElement>(
		selector: string,
	): NodeListOf<T> {
		return document.querySelectorAll(selector);
	}

	// Element manipulation
	export function addClass(element: HTMLElement, className: string): void {
		element.classList.add(className);
	}

	export function removeClass(element: HTMLElement, className: string): void {
		element.classList.remove(className);
	}

	export function toggleClass(element: HTMLElement, className: string): void {
		element.classList.toggle(className);
	}

	export function hasClass(element: HTMLElement, className: string): boolean {
		return element.classList.contains(className);
	}

	export function setAttribute(
		element: HTMLElement,
		name: string,
		value: string,
	): void {
		element.setAttribute(name, value);
	}

	export function getAttribute(
		element: HTMLElement,
		name: string,
	): string | null {
		return element.getAttribute(name);
	}

	export function removeAttribute(element: HTMLElement, name: string): void {
		element.removeAttribute(name);
	}

	export function setText(element: HTMLElement, text: string): void {
		element.textContent = text;
	}

	export function setHTML(element: HTMLElement, html: string): void {
		element.innerHTML = html;
	}

	export function show(element: HTMLElement): void {
		element.style.display = "";
	}

	export function hide(element: HTMLElement): void {
		element.style.display = "none";
	}

	export function toggleVisibility(element: HTMLElement): void {
		element.style.display = element.style.display === "none" ? "" : "none";
	}

	// Style utilities
	export function setStyle(
		element: HTMLElement,
		property: string,
		value: string,
	): void {
		(element.style as unknown as Record<string, string>)[property] = value;
	}

	export function getStyle(element: HTMLElement, property: string): string {
		return getComputedStyle(element).getPropertyValue(property);
	}

	export function setStyles(
		element: HTMLElement,
		styles: Record<string, string>,
	): void {
		Object.entries(styles).forEach(([property, value]) => {
			(element.style as unknown as Record<string, string>)[property] = value;
		});
	}

	// Event handling utilities
	export function addEventListener<K extends keyof HTMLElementEventMap>(
		element: HTMLElement,
		type: K,
		listener: (event: HTMLElementEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions,
	): void {
		element.addEventListener(type, listener, options);
	}

	export function removeEventListener<K extends keyof HTMLElementEventMap>(
		element: HTMLElement,
		type: K,
		listener: (event: HTMLElementEventMap[K]) => void,
		options?: boolean | EventListenerOptions,
	): void {
		element.removeEventListener(type, listener, options);
	}

	// Form utilities
	export function getFormValue(
		element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
	): string {
		return element.value;
	}

	export function setFormValue(
		element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
		value: string,
	): void {
		element.value = value;
	}

	export function isChecked(element: HTMLInputElement): boolean {
		return element.checked;
	}

	export function setChecked(
		element: HTMLInputElement,
		checked: boolean,
	): void {
		element.checked = checked;
	}

	// Focus utilities
	export function focus(element: HTMLElement): void {
		element.focus();
	}

	export function blur(element: HTMLElement): void {
		element.blur();
	}

	// Animation utilities
	export function fadeIn(
		element: HTMLElement,
		duration: number = 300,
	): Promise<void> {
		return new Promise((resolve) => {
			element.style.opacity = "0";
			element.style.display = "";
			element.style.transition = `opacity ${duration}ms ease-in-out`;

			requestAnimationFrame(() => {
				element.style.opacity = "1";
			});

			setTimeout(() => {
				element.style.transition = "";
				resolve();
			}, duration);
		});
	}

	export function fadeOut(
		element: HTMLElement,
		duration: number = 300,
	): Promise<void> {
		return new Promise((resolve) => {
			element.style.transition = `opacity ${duration}ms ease-in-out`;
			element.style.opacity = "0";

			setTimeout(() => {
				element.style.display = "none";
				element.style.transition = "";
				resolve();
			}, duration);
		});
	}

	// Utility methods
	export function isVisible(element: HTMLElement): boolean {
		return (
			element.offsetWidth > 0 ||
			element.offsetHeight > 0 ||
			element.getClientRects().length > 0
		);
	}

	export function getBoundingRect(element: HTMLElement): DOMRect {
		return element.getBoundingClientRect();
	}

	export function scrollTo(
		element: HTMLElement,
		options?: ScrollToOptions,
	): void {
		element.scrollTo(options);
	}

	export function scrollIntoView(
		element: HTMLElement,
		options?: ScrollIntoViewOptions,
	): void {
		element.scrollIntoView(options);
	}
}
