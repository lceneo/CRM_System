export interface ImportItem {
  title: string;
  import: () => Promise<any>;
}

export function ChartDashboardItem(title: string, module: string) {
  if (charts.find((ch) => ch.title === title)) {
    throw new Error();
  }
  charts.push({
    title,
    import: () => import(`./modules/${module}/${module}.module`),
  });
  return function (constructor: any) {};
}

export const charts: ImportItem[] = [];
