import {createDiv} from "../html/div";
import {prefix} from "../const";

export function createStarRating({onChange}: {
	onChange: (num: number) => any
}): [HTMLDivElement, () => void, (show: boolean) => void] {
	const [container, closeContainer, showContainer] = createDiv({
		className: 'star-container',
		styles: {
			display: 'grid',
		}
	});
	let curRating;
	const index = Math.random();
	const indexNames = ['one', 'two', 'three', 'four', 'five'];
	const stars = [1, 2, 3, 4, 5].map(() => document.createElement('input'));
	stars.forEach((star, i) => {
		star.type = 'radio'
		star.classList.add(`${prefix}-star`, `${prefix}-star-${indexNames[i]}`);
		star.name = `${prefix}-star-rating-${index}`;
		star.addEventListener('click', () => {
			curRating = i + 1;
			if (onChange) {
				onChange(curRating);
			}
		});
		container.appendChild(star);
	});

	const closeDialog = () => {
		container.remove();
	}

	const showDialog = (show: boolean) => {
		if (show) {
			container.style.visibility = 'visible';
		} else {
			container.style.visibility = 'hidden';
		}
	}

	return [container, closeContainer, showContainer];
}
