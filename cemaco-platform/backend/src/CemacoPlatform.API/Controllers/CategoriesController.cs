using CemacoPlatform.Application.DTOs.Categories;
using CemacoPlatform.Domain.Entities;
using CemacoPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemacoPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db)
    {
        _db = db;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _db.Categories.AsNoTracking()
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                SortOrder = c.SortOrder
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [Authorize(Roles = "Admin,Colaborador")]
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrEmpty(name))
            return BadRequest(new { message = "El nombre es obligatorio." });

        if (await _db.Categories.AnyAsync(c => c.Name == name, cancellationToken))
            return Conflict(new { message = "Ya existe una categoría con ese nombre." });

        var entity = new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            SortOrder = request.SortOrder
        };

        _db.Categories.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new CategoryDto
        {
            Id = entity.Id,
            Name = entity.Name,
            SortOrder = entity.SortOrder
        });
    }

    [Authorize(Roles = "Admin,Colaborador")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (entity is null)
            return NotFound();

        var name = request.Name.Trim();
        if (string.IsNullOrEmpty(name))
            return BadRequest(new { message = "El nombre es obligatorio." });

        if (await _db.Categories.AnyAsync(c => c.Name == name && c.Id != id, cancellationToken))
            return Conflict(new { message = "Ya existe una categoría con ese nombre." });

        entity.Name = name;
        entity.SortOrder = request.SortOrder;
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new CategoryDto
        {
            Id = entity.Id,
            Name = entity.Name,
            SortOrder = entity.SortOrder
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (entity is null)
            return NotFound();

        if (await _db.Products.AnyAsync(p => p.CategoryId == id, cancellationToken))
            return Conflict(new { message = "No se puede eliminar: hay productos en esta categoría." });

        _db.Categories.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
