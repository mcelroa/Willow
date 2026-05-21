using System.Net.Http.Json;

namespace Tests.Integration;

public class AccountControllerTests : IClassFixture<WillowWebApplicationFactory>
{
    private readonly WillowWebApplicationFactory _factory;

    public AccountControllerTests(WillowWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_ReturnsToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/account/register", new
        {
            email = $"{Guid.NewGuid()}@test.com",
            username = Guid.NewGuid().ToString("N")[..10],
            password = "Pa$$w0rd"
        });

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(body?.Token);
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

    private record UserDto(string Token);
}
