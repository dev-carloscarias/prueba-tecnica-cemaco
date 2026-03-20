using CemacoPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CemacoPlatform.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(c => c.Name).IsUnique();
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Sku).IsUnique();
            e.HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
