using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Persistence;

namespace Tests.Integration;

public class WillowWebApplicationFactory : WebApplicationFactory<Program>
{
    // Shared service provider so all test instances use the same in-memory DB store.
    private static readonly IServiceProvider _inMemoryEfServiceProvider =
        new ServiceCollection()
            .AddEntityFrameworkInMemoryDatabase()
            .BuildServiceProvider();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "integration-test-key-that-is-long-enough-for-hmac-sha512-hashing-yes-it-is",
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=test_placeholder"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(AppDbContext));
            services.AddDbContext<AppDbContext>(opt =>
                opt.UseInMemoryDatabase("IntegrationTestDb")
                   .UseInternalServiceProvider(_inMemoryEfServiceProvider));
        });
    }
}
