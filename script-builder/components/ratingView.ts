import { notNull } from "../helpers/notNull";
import { cls } from "../helpers/cls";
import { createDiv } from "../html/div";
import {LocalStorage} from "../service/localStorage";
import {prefix} from "../const";
import {createTextarea} from "../html/textarea";
import {createButton} from "../html/button";
import {createStarRating} from "./starRating";
import {socket} from "../index";

export function createRatingView({ id, className, styles }: {
	id?: string,
	className?: string,
	styles?: Partial<CSSStyleDeclaration>
}): [HTMLDivElement, () => void, (show: boolean) => void] {
	const manager = LocalStorage.manager!;
	let curComment: string | null;
	const [panel, closePanel, showPanel] = createDiv({
		className: 'rating-view',
		styles: {
			display: 'flex',
			flexFlow: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			padding: '5px',
			borderRadius: '11px',
			backgroundColor: 'orange',
			gap: '10px',
			textAlign: 'center',
			width: '80%'
		}
	});
	panel.classList.add(`${prefix}-content-center`)
	const [sendBtn, closeSendBtn, showSendBtn, enableSendBtn] = createButton({
		className: 'rating-send-btn',
		text: 'Отправить',
		styles: {
			borderRadius: '10px',
			width: '90%',
			color: '#847575',
			backgroundColor: 'lightgoldenrodyellow',
		}
	});
	enableSendBtn(false);
	const heading = document.createElement('p');
	heading.classList.add(`${prefix}-p`);
	heading.textContent = `Оцените работу менеджера ${manager.name} ${manager.surname}`;
	panel.appendChild(heading);

	let curRating: number = 0;
	const [stars, closeStars] = createStarRating({
		onChange: (rating) => {
			curRating = rating;
			enableSendBtn(true);
		}
	})
	panel.appendChild(stars);

	const [textarea, closeTextarea] = createTextarea({
		placeholder: 'Комментарий',
		onChange: (text) => curComment = text,
		styles: {
			borderRadius: '10px',
			backgroundColor: '#e7e7e7',
			maxWidth: '90%',
			resize: 'vertical',
		}
	});
	panel.appendChild(textarea);

	sendBtn.addEventListener('click', () => {
		socket?.sendRating(curRating, curComment);
		for (const child of panel.childNodes) {
			panel.removeChild(child);
		}
		closeStars();
		closeSendBtn();

		const p = document.createElement('p');
		p.classList.add(`${prefix}-p`);
		p.textContent = 'Спасибо!';
		panel.appendChild(p);
	})
	panel.appendChild(sendBtn);

	const listeners: (() => void)[] = [];

	if (notNull(id)) {
		panel.id = id;
	}
	if (notNull(className)) {
		panel.classList.add(cls(className));
	}

	const style = panel.style;
	Object.assign(style, styles);

	const closeRatingView = () => {
		document.body.removeChild(panel);
		if (listeners) {
			listeners.forEach(l => l());
		}
	}

	const showRatingView = (show: boolean) => {
		if (show) {
			panel.style.visibility = 'visible';
		} else {
			panel.style.visibility = 'hidden';
		}
	}

	return [panel, closeRatingView, showRatingView];
}
