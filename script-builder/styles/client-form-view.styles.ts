import { cls } from "../helpers/cls";

export const clientFormViewStyles = `
  .${cls("client-view-form-input-wrapper")} {
    position: relative;
  }

  .${cls("client-view-form-input-wrapper")}:after {
    position: absolute;
    font-size: 11px;
    width: 100%;
    color: red;
  }

  .${cls("client-view-form-input-wrapper")}:has(> .${cls("invalid")}):after {
    content: attr(data-error-msg);
  }

  .${cls("client-view-form-input")}.${cls("invalid")} {
    border-color: red !important;
  }

  .${cls("client-view-form-surname")} {

  }

  .${cls("client-view-form-name")} {

  }

  .${cls("client-view-form-patronymic")} {

  }

  .${cls("client-view-form-email-or-phone")} {

  }
`;
