import { StripUrlPipe } from './strip-url.pipe';

describe('StripUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new StripUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
