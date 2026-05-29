using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Tests.Integration;

public class CheckInsControllerTests : IClassFixture<WillowWebApplicationFactory>
{
    private readonly WillowWebApplicationFactory _factory;

    public CheckInsControllerTests(WillowWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<string> RegisterAndGetTokenAsync()
    {
        var email = $"{Guid.NewGuid()}@test.com";
        var client = _factory.CreateClient();

        await client.PostAsJsonAsync("/api/account/register", new
        {
            email,
            username = Guid.NewGuid().ToString("N")[..10],
            password = "Pa$$w0rd"
        });

        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var user = await userManager.FindByEmailAsync(email);
        var confirmToken = await userManager.GenerateEmailConfirmationTokenAsync(user!);
        await userManager.ConfirmEmailAsync(user!, confirmToken);

        var loginResponse = await client.PostAsJsonAsync("/api/account/login", new
        {
            email,
            password = "Pa$$w0rd"
        });
        var body = await loginResponse.Content.ReadFromJsonAsync<UserDto>();
        return body!.Token;
    }

    private HttpClient CreateAuthenticatedClient(string token)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task GetCheckIns_Returns401_WhenNotAuthenticated()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/checkins");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCheckIns_Returns200_WhenAuthenticated()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var response = await client.GetAsync("/api/checkins");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateCheckIn_Returns200_WithValidData()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var response = await client.PostAsJsonAsync("/api/checkins", new
        {
            date = "2025-01-01",
            mood = 7,
            pain = 3,
            fatigue = 4,
            nausea = 2
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private record UserDto(string Token);
}
