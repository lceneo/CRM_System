import { notNull } from "../helpers/notNull";
import { cls } from "../helpers/cls";
import { createDiv } from "../html/div";
import { LocalStorage } from "../service/localStorage";
import { prefix } from "../const";
import { createTextarea } from "../html/textarea";
import { createButton } from "../html/button";
import { createStarRating } from "./starRating";
import { socket } from "../index";
import { createInput } from "../html/input";

export function createClientFormView({
  id,
  className,
  styles,
}: {
  id?: string;
  className?: string;
  styles?: Partial<CSSStyleDeclaration>;
}): [HTMLDivElement, () => void, (show: boolean) => void] {
  const manager = LocalStorage.manager!;
  let curComment: string | null;
  const [panel, closePanel, showPanel] = createDiv({
    className: "client-form-view",
    styles: {
      display: "flex",
      flexFlow: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "5px",
      borderRadius: "11px",
      backgroundColor: "orange",
      gap: "15px",
      textAlign: "center",
      width: "80%",
    },
  });
  panel.classList.add(`${prefix}-content-center`);
  const [sendBtn, closeSendBtn, showSendBtn, enableSendBtn] = createButton({
    className: "rating-send-btn",
    text: "Отправить",
    styles: {
      borderRadius: "10px",
      width: "90%",
      color: "#847575",
      backgroundColor: "lightgoldenrodyellow",
    },
  });
  enableSendBtn(false);
  const heading = document.createElement("p");
  heading.classList.add(`${prefix}-p`);
  heading.textContent = `Представьтесь в чате`;
  panel.appendChild(heading);
  let surname = "";
  let name = "";
  let patronymic = "";
  let emailOrPhone = "";
  let typePhone: boolean | null = null;
  function valid() {
    const i = cls("invalid");
    const add = (input: HTMLInputElement) => input.classList.add(i);
    const rm = (input: HTMLInputElement) => input.classList.remove(i);
    const setDefMsg = (input: HTMLInputElement) => {
      if (
        input.value === "" &&
        !input.classList.contains(cls("client-form-view-patronymic"))
      ) {
        input.parentElement!.setAttribute(
          "data-error-msg",
          "Поле не заполнено"
        );
      } else {
        input.parentElement!.setAttribute(
          "data-error-msg",
          "Неправильный формат"
        );
      }
    };

    setDefMsg(surnameInput);
    setDefMsg(nameInput);
    setDefMsg(patronymicInput);
    setDefMsg(emailOrPhoneInput);

    if (!validityState.surname) {
      add(surnameInput);
    } else {
      rm(surnameInput);
    }
    if (!validityState.name) {
      add(nameInput);
    } else {
      rm(nameInput);
    }
    if (!validityState.patronymic) {
      add(patronymicInput);
    } else {
      rm(patronymicInput);
    }
    if (!validityState.emailOrPhone) {
      add(emailOrPhoneInput);
    } else {
      rm(emailOrPhoneInput);
    }
    return Object.values(validityState).every((v) => !!v);
  }
  function updateSendBtnDisabling() {
    enableSendBtn(valid());
  }
  const validityState = {
    surname: false,
    name: false,
    patronymic: false,
    emailOrPhone: false,
  };

  const notOneWordRegexp = /(\w\s+\w)|\d/;

  const sharedStyles: Partial<CSSStyleDeclaration> = {
    borderBottom: "1px solid black",
    position: "relative",
  };

  const [surnameInput] = createInput({
    realPlaceholder: "Фамилия*",
    type: "string",
    required: true,
    styles: sharedStyles,
    onInput: (ev) => {
      surname = (ev.currentTarget as HTMLInputElement).value.trim();
      if (notOneWordRegexp.test(surname) || surname.length === 0) {
        validityState.surname = false;
        console.warn(surname);
      } else {
        validityState.surname = true;
      }
      updateSendBtnDisabling();
    },
  });
  surnameInput.classList.add(
    cls("client-view-form-input"),
    cls("client-view-form-surname")
  );

  const [nameInput] = createInput({
    realPlaceholder: "Имя*",
    type: "string",
    required: true,
    styles: sharedStyles,
    onInput: (ev) => {
      name = (ev.currentTarget as HTMLInputElement).value.trim();
      if (notOneWordRegexp.test(name) || name.length === 0) {
        console.warn(name);
        validityState.name = false;
      } else {
        validityState.name = true;
      }
      updateSendBtnDisabling();
    },
  });
  nameInput.classList.add(
    cls("client-view-form-input"),
    cls("client-view-form-name")
  );

  const [patronymicInput] = createInput({
    realPlaceholder: "Отчество",
    type: "string",
    required: false,
    styles: sharedStyles,
    onInput: (ev) => {
      patronymic = (ev.currentTarget as HTMLInputElement).value.trim();
      if (notOneWordRegexp.test(patronymic)) {
        console.warn(patronymic);
        validityState.patronymic = false;
      } else {
        validityState.patronymic = true;
      }
      updateSendBtnDisabling();
    },
  });
  patronymicInput.classList.add(
    cls("client-view-form-input"),
    cls("client-view-form-patronymic")
  );

  const phoneRegexp =
    /^\+?\s*\d{1}\s*\(?\s*\d{3}\s*\)?\s*-?\s*\d{3}\s*-?\s*\d{2}\s*-?\s*\d{2}$/;
  const emailRegexp =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const [emailOrPhoneInput] = createInput({
    realPlaceholder: "Телефон или Email*",
    type: "string",
    styles: sharedStyles,
    onInput: (ev) => {
      emailOrPhone = (ev.currentTarget as HTMLInputElement).value.trim();
      const isPhone = phoneRegexp.test(emailOrPhone);
      const isEmail = emailRegexp.test(emailOrPhone);
      if ((!isPhone && !isEmail) || emailOrPhone.length === 0) {
        console.warn(emailOrPhone);
        validityState.emailOrPhone = false;
      } else {
        validityState.emailOrPhone = true;
        console.log({ isPhone, isEmail, emailOrPhone });
      }
      typePhone = !!isPhone;
      updateSendBtnDisabling();
    },
  });
  emailOrPhoneInput.classList.add(
    cls("client-view-form-input"),
    cls("client-view-form-email-or-phone")
  );

  const inputWrappers: HTMLDivElement[] = [];
  [surnameInput, nameInput, patronymicInput, emailOrPhoneInput].forEach(
    (input) => {
      const [inputWrapper] = createDiv({
        className: "client-view-form-input-wrapper",
      });
      inputWrapper.appendChild(input);
      panel.appendChild(inputWrapper);
      inputWrappers.push(inputWrapper);
    }
  );

  //panel.append(surnameInput, nameInput, patronymicInput, emailOrPhoneInput);

  sendBtn.addEventListener("click", () => {
    const client = {
      name: name.length === 0 ? null : name,
      surname: surname.length === 0 ? null : surname,
      patronymic: patronymic.length === 0 ? null : patronymic,
    };
    if (typePhone) {
      client["phone" as unknown as keyof typeof client] = emailOrPhone;
    } else {
      client["email" as unknown as keyof typeof client] = emailOrPhone;
    }
    socket?.sendClient(client);
    inputWrappers.forEach((input) => input.remove());
    heading.remove();
    closeSendBtn();

    const p = document.createElement("p");
    p.classList.add(`${prefix}-p`);
    p.textContent = "Приятно познакомиться!";
    panel.appendChild(p);
  });
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
      listeners.forEach((l) => l());
    }
  };

  const showRatingView = (show: boolean) => {
    if (show) {
      panel.style.visibility = "visible";
    } else {
      panel.style.visibility = "hidden";
    }
  };

  return [panel, closeRatingView, showRatingView];
}
