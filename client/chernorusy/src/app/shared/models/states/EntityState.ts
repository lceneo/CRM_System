
export interface IEntityState<T> {
  entities: T[];
  loaded: boolean;
  error: Error | null;
}
