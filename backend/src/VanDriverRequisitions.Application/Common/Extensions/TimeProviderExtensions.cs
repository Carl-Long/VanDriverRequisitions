namespace VanDriverRequisitions.Application.Common.Extensions;

public static class TimeProviderExtensions
{
    public static DateTime GetUtcDateTime(this TimeProvider timeProvider)
    {
        return timeProvider.GetUtcNow().UtcDateTime;
    }
}