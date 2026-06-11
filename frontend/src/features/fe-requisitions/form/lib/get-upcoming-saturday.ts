export function getUpcomingSaturday(
    from = new Date(),
) {
    const date =
        new Date(from);

    const day =
        date.getDay();

    const daysUntilSaturday =
        (6 - day + 7) % 7;

    date.setDate(
        date.getDate() +
        daysUntilSaturday,
    );

    date.setHours(
        0,
        0,
        0,
        0,
    );

    return date;
}