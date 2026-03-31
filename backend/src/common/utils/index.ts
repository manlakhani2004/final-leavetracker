import * as bcrypt from 'bcrypt';

export class Utils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static getWorkingDaysBetweenDates(
    startDate: Date,
    endDate: Date,
    workingDays: string[],
    holidays: Date[],
  ): number {
    let count = 0;
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    const holidayStrings = holidays.map((h) => h.toDateString());

    while (currentDate <= end) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = currentDate.toDateString();

      if (workingDays.includes(dayName) && !holidayStrings.includes(dateStr)) {
        count++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }

  static isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }
}
