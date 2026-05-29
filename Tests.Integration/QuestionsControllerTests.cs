using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Tests.Integration;

public class QuestionsControllerTests : IClassFixture<WillowWebApplicationFactory>
{
    private readonly WillowWebApplicationFactory _factory;

    public QuestionsControllerTests(WillowWebApplicationFactory factory)
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
    public async Task GetQuestions_Returns401_WhenNotAuthenticated()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/questions");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetQuestions_Returns200_WhenAuthenticated()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var response = await client.GetAsync("/api/questions");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateQuestion_Returns200_WithValidData()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var response = await client.PostAsJsonAsync("/api/questions", new { text = "What are my options?" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateQuestion_Returns400_WithEmptyText()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var response = await client.PostAsJsonAsync("/api/questions", new { text = "" });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteQuestion_Returns204_WhenOwner()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var create = await client.PostAsJsonAsync("/api/questions", new { text = "Will this affect my sleep?" });
        var id = (await create.Content.ReadAsStringAsync()).Trim('"');

        var response = await client.DeleteAsync($"/api/questions/{id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task MarkAsked_Returns204_WhenOwner()
    {
        var token = await RegisterAndGetTokenAsync();
        var client = CreateAuthenticatedClient(token);

        var create = await client.PostAsJsonAsync("/api/questions", new { text = "Any dietary restrictions?" });
        var id = (await create.Content.ReadAsStringAsync()).Trim('"');

        var response = await client.PatchAsync($"/api/questions/{id}/mark-asked", null);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private record UserDto(string Token);
}
