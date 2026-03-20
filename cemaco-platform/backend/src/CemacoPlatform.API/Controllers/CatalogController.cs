using CemacoPlatform.Application.DTOs.Products;
using CemacoPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemacoPlatform.API.Controllers;

/// <summary>
/// Catálogo público: solo productos con inventario por encima de 5
/// </summary>
[ApiController]
[Route("api/catalog")]
public class CatalogController : ControllerBase
{
    private readonly AppDbContext _db;

    public const int MinInventoryForPublicDisplay = 5;

    public CatalogController(AppDbContext db)
    {
        _db = db;
    }

    [AllowAnonymous]
    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts(
        [FromQuery] Guid? categoryId,
        CancellationToken cancellationToken)
    {
        var query = _db.Products.AsNoTracking().AsQueryable()
            .Where(p => p.Inventory > MinInventoryForPublicDisplay);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryName = p.Category!.Name,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Sku = p.Sku,
                Inventory = p.Inventory,
                ImageUrl = p.ImageUrl,
                CreatedAtUtc = p.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [AllowAnonymous]
    [HttpGet("products/{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id, CancellationToken cancellationToken)
    {
        var p = await _db.Products.AsNoTracking()
            .Where(x => x.Id == id && x.Inventory > MinInventoryForPublicDisplay)
            .Select(x => new ProductDto
            {
                Id = x.Id,
                CategoryId = x.CategoryId,
                CategoryName = x.Category!.Name,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                Sku = x.Sku,
                Inventory = x.Inventory,
                ImageUrl = x.ImageUrl,
                CreatedAtUtc = x.CreatedAtUtc
            })
            .FirstOrDefaultAsync(cancellationToken);

        return p is null ? NotFound() : Ok(p);
    }
}
