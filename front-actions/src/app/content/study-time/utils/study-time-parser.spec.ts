import { parseStudyTime } from './study-time-parser';

describe('parseStudyTime', () => {
  it('should parse minutes without unit', () => {
    expect(
      parseStudyTime('90')
    ).toBe(90);
  });

  it('should parse minutes with unit', () => {
    expect(
      parseStudyTime('90min')
    ).toBe(90);
  });

  it('should parse hours', () => {
    expect(
      parseStudyTime('2h')
    ).toBe(120);
  });

  it('should parse hours and minutes', () => {
    expect(
      parseStudyTime('1h 30min')
    ).toBe(90);
  });

  it('should parse hh:mm format', () => {
    expect(
      parseStudyTime('01:30')
    ).toBe(90);

    expect(
      parseStudyTime('08:45')
    ).toBe(525);
  });

  it('should parse decimal hours using comma', () => {
    expect(
      parseStudyTime('1,5h')
    ).toBe(90);
  });

  it('should parse decimal hours using dot', () => {
    expect(
      parseStudyTime('1.5h')
    ).toBe(90);
  });

  it('should trim surrounding whitespace', () => {
    expect(
      parseStudyTime('  01:30  ')
    ).toBe(90);
  });

  it('should be case insensitive', () => {
    expect(
      parseStudyTime('2H')
    ).toBe(120);

    expect(
      parseStudyTime('30MIN')
    ).toBe(30);
  });

  it('should reject empty values', () => {
    expect(
      parseStudyTime('')
    ).toBeNull();

    expect(
      parseStudyTime('   ')
    ).toBeNull();
  });

  it('should reject invalid values', () => {
    expect(
      parseStudyTime('abc')
    ).toBeNull();

    expect(
      parseStudyTime('1:60')
    ).toBeNull();

    expect(
      parseStudyTime('1h 60min')
    ).toBeNull();
  });

  it('should reject incomplete clock values', () => {
    expect(
      parseStudyTime('1:')
    ).toBeNull();

    expect(
      parseStudyTime(':30')
    ).toBeNull();
  });
});