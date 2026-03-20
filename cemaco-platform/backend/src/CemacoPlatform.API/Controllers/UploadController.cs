using CemacoPlatform.Application.DTOs.Files;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CemacoPlatform.API.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadController> _logger;

    public UploadController(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<UploadController> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    [Authorize(Roles = "Admin,Colaborador")]
    [HttpPost("product-image")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadImageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UploadImageResponse>> UploadProductImage(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Selecciona un archivo de imagen." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "La imagen no puede superar 5 MB." });

        var contentType = file.ContentType;
        if (string.IsNullOrEmpty(contentType) || !AllowedContentTypes.Contains(contentType))
            return BadRequest(new { message = "Solo se permiten imágenes JPEG, PNG, GIF o WebP." });

        var ext = GetExtension(contentType, file.FileName);
        if (ext is null)
            return BadRequest(new { message = "No se pudo determinar la extensión del archivo." });

        var uploadsRoot = GetUploadsRoot();
        var productsDir = Path.Combine(uploadsRoot, "products");
        Directory.CreateDirectory(productsDir);

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var physicalPath = Path.Combine(productsDir, fileName);

        await using (var stream = System.IO.File.Create(physicalPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var publicPath = $"/uploads/products/{fileName}";
        _logger.LogInformation("Imagen de producto guardada en {Path}", physicalPath);

        return Ok(new UploadImageResponse { Url = publicPath });
    }

    private string GetUploadsRoot()
    {
        var configured = _configuration["Storage:UploadsPath"];
        if (!string.IsNullOrWhiteSpace(configured))
            return Path.GetFullPath(configured);

        return Path.Combine(_environment.ContentRootPath, "uploads");
    }

    private static string? GetExtension(string contentType, string originalName)
    {
        var fromType = contentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            _ => null
        };
        if (fromType is not null)
            return fromType;

        return Path.GetExtension(originalName)?.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => ".jpg",
            ".png" => ".png",
            ".gif" => ".gif",
            ".webp" => ".webp",
            _ => null
        };
    }
}
