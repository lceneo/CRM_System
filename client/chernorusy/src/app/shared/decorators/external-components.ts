export function ExternalComponents(component: Function) {
  return function (constructor: any) {
    constructor.prototype.getExternalComponent = () => component;
  };
}
