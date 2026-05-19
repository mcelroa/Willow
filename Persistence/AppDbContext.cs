using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public required DbSet<CheckIn> CheckIns { get; set; }
    public required DbSet<Question> Questions { get; set; }
}
