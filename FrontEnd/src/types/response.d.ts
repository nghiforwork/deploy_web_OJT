export default interface HttpResponseCommon<T> {
  count: number;
  next: string;
  previous: string;
  results: T[] | T;
}
