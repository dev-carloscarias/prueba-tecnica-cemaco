namespace CemacoPlatform.Application.Interfaces;

public interface IJwtTokenService
{
    string CreateToken(string userId, string email, string role);
}
