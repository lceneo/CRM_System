import {cls} from "../../helpers/cls";

export const rotateAnimation = `
    @-webkit-keyframes rotating /* Safari and Chrome */ {
  from {
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes rotating {
  from {
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.${cls('rotating')} {
  -webkit-animation: rotating 2s ease-out infinite;
  -moz-animation: rotating 2s ease-out infinite;
  -ms-animation: rotating 2s ease-out infinite;
  -o-animation: rotating 2s ease-out infinite;
  animation: rotating 2s ease-out infinite;
}
`
