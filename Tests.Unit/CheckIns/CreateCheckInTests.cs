using Application.CheckIns.Commands;
using Application.CheckIns.DTOs;
using Application.Core;
using Application.Core.Interfaces;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.CheckIns;

public class CreateCheckInTests
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
    public async Task Handle_CreatesCheckIn_AndReturnsId()
    {
        var context = CreateContext();
        var dto = new SaveCheckInDto
        {
            Date = new DateOnly(2025, 1, 1),
            Mood = 7,
            Pain = 3,
            Fatigue = 4,
            Nausea = 2
        };

        var handler = new CreateCheckIn.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new CreateCheckIn.Command { CheckInDto = dto }, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Single(context.CheckIns);
    }

    [Fact]
    public async Task Handle_Fails_WhenDuplicateDateExists()
    {
        var context = CreateContext();
        context.CheckIns.Add(new CheckIn
        {
            UserId = "user-1",
            Date = new DateOnly(2025, 1, 1),
            Mood = 5,
            Pain = 5,
            Fatigue = 5,
            Nausea = 5
        });
        await context.SaveChangesAsync();

        var dto = new SaveCheckInDto { Date = new DateOnly(2025, 1, 1), Mood = 7, Pain = 3, Fatigue = 4, Nausea = 2 };

        var handler = new CreateCheckIn.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new CreateCheckIn.Command { CheckInDto = dto }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.Code);
    }
}
