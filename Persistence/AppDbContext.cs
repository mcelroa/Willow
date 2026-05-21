using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<CheckIn> CheckIns { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
}
