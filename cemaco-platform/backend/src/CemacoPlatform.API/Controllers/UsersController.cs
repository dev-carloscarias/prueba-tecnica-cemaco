using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CemacoPlatform.Application.DTOs.Users;
using CemacoPlatform.Domain.Entities;
using CemacoPlatform.Domain.Enums;
using CemacoPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemacoPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserListDto>>> List(CancellationToken cancellationToken)
    {
        var items = await _db.Users.AsNoTracking()
            .OrderBy(u => u.Email)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                Email = u.Email,
                Role = u.Role.ToString()
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<UserListDto>> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        if (!TryParseStaffRole(request.Role, out var role))
            return BadRequest(new { message = "Rol inválido. Use Admin o Colaborador." });

        var email = request.Email.Trim();
        if (string.IsNullOrEmpty(email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Correo y contraseña son obligatorios." });

        if (await _db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            return Conflict(new { message = "Ya existe un usuario con ese correo." });

        var entity = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role
        };

        _db.Users.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new UserListDto
        {
            Id = entity.Id,
            Email = entity.Email,
            Role = entity.Role.ToString()
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (sub is not null && Guid.TryParse(sub, out var selfId) && selfId == id)
            return BadRequest(new { message = "No puedes eliminar tu propio usuario." });

        var entity = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (entity is null)
            return NotFound();

        if (entity.Role == UserRole.Admin)
        {
            var adminCount = await _db.Users.CountAsync(u => u.Role == UserRole.Admin, cancellationToken);
            if (adminCount <= 1)
                return BadRequest(new { message = "Debe existir al menos un administrador." });
        }

        _db.Users.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static bool TryParseStaffRole(string role, out UserRole parsed)
    {
        parsed = UserRole.Colaborador;
        if (string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            parsed = UserRole.Admin;
            return true;
        }

        if (string.Equals(role, "Colaborador", StringComparison.OrdinalIgnoreCase))
        {
            parsed = UserRole.Colaborador;
            return true;
        }

        return false;
    }
}
