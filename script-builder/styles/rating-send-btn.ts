import {prefix} from "../const";

export const ratingSendBtn = `
	.${prefix}-rating-send-btn:hover {
		background-color: palegoldenrod !important;
	}
	
	.${prefix}-rating-send-btn.${prefix}-disabled {
		background-color: transparent !important;
		pointer-events: none;
	}
`
