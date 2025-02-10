export function isValidDateFormat(date: string): RegExpMatchArray | null {
    // Regular expression to match MM/DD/YYYY, M/D/YYYY, MM/DD/YY, or M/D/YY format
    const dateFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;

    return date.match(dateFormat);
}

export function stringToDate(dateString: string): Date | null {
    // Regular expressions to match supported formats    
    const dateMatch = isValidDateFormat(dateString);

    if (!dateMatch) {
      console.warn(`Invalid date format: ${dateString}`);
      return null;
    }
  
    const [, month, day, year] = dateMatch;
  
    // Normalize the year to handle 2-digit and 4-digit formats
    const normalizedYear = year.length === 2 
      ? (year >= "50" ? "19" + year : "20" + year) 
      : year;
  
    // Create and return the Date object
    const date = new Date(
        parseInt(normalizedYear, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10)
      );
  
    // Validate the date to ensure it's valid (e.g., no Feb 30th)
    if (date.getFullYear() === parseInt(normalizedYear, 10) &&
        date.getMonth() === parseInt(month, 10) - 1 &&
        date.getDate() === parseInt(day, 10)) {
      return date;
    } else {
      console.warn("Invalid date");
      return null;
    }
}

export function dateToString(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear().toString();
  
    return `${month}/${day}/${year}`;
}

export default {};