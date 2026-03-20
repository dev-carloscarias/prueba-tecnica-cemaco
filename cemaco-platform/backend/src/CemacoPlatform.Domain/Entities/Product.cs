namespace CemacoPlatform.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Sku { get; set; } = string.Empty;
    public int Inventory { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
