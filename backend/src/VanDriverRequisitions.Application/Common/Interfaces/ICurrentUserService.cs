namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string UserName { get; }
    bool IsAuthenticated { get; }
    IEnumerable<string> Roles { get; }
    
    bool IsInRole(string role);
}