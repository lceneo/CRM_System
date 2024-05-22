import { Component, ComponentDecorator } from '@angular/core';

export interface ImportItem {
  id: number | string;
  dashboardTitle?: string | null;
  title: string;
  import: () => Promise<any>;
  component?: () => any;
  children?: ImportItem[];
}

let id = 0;

export function ChartDashboardMenu(
  title: string,
  module: string,
  dashboardTitle?: string | null,
  config?: { title: string; dashboardTitle: string; component: any }[]
) {
  let menu = charts.find((ch) => ch.title === title);
  if (!menu) {
    menu = {
      id: title,
      title,
      dashboardTitle,
      import: () => import(`./modules/${module}/${module}.module`),
    };
    charts.push(menu);
  }
  if (config) {
    config.forEach((subMenu) => {
      const subMenuItem: ImportItem = {
        id: `${title}:${subMenu.title}`,
        title: subMenu.title,
        dashboardTitle,
        import: () => import(`./modules/${module}/${module}.module`),
        component: () => subMenu.component,
      };
      if (!menu!.children) {
        menu!.children = [];
      }
      menu!.children!.push(subMenuItem);
    });
  }
  return function (constructor: any) {};
}

export function ChartDashboardItem(title: string, module: string) {
  if (charts.find((ch) => ch.title === title)) {
    throw new Error();
  }
  // charts.push({
  //   id: id++,
  //   title,
  //   import: () => import(`./modules/${module}/${module}.module`),
  // });
  return function (constructor: any) {};
}

export const charts: ImportItem[] = [];
