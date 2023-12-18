import { prefix } from "../const";

export function cls(className: string) {
	return className === '' ? prefix : `${prefix}-${className}`;
}
