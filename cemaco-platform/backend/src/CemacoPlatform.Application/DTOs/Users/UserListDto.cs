namespace CemacoPlatform.Application.DTOs.Users;

public class UserListDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
