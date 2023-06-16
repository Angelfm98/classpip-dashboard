import { TeamExcludePipe } from '../servicios/team-exclude.pipe';

describe('TeamExcludePipe', () => {
  it('create an instance', () => {
    const pipe = new TeamExcludePipe();
    expect(pipe).toBeTruthy();
  });
});
