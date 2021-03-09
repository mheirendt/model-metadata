declare global {
    interface Date {
        addDays(days: number): Date;
    }
    interface String {
        capitalize(): string;
        camelcase(): string;
        kebabcase(): string;
        isISODateString(): boolean;
        isNumeric(): boolean;
        toNumber(): number;
    }
}
Date.prototype.addDays = function (days: number): Date {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);

    // Always convert the string to ISO string
    date.toString = date.toISOString;

    return date;
};

String.prototype.isISODateString = function (): boolean {
    const value = this.valueOf();
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value) || isNaN(Date.parse(value))) return false;
    const d = new Date(value);
    return d.toISOString() === value;
};

String.prototype.isNumeric = function (): boolean {
    return !Number.isNaN(Number(this.valueOf()));
};

String.prototype.toNumber = function (): number {
    return this.valueOf().isNumeric() ? Number(this.valueOf()) : 0;
};

String.prototype.capitalize = function (): string {
    const val = this.valueOf();
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};

String.prototype.camelcase = function (): string {
    return this.valueOf()
        .replace(/\s(.)/g, function (a) {
            return a.toUpperCase();
        })
        .replace(/\s/g, '')
        .replace(/^(.)/, function (b) {
            return b.toLowerCase();
        });
};

String.prototype.kebabcase = function (): string {
    const result = this.valueOf().replace(/[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g, function (match) {
        return '-' + match.toLowerCase();
    });
    if (!result.startsWith('-')) return result;
    return result.slice(1);
};
export { };