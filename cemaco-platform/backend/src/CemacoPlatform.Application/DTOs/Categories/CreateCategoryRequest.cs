namespace CemacoPlatform.Application.DTOs.Categories;

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
