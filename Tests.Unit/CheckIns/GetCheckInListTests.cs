using Application.CheckIns.Queries;
using Application.Core;
using Application.Core.Interfaces;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.CheckIns;

public class GetCheckInListTests
{
    private AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private IMapper CreateMapper() =>
        new MapperConfiguration(cfg => cfg.AddProfile<MappingProfiles>())
        .CreateMapper();

    private IUserAccessor MockUserAccessor(string userId)
    {
        var mock = new Mock<IUserAccessor>();
        mock.Setup(x => x.GetUserId()).Returns(userId);
        return mock.Object;
    }

    [Fact]
    public async Task Handle_ReturnsOnlyCurrentUserCheckIns()
    {
        var context = CreateContext();
        context.CheckIns.AddRange(
            new CheckIn { UserId = "user-1", Date = new DateOnly(2025, 1, 1), Mood = 7, Pain = 3, Fatigue = 4, Nausea = 2 },
            new CheckIn { UserId = "user-1", Date = new DateOnly(2025, 1, 2), Mood = 6, Pain = 4, Fatigue = 5, Nausea = 1 },
            new CheckIn { UserId = "user-2", Date = new DateOnly(2025, 1, 1), Mood = 5, Pain = 5, Fatigue = 5, Nausea = 5 }
        );
        await context.SaveChangesAsync();

        var handler = new GetCheckInList.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(new GetCheckInList.Query(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value!.Count);
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenUserHasNoCheckIns()
    {
        var context = CreateContext();

        var handler = new GetCheckInList.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(new GetCheckInList.Query(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value!);
    }
}