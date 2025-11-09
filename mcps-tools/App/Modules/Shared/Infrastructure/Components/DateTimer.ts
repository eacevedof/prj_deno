export class DateTimer {

	public static getInstance(): DateTimer {
		return new DateTimer();
	}

	public getTimezone(): string {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	}

	public getNowYmdHis(): string {
		const now = new Date();
		return now.toISOString().replace("T", " ").substring(0, 19);
	}

	public getNowAsTimestamp(): number {
		return (new Date()).getTime()
	}

	public getToday(): string {
		const now: Date = new Date();
		const year: number = now.getFullYear();
		const month: string = String(now.getMonth() + 1).padStart(2, "0");
		const day: string = String(now.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`
	}

	public isValidDateYmd(dateString: string): boolean {
		if (!this.isValidDateYmdFormat(dateString)) {
			return false;
		}

		const [year, month, day] = dateString.split("-").map(Number);
		const date: Date = new Date(year, month - 1, day);

		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		);
	}

	public isValidDateYmdFormat(dateString: string): boolean {
		const regex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
		return regex.test(dateString);
	}

	public getDateYmdHisAsString(dateTime: Date|null): string {
		if (!dateTime) return "";

		if (typeof dateTime === "string") {
			const parsedDate = new Date(dateTime);
			if (isNaN(parsedDate.getTime())) return "";
			dateTime = parsedDate;
		}

		if (!(dateTime instanceof Date)) {
			//console.log("dateTime is not a Date instance", dateTime, typeof dateTime);
			return "";
		}

		const year: number = dateTime.getFullYear();
		const month: string = String(dateTime.getMonth() + 1).padStart(2, "0");
		const day: string = String(dateTime.getDate()).padStart(2, "0");
		const hours: string = String(dateTime.getHours()).padStart(2, "0");
		const minutes: string = String(dateTime.getMinutes()).padStart(2, "0");
		const seconds: string = String(dateTime.getSeconds()).padStart(2, "0");
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

}
