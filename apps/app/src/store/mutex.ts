/**
 * Minimal single-flight gate for the token-refresh path.
 * `acquire()` locks and returns a release fn; `wait()` resolves once the
 * current holder (if any) releases, without acquiring.
 */
export class Mutex {
  private locked = false;
  private waiters: (() => void)[] = [];

  isLocked(): boolean {
    return this.locked;
  }

  async acquire(): Promise<() => void> {
    while (this.locked) {
      await new Promise<void>((resolve) => this.waiters.push(resolve));
    }
    this.locked = true;
    return () => {
      this.locked = false;
      const waiters = this.waiters;
      this.waiters = [];
      for (const w of waiters) w();
    };
  }

  async wait(): Promise<void> {
    while (this.locked) {
      await new Promise<void>((resolve) => this.waiters.push(resolve));
    }
  }
}
