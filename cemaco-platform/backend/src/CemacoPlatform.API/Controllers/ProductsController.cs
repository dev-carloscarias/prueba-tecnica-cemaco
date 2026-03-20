using CemacoPlatform.Application.DTOs.Products;
using CemacoPlatform.Domain.Entities;
using CemacoPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemacoPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db)
    {
        _db = db;
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Sku = p.Sku,
        Inventory = p.Inventory,
        ImageUrl = p.ImageUrl,
        CreatedAtUtc = p.CreatedAtUtc
    };

    /// <summary>Listado completo para el panel de gestión.</summary>
    [Authorize(Roles = "Admin,Colaborador")]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAll(
        [FromQuery] Guid? categoryId,
        CancellationToken cancellationToken)
    {
        var query = _db.Products.AsNoTracking().AsQueryable();
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

    /// <summary>Detalle para gestión. </summary>
    [Authorize(Roles = "Admin,Colaborador")]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var p = await _db.Products.AsNoTracking()
            .Where(x => x.Id == id)
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

    [Authorize(Roles = "Admin,Colaborador")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest request, CancellationToken cancellationToken)
    {
        if (!await _db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken))
            return BadRequest(new { message = "Categoría no válida." });

        var sku = request.Sku.Trim();
        if (await _db.Products.AnyAsync(p => p.Sku == sku, cancellationToken))
            return Conflict(new { message = "Ya existe un producto con ese SKU." });

        var entity = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Description = request.Description,
            Price = request.Price,
            Sku = sku,
            Inventory = request.Inventory,
            ImageUrl = request.ImageUrl,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Products.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        await _db.Entry(entity).Reference(e => e.Category).LoadAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, MapToDto(entity));
    }

    [Authorize(Roles = "Admin,Colaborador")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken cancellationToken)
    {
        if (!await _db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken))
            return BadRequest(new { message = "Categoría no válida." });

        var entity = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
            return NotFound();

        var sku = request.Sku.Trim();
        if (await _db.Products.AnyAsync(p => p.Sku == sku && p.Id != id, cancellationToken))
            return Conflict(new { message = "Ya existe un producto con ese SKU." });

        entity.CategoryId = request.CategoryId;
        entity.Name = request.Name.Trim();
        entity.Description = request.Description;
        entity.Price = request.Price;
        entity.Sku = sku;
        entity.Inventory = request.Inventory;
        entity.ImageUrl = request.ImageUrl;

        await _db.SaveChangesAsync(cancellationToken);

        await _db.Entry(entity).Reference(e => e.Category).LoadAsync(cancellationToken);

        return Ok(MapToDto(entity));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (entity is null)
            return NotFound();

        _db.Products.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
