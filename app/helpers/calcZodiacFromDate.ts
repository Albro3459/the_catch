import { isValidDateFormat } from "./dateHelper";

export enum ZodiacSign {
    Aries = "Aries ♈",
    Taurus = " Taurus♉",
    Gemini = "Gemini ♊",
    Cancer = "Cancer ♋",
    Leo = "Leo ♌",
    Virgo = "Virgo ♍",
    Libra = "Libra ♎",
    Scorpio = "Scorpio ♏",
    Sagittarius = "Sagittarius ♐",
    Capricorn = "Capricorn ♑",
    Aquarius = "Aquarius ♒",
    Pisces = "Pisces ♓",
    BadBirthday = "Enter Birthday for Zodiac Sign",
}

export const GetZodiacName = (zodiac : string) => {
    if (zodiac === "Enter Birthday for Zodiac Sign") {
      return ZodiacSign.BadBirthday;
    }
    else return ZodiacSign[zodiac as keyof typeof ZodiacSign];
};

export function calcZodiacFromDate(date: string): string {
    if (!isValidDateFormat(date)) {
        return ""
    }

    const [month, day] = date.split('/').map(Number);

    let astro_sign = "";

    // checks month and date within the  
    // valid range of a specified zodiac 
    if (month === 12) {

        if (day < 22)
            astro_sign = ZodiacSign.Sagittarius;
        else
            astro_sign = ZodiacSign.Capricorn;
    }

    else if (month === 1) {
        if (day < 20)
            astro_sign = ZodiacSign.Capricorn;
        else
            astro_sign = ZodiacSign.Aquarius;
    }

    else if (month === 2) {
        if (day < 19)
            astro_sign = ZodiacSign.Aquarius;
        else
            astro_sign = ZodiacSign.Pisces;
    }

    else if (month === 3) {
        if (day < 21)
            astro_sign = ZodiacSign.Pisces;
        else
            astro_sign = ZodiacSign.Aries;
    }
    else if (month === 4) {
        if (day < 20)
            astro_sign = ZodiacSign.Aries;
        else
            astro_sign = ZodiacSign.Taurus;
    }

    else if (month === 5) {
        if (day < 21)
            astro_sign = ZodiacSign.Taurus;
        else
            astro_sign = ZodiacSign.Gemini;
    }

    else if (month === 6) {
        if (day < 21)
            astro_sign = ZodiacSign.Gemini;
        else
            astro_sign = ZodiacSign.Cancer
    }

    else if (month === 7) {
        if (day < 23)
            astro_sign = ZodiacSign.Cancer;
        else
            astro_sign = ZodiacSign.Leo;
    }

    else if (month === 8) {
        if (day < 23)
            astro_sign = ZodiacSign.Leo;
        else
            astro_sign = ZodiacSign.Virgo;
    }

    else if (month === 9) {
        if (day < 23)
            astro_sign = ZodiacSign.Virgo;
        else
            astro_sign = ZodiacSign.Libra;
    }

    else if (month === 10) {
        if (day < 23)
            astro_sign = ZodiacSign.Libra;
        else
            astro_sign = ZodiacSign.Scorpio;
    }

    else if (month === 11) {
        if (day < 22)
            astro_sign = ZodiacSign.Scorpio;
        else
            astro_sign = ZodiacSign.Sagittarius;
    }

    return astro_sign;
} 

export default {};