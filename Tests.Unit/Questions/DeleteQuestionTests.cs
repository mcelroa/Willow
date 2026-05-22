using Application.Core.Interfaces;
using Application.Questions.Commands;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.Questions;

public class DeleteQuestionTests
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
    public async Task Handle_DeletesQuestion_WhenOwner()
    {
        var context = CreateContext();
        var question = new Question { UserId = "user-1", Text = "Is this normal?", CreatedAt = new DateOnly(2025, 1, 1) };
        context.Questions.Add(question);
        await context.SaveChangesAsync();

        var handler = new DeleteQuestion.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new DeleteQuestion.Command { Id = question.Id }, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(context.Questions);
    }

    [Fact]
    public async Task Handle_Returns404_WhenQuestionNotFound()
    {
        var context = CreateContext();

        var handler = new DeleteQuestion.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new DeleteQuestion.Command { Id = "nonexistent-id" }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.Code);
    }

    [Fact]
    public async Task Handle_Returns404_WhenNotOwner()
    {
        var context = CreateContext();
        var question = new Question { UserId = "user-2", Text = "Can I eat this?", CreatedAt = new DateOnly(2025, 1, 1) };
        context.Questions.Add(question);
        await context.SaveChangesAsync();

        var handler = new DeleteQuestion.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new DeleteQuestion.Command { Id = question.Id }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.Code);
        Assert.Single(context.Questions);
    }
}
