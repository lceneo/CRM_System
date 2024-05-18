import { sendButtonStyles } from "./send-button.styles";
import { openChatButtonStyles } from "./open-chat-button.styles";
import { chatDialogWrapperStyles } from "./chat-dialog-wrapper.styles";
import { chatFooterStyles } from "./chat-footer.styles";
import { sendInputStyles } from "./send-input.styles";
import { chatContentStyles } from "./chat-content.styles";
import {messageViewStyles} from "./message-view.styles";
import {borderStyles} from "./border.styles";
import {animations} from "./animations";
import {loadingStyles} from "./loading.styles";
import {activeStatusMessage} from "./active-status-message";
import {iconStyles} from "./icon.styles";
import {linkStyles} from "./link.styles";
import {starStyles} from "./star.styles";
import {ratingSendBtn} from "./rating-send-btn";
import {PStyles} from "./p.styles";

export const cssStyles = [
	animations,
	sendButtonStyles,
	openChatButtonStyles,
	chatDialogWrapperStyles,
	chatFooterStyles,
	sendButtonStyles,
	sendInputStyles,
	chatContentStyles,
	messageViewStyles,
	borderStyles,
	loadingStyles,
	activeStatusMessage,
	iconStyles,
	linkStyles,
	starStyles,
	ratingSendBtn,
	PStyles,
].join('\t');

