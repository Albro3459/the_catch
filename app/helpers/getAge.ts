export const GetAge = (birthday: string) => {
    try {
        // Parse the birthday string
        const dateParts = birthday.split("/");
        if (dateParts.length < 3) throw new Error("Invalid date format");

        let month = parseInt(dateParts[0], 10);
        let day = parseInt(dateParts[1], 10);
        let year = parseInt(dateParts[2], 10);

        // Adjust year for two-digit formats (assumes 1900-2099)
        if (year < 100) {
            const currentYear = new Date().getFullYear();
            const currentCentury = Math.floor(currentYear / 100) * 100;
            year += year < currentYear % 100 ? currentCentury : currentCentury - 100;
        }

        // Construct the date object
        const birthDate = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
        const today = new Date();

        // Calculate age
        let age = today.getFullYear() - birthDate.getFullYear();
        const isBeforeBirthdayThisYear =
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

        if (isBeforeBirthdayThisYear) {
            age--;
        }

        return age;
    } catch (error) {
        console.log(`Error parsing birthday: ${error}`);
        return "null"; // Return null for invalid dates
    }
};

export default GetAge;