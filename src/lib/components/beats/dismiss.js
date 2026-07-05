/**
 * dismissable — shared Svelte action for every beat card: dismiss on
 * tap/click outside the node and on Escape. `value` is
 * { active: boolean, onDismiss: () => void }; listeners are only attached
 * while a card is open.
 */
export function dismissable(node, value) {
	let current = value;

	const onPointerDown = (e) => {
		if (current.active && !node.contains(e.target)) current.onDismiss();
	};
	const onKeyDown = (e) => {
		if (current.active && e.key === 'Escape') {
			e.stopPropagation();
			current.onDismiss();
		}
	};

	function attach() {
		document.addEventListener('pointerdown', onPointerDown, true);
		document.addEventListener('keydown', onKeyDown, true);
	}
	function detach() {
		document.removeEventListener('pointerdown', onPointerDown, true);
		document.removeEventListener('keydown', onKeyDown, true);
	}

	if (current.active) attach();

	return {
		update(next) {
			const was = current.active;
			current = next;
			if (current.active && !was) attach();
			if (!current.active && was) detach();
		},
		destroy: detach
	};
}
