using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Tests.Integration;

public class SharingControllerTests : IClassFixture<WillowWebApplicationFactory>
{
    private readonly WillowWebApplicationFactory _factory;

    public SharingControllerTests(WillowWebApplicationFactory factory)
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

    // --- Auth guard ---

    [Fact]
    public async Task List_Returns401_WhenNotAuthenticated()
    {
        var response = await _factory.CreateClient().GetAsync("/api/sharing");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_Returns401_WhenNotAuthenticated()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/sharing", new { });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Revoke_Returns401_WhenNotAuthenticated()
    {
        var response = await _factory.CreateClient().DeleteAsync("/api/sharing/some-id");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteRevoked_Returns401_WhenNotAuthenticated()
    {
        var response = await _factory.CreateClient().DeleteAsync("/api/sharing/revoked");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // --- Create ---

    [Fact]
    public async Task Create_Returns200_WithNoLabelOrExpiry()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var response = await client.PostAsJsonAsync("/api/sharing", new { });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Create_Returns200_WithLabelAndExpiry()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var expiry = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)).ToString("yyyy-MM-dd");

        var response = await client.PostAsJsonAsync("/api/sharing", new { label = "My oncologist", expiresAt = expiry });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ShareLinkDto>();
        Assert.Equal("My oncologist", body!.Label);
    }

    [Fact]
    public async Task Create_Returns400_WhenLabelTooLong()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var response = await client.PostAsJsonAsync("/api/sharing", new { label = new string('x', 101) });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_Returns400_WhenExpiryInPast()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)).ToString("yyyy-MM-dd");

        var response = await client.PostAsJsonAsync("/api/sharing", new { expiresAt = yesterday });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- List ---

    [Fact]
    public async Task List_Returns200_ContainsCreatedLink()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());

        var created = await (await client.PostAsJsonAsync("/api/sharing", new { label = "Caregiver" }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        var links = await client.GetFromJsonAsync<List<ShareLinkDto>>("/api/sharing");
        Assert.Contains(links!, l => l.Token == created!.Token && l.Label == "Caregiver");
    }

    // --- Revoke ---

    [Fact]
    public async Task Revoke_Returns204_WhenOwner()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());

        var link = await (await client.PostAsJsonAsync("/api/sharing", new { }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        var response = await client.DeleteAsync($"/api/sharing/{link!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Revoke_Returns404_WhenLinkBelongsToAnotherUser()
    {
        var ownerClient = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var otherClient = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());

        var link = await (await ownerClient.PostAsJsonAsync("/api/sharing", new { }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        var response = await otherClient.DeleteAsync($"/api/sharing/{link!.Id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Revoke_Returns404_WhenLinkDoesNotExist()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var response = await client.DeleteAsync("/api/sharing/00000000-0000-0000-0000-000000000000");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // --- DeleteRevoked ---

    [Fact]
    public async Task DeleteRevoked_Returns204_AndRemovesRevokedLinks()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());

        var linkA = await (await client.PostAsJsonAsync("/api/sharing", new { label = "Keep" }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();
        var linkB = await (await client.PostAsJsonAsync("/api/sharing", new { label = "Revoke me" }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        await client.DeleteAsync($"/api/sharing/{linkB!.Id}");

        var deleteResponse = await client.DeleteAsync("/api/sharing/revoked");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var remaining = await client.GetFromJsonAsync<List<ShareLinkDto>>("/api/sharing");
        Assert.Contains(remaining!, l => l.Id == linkA!.Id);
        Assert.DoesNotContain(remaining!, l => l.Id == linkB.Id);
    }

    // --- View (public) ---

    [Fact]
    public async Task View_Returns200_WithValidToken()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var link = await (await client.PostAsJsonAsync("/api/sharing", new { }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        var response = await _factory.CreateClient().GetAsync($"/api/sharing/view/{link!.Token}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task View_Returns200_WithoutAuthentication()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var link = await (await client.PostAsJsonAsync("/api/sharing", new { }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        // Unauthenticated client should still get 200
        var anonResponse = await _factory.CreateClient().GetAsync($"/api/sharing/view/{link!.Token}");
        Assert.Equal(HttpStatusCode.OK, anonResponse.StatusCode);
    }

    [Fact]
    public async Task View_Returns404_WithInvalidToken()
    {
        var response = await _factory.CreateClient().GetAsync("/api/sharing/view/not-a-real-token");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task View_Returns404_WhenRevoked()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var link = await (await client.PostAsJsonAsync("/api/sharing", new { }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        await client.DeleteAsync($"/api/sharing/{link!.Id}");

        var response = await _factory.CreateClient().GetAsync($"/api/sharing/view/{link.Token}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task View_UpdatesLastViewedAt()
    {
        var client = CreateAuthenticatedClient(await RegisterAndGetTokenAsync());
        var link = await (await client.PostAsJsonAsync("/api/sharing", new { }))
            .Content.ReadFromJsonAsync<ShareLinkDto>();

        var before = await client.GetFromJsonAsync<List<ShareLinkDto>>("/api/sharing");
        Assert.Null(before!.Single(l => l.Id == link!.Id).LastViewedAt);

        await _factory.CreateClient().GetAsync($"/api/sharing/view/{link!.Token}");

        var after = await client.GetFromJsonAsync<List<ShareLinkDto>>("/api/sharing");
        Assert.NotNull(after!.Single(l => l.Id == link.Id).LastViewedAt);
    }

    private record UserDto(string Token);
    private record ShareLinkDto(string Id, string Token, string? Label, bool IsRevoked, DateTimeOffset? LastViewedAt);
}
