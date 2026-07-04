using Microsoft.AspNetCore.Mvc;

namespace VanDriverRequisitions.Api.Extensions;

public static class ControllerVersioningExtensions
{
    private const string DefaultApiVersion = "1.0";

    public static CreatedAtActionResult CreatedAtVersionedAction(this ControllerBase controller, string actionName, Guid id, object value)
    {
        var apiVersion = controller.HttpContext.RequestedApiVersion?.ToString() ?? DefaultApiVersion;
        return controller.CreatedAtAction(actionName, new { version = apiVersion, id }, value);
    }
}