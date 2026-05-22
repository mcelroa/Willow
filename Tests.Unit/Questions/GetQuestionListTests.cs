using Application.Core;
using Application.Core.Interfaces;
using Application.Questions.Queries;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.Questions;

public class GetQuestionListTests
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
    public async Task Handle_ReturnsOnlyCurrentUserQuestions()
    {
        var context = CreateContext();
        context.Questions.AddRange(
            new Question { UserId = "user-1", Text = "Q1", CreatedAt = new DateOnly(2025, 1, 1) },
            new Question { UserId = "user-1", Text = "Q2", CreatedAt = new DateOnly(2025, 1, 2) },
            new Question { UserId = "user-2", Text = "Q3", CreatedAt = new DateOnly(2025, 1, 1) }
        );
        await context.SaveChangesAsync();

        var handler = new GetQuestionList.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(new GetQuestionList.Query(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value!.Count);
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenUserHasNoQuestions()
    {
        var context = CreateContext();

        var handler = new GetQuestionList.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(new GetQuestionList.Query(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value!);
    }

    [Fact]
    public async Task Handle_ReturnsPendingBeforeAsked()
    {
        var context = CreateContext();
        context.Questions.AddRange(
            new Question { UserId = "user-1", Text = "Asked Q", IsAsked = true, CreatedAt = new DateOnly(2025, 1, 3) },
            new Question { UserId = "user-1", Text = "Pending Q", IsAsked = false, CreatedAt = new DateOnly(2025, 1, 1) }
        );
        await context.SaveChangesAsync();

        var handler = new GetQuestionList.Handler(context, CreateMapper(), MockUserAccessor("user-1"));
        var result = await handler.Handle(new GetQuestionList.Query(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Pending Q", result.Value![0].Text);
        Assert.Equal("Asked Q", result.Value[1].Text);
    }
}
