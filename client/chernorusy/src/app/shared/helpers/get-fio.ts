import { extend } from 'lodash';

export function getFio(client: IFio | null): string {
  if (!client) {
    return '';
  }
  const patro =
    'patronymic' in client
      ? client.patronymic
      : 'patronimic' in client
      ? client.patronimic
      : null;
  return [client.surname ?? null, client.name ?? null, patro]
    .filter(Boolean)
    .join(' ');
}

interface IFioOverall {
  surname: string | null;
  name: string | null;
}

type IFioPatronymic = IFioOverall & {
  patronymic?: string | null;
};

type IFioPatronimic = IFioOverall & {
  patronimic?: string | null;
};

export type IFio = IFioPatronimic | IFioPatronymic;
