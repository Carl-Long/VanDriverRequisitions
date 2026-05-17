using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Exceptions;
namespace VanDriverRequisitions.Api.Middleware;

public class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IHostEnvironment env) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, exception.Message);

        var problemDetails = exception switch
        {
            ValidationException validationException
                => CreateValidationProblemDetails(
                    context,
                    validationException),

            NotFoundException
                => CreateProblemDetails(
                    context,
                    StatusCodes.Status404NotFound,
                    "Resource not found",
                    exception.Message),

            ConflictException
                => CreateProblemDetails(
                    context,
                    StatusCodes.Status409Conflict,
                    "Conflict",
                    exception.Message),

            ForbiddenException
                => CreateProblemDetails(
                    context,
                    StatusCodes.Status403Forbidden,
                    "Forbidden",
                    exception.Message),

            BadRequestException
                => CreateProblemDetails(
                    context,
                    StatusCodes.Status400BadRequest,
                    "Bad request",
                    exception.Message),

            UnauthorizedAccessException
                => CreateProblemDetails(
                    context,
                    StatusCodes.Status401Unauthorized,
                    "Unauthorized",
                    "Authentication is required."),

            _ => CreateProblemDetails(
                    context,
                    StatusCodes.Status500InternalServerError,
                    "Server error",
                    env.IsDevelopment()
                        ? exception.Message
                        : "An unexpected error occurred.")
        };

        context.Response.StatusCode =
            problemDetails.Status ?? 500;

        await context.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }

    private static ProblemDetails CreateProblemDetails(
        HttpContext context,
        int statusCode,
        string title,
        string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problemDetails.Extensions["traceId"] =
            context.TraceIdentifier;

        return problemDetails;
    }

    private static ValidationProblemDetails CreateValidationProblemDetails(
        HttpContext context,
        ValidationException exception)
    {
        var errors = exception.Errors
            .GroupBy(x => x.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.ErrorMessage).ToArray());

        var problemDetails = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation failed",
            Detail = "One or more validation errors occurred.",
            Instance = context.Request.Path
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        return problemDetails;
    }
}