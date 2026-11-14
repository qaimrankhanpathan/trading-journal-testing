import { test } from "@playwright/test";

/**
 * @step: a decorator that turns a page object method into a named step in the HTML report and the trace.
 *
 *   @step("Log a trade")
 *   async logTrade(...) { ... }
 *
 * Without it the report lists every single click and fill. With it, the report reads like the test case
 * ("Open the Trades page > Log a trade > ...") and you expand a step to see its clicks.
 * `box: true` makes a failure point at the line in the TEST that called the method, not deep inside the page object.
 */
export function step(name?: string) {
  return function <This extends object, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ) {
    return function (this: This, ...args: Args): Promise<Return> {
      const label = name ?? `${this.constructor.name}.${String(context.name)}`;
      return test.step(label, () => target.call(this, ...args), { box: true });
    };
  };
}
