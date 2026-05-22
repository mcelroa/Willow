using Application.Core;
using Application.Core.Interfaces;
using Application.Questions.Commands;
using Application.Questions.DTOs;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.Questions;

public class CreateQuestionTests
{
    private AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private IMapper CreateMapper() =>
        new MapperConfiguration(cfg => cfg.AddProfile<MappingProfiles>())
            .CreateMapper();

    private static IUserAccessor MockUserAccessor(string userId)
    {
        var mock = new Mock<IUserAccessor>();
        mock.Setup(x => x.GetUserId()).Returns(userId);
        return mock.Object;
    }

    [Fact]
    public async Task Handle_CreatesQuestion_AndReturnsId()
    {
        var context = CreateContext();
        var dto = new CreateQuestionDto { Text = "What are the side effects?" };

        var handler = new CreateQuestion.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new CreateQuestion.Command { Dto = dto }, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Single(context.Questions);
    }

    [Fact]
    public async Task Handle_AssignsCorrectUserAndDate()
    {
        var context = CreateContext();
        var dto = new CreateQuestionDto { Text = "When is my next appointment?" };

        var handler = new CreateQuestion.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        await handler.Handle(new CreateQuestion.Command { Dto = dto }, CancellationToken.None);

        var saved = context.Questions.Single();
        Assert.Equal("user-1", saved.UserId);
        Assert.Equal(DateOnly.FromDateTime(DateTime.UtcNow), saved.CreatedAt);
        Assert.False(saved.IsAsked);
    }
}
