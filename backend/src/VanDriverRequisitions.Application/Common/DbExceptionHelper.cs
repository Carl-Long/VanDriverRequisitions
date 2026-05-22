using Microsoft.EntityFrameworkCore;

namespace VanDriverRequisitions.Application.Common;

public static class DbExceptionHelper
{
    public static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        return ex.InnerException?.Message.Contains("UNIQUE", StringComparison.CurrentCultureIgnoreCase) == true;
    }
    
}