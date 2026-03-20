namespace CemacoPlatform.Application.DTOs.Products;

public class CreateProductRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Sku { get; set; } = string.Empty;
    public int Inventory { get; set; }
    public string? ImageUrl { get; set; }
}
