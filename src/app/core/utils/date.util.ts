export class DateUtil {
    static formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}
