namespace VanDriverRequisitions.Api.Middleware.Dev;

public sealed class FakeLatencyOptions
{
    public bool Enabled { get; init; }
    public int MinMilliseconds { get; init; } = 0;
    public int MaxMilliseconds { get; init; } = 500;
}