using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Exceptions;

namespace VanDriverRequisitions.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var statusCode = GetStatusCode(exception);

        LogException(context, exception, statusCode);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        if (exception is ValidationException validationException)
        {
            var errors = validationException.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.ErrorMessage).ToArray());

            await context.Response.WriteAsJsonAsync(
                new
                {
                    type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                    title = "Validation failed",
                    status = StatusCodes.Status400BadRequest,
                    detail = "One or more validation errors occurred.",
                    instance = context.Request.Path,
                    errors,
                    traceId = context.TraceIdentifier
                },
                cancellationToken);

            return true;
        }

        var problemDetails = exception switch
        {
            NotFoundException => CreateProblemDetails(context, StatusCodes.Status404NotFound, "Resource not found", exception.Message),
            ConflictException => CreateProblemDetails(context, StatusCodes.Status409Conflict, "Conflict", exception.Message),
            ForbiddenException => CreateProblemDetails(context, StatusCodes.Status403Forbidden, "Forbidden", exception.Message),
            BadRequestException => CreateProblemDetails(context, StatusCodes.Status400BadRequest, "Bad request", exception.Message),
            InvalidOperationException => CreateProblemDetails(context, StatusCodes.Status400BadRequest, "Bad request", exception.Message),
            UnauthorizedAccessException => CreateProblemDetails(context, StatusCodes.Status401Unauthorized, "Unauthorized", "Authentication is required."),

            _ => CreateProblemDetails(
                context,
                StatusCodes.Status500InternalServerError,
                "Server error",
                env.IsDevelopment()
                    ? exception.Message
                    : "An unexpected error occurred.")
        };

        await context.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            ForbiddenException => StatusCodes.Status403Forbidden,
            BadRequestException or InvalidOperationException => StatusCodes.Status400BadRequest,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };
    }

    private void LogException(HttpContext context, Exception exception, int statusCode)
    {
        var logLevel = exception switch
        {
            ValidationException => LogLevel.Information,
            NotFoundException => LogLevel.Information,
            BadRequestException => LogLevel.Information,
            UnauthorizedAccessException => LogLevel.Information,
            ConflictException => LogLevel.Warning,
            ForbiddenException => LogLevel.Warning,
            InvalidOperationException => LogLevel.Warning,
            _ => LogLevel.Error
        };

        logger.Log(
            logLevel,
            exception,
            "Handled exception {ExceptionType} with status code {StatusCode} for {Method} {Path}.",
            exception.GetType().Name,
            statusCode,
            context.Request.Method,
            context.Request.Path);
    }

    private static ProblemDetails CreateProblemDetails(HttpContext context, int statusCode, string title, string detail)
    {
        return new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path.Value,
            Extensions =
            {
                ["traceId"] = context.TraceIdentifier
            }
        };
    }
}