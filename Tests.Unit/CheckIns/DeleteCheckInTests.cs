using Application.CheckIns.Commands;
using Application.Core.Interfaces;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.CheckIns;

public class DeleteCheckInTests
{
    private AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static IUserAccessor MockUserAccessor(string userId)
    {
        var mock = new Mock<IUserAccessor>();
        mock.Setup(x => x.GetUserId()).Returns(userId);
        return mock.Object;
    }

    [Fact]
    public async Task Handle_DeletesCheckIn_WhenOwner()
    {
        var context = CreateContext();
        var checkIn = new CheckIn
        {
            UserId = "user-1",
            Date = new DateOnly(2025, 1, 1),
            Mood = 7,
            Pain = 3,
            Fatigue = 4,
            Nausea = 2
        };
        context.CheckIns.Add(checkIn);
        await context.SaveChangesAsync();

        var handler = new DeleteCheckIn.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new DeleteCheckIn.Command { Id = checkIn.Id }, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(context.CheckIns);
    }

    [Fact]
    public async Task Handle_Returns404_WhenCheckInNotFound()
    {
        var context = CreateContext();

        var handler = new DeleteCheckIn.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new DeleteCheckIn.Command { Id = "nonexistent-id" }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.Code);
    }

    [Fact]
    public async Task Handle_Returns404_WhenNotOwner()
    {
        var context = CreateContext();
        var checkIn = new CheckIn
        {
            UserId = "user-2",
            Date = new DateOnly(2025, 1, 1),
            Mood = 7,
            Pain = 3,
            Fatigue = 4,
            Nausea = 2
        };
        context.CheckIns.Add(checkIn);
        await context.SaveChangesAsync();

        var handler = new DeleteCheckIn.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new DeleteCheckIn.Command { Id = checkIn.Id }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.Code);
        Assert.Single(context.CheckIns);
    }
}
