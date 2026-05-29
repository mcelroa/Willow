using System.Net;
using System.Net.Http.Json;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Tests.Integration;

public class AccountControllerTests : IClassFixture<WillowWebApplicationFactory>
{
    private readonly WillowWebApplicationFactory _factory;

    public AccountControllerTests(WillowWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_ReturnsOk_AndRequiresEmailVerification()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/account/register", new
        {
            email = $"{Guid.NewGuid()}@test.com",
            username = Guid.NewGuid().ToString("N")[..10],
            password = "Pa$$w0rd"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Empty(body);
    }

    [Fact]
    public async Task Login_ReturnsToken_WithValidCredentials()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@test.com";
        const string password = "Pa$$w0rd";

        await client.PostAsJsonAsync("/api/account/register", new
        {
            email,
            username = Guid.NewGuid().ToString("N")[..10],
            password
        });

        var response = await client.PostAsJsonAsync("/api/account/login", new
        {
            email,
            password
        });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(body?.Token);
    }

    [Fact]
    public async Task VerifyEmail_ReturnsOk_WithValidToken()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@test.com";

        await client.PostAsJsonAsync("/api/account/register", new
        {
            email,
            username = Guid.NewGuid().ToString("N")[..10],
            password = "Pa$$w0rd"
        });

        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var user = await userManager.FindByEmailAsync(email);
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user!);

        var response = await client.GetAsync(
            $"/api/account/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private record UserDto(string Token);
}
