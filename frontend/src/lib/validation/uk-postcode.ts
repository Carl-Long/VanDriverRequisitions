const ukPostcodeOutwardCodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

export function normaliseUkPostcodeOutwardCode(value: string) {
    return value.trim().replace(/\s+/g, "").toUpperCase();
}


// This accepts partial postcode zones like:
// M1
// B33
// CR2
// DN55
// SW1A
// EC1A
export function isUkPostcodeOutwardCode(value: string) {
    return ukPostcodeOutwardCodeRegex.test(
        normaliseUkPostcodeOutwardCode(value),
    );
}