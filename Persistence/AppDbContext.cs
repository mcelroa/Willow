using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<CheckIn> CheckIns { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<ShareLink> ShareLinks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<CheckIn>()
            .HasIndex(c => new { c.UserId, c.Date })
            .IsUnique();

        builder.Entity<CheckIn>()
            .Property(c => c.Weight)
            .HasPrecision(5, 1);

        builder.Entity<ShareLink>()
            .HasIndex(s => s.Token)
            .IsUnique();
    }
}
